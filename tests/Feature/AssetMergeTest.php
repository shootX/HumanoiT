<?php

use App\Models\Asset;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function mergeTestWorkspace(User $owner): Workspace
{
    return Workspace::create([
        'name' => 'Merge WS',
        'slug' => 'ws-' . Str::random(12),
        'owner_id' => $owner->id,
    ]);
}

test('guests cannot post asset merge', function () {
    $this->post(route('assets.merge'), [
        'primary_asset_id' => 1,
        'merge_asset_ids' => [2],
        'name' => 'Merged',
    ])->assertRedirect();
});

test('merge sets merged_into and updates primary without touching invoice_items', function () {
    $user = User::factory()->create(['type' => 'superadmin']);
    $ws = mergeTestWorkspace($user);
    $user->update(['current_workspace_id' => $ws->id]);

    $primary = Asset::create([
        'workspace_id' => $ws->id,
        'name' => 'Primary Name',
        'status' => 'active',
        'is_instrument' => false,
        'quantity' => 3,
    ]);
    $secondary = Asset::create([
        'workspace_id' => $ws->id,
        'name' => 'Secondary Name',
        'status' => 'active',
        'is_instrument' => false,
        'quantity' => 2,
    ]);

    $project = \App\Models\Project::create([
        'workspace_id' => $ws->id,
        'title' => 'P1',
        'created_by' => $user->id,
    ]);

    $invoice = \App\Models\Invoice::create([
        'invoice_number' => 'INV-MERGE-1',
        'project_id' => $project->id,
        'workspace_id' => $ws->id,
        'created_by' => $user->id,
        'title' => 'T',
        'invoice_date' => now()->toDateString(),
        'due_date' => now()->addWeek()->toDateString(),
        'total_amount' => 100,
        'status' => 'draft',
    ]);

    \DB::table('invoice_items')->insert([
        'invoice_id' => $invoice->id,
        'type' => 'asset',
        'description' => 'Line',
        'quantity' => 1,
        'rate' => 10,
        'amount' => 10,
        'asset_id' => $secondary->id,
        'sort_order' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($user)->post(route('assets.merge'), [
        'primary_asset_id' => $primary->id,
        'merge_asset_ids' => [$secondary->id],
        'name' => 'Unified',
    ])->assertRedirect(route('assets.show', $primary->id));

    expect($secondary->fresh()->merged_into_asset_id)->toBe($primary->id);
    expect($primary->fresh()->name)->toBe('Unified');
    expect((float) $primary->fresh()->quantity)->toBe(5.0);

    $row = \DB::table('invoice_items')->where('invoice_id', $invoice->id)->first();
    expect((int) $row->asset_id)->toBe($secondary->id);
});

test('merge validation requires merge_asset_ids', function () {
    $user = User::factory()->create(['type' => 'superadmin']);
    $ws = mergeTestWorkspace($user);
    $user->update(['current_workspace_id' => $ws->id]);

    $a = Asset::create(['workspace_id' => $ws->id, 'name' => 'A', 'status' => 'active', 'is_instrument' => false]);

    $this->actingAs($user)->from(route('assets.index'))->post(route('assets.merge'), [
        'primary_asset_id' => $a->id,
        'name' => 'X',
    ])->assertSessionHasErrors(['merge_asset_ids']);
});
