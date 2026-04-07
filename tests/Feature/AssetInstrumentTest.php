<?php

use App\Models\Asset;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function createWorkspaceForUser(User $owner): Workspace
{
    return Workspace::create([
        'name' => 'Test WS',
        'slug' => 'ws-' . Str::random(12),
        'owner_id' => $owner->id,
    ]);
}

test('guests cannot post bulk instrument', function () {
    $this->post(route('assets.bulk-instrument'), [
        'ids' => [1],
        'is_instrument' => true,
    ])->assertRedirect();
});

test('bulk instrument updates only assets in current workspace', function () {
    $user = User::factory()->create(['type' => 'superadmin']);

    $wsA = createWorkspaceForUser($user);
    $wsB = createWorkspaceForUser($user);

    $user->update(['current_workspace_id' => $wsA->id]);

    $assetA = Asset::create([
        'workspace_id' => $wsA->id,
        'name' => 'Asset A',
        'status' => 'active',
        'is_instrument' => false,
    ]);
    $assetB = Asset::create([
        'workspace_id' => $wsB->id,
        'name' => 'Asset B',
        'status' => 'active',
        'is_instrument' => false,
    ]);

    $this->actingAs($user)->post(route('assets.bulk-instrument'), [
        'ids' => [$assetA->id, $assetB->id],
        'is_instrument' => true,
    ])->assertRedirect();

    expect($assetA->fresh()->is_instrument)->toBeTrue();
    expect($assetB->fresh()->is_instrument)->toBeFalse();
});

test('bulk instrument validation requires ids', function () {
    $user = User::factory()->create(['type' => 'superadmin']);
    $ws = createWorkspaceForUser($user);
    $user->update(['current_workspace_id' => $ws->id]);

    $this->actingAs($user)->from(route('assets.index'))->post(route('assets.bulk-instrument'), [
        'is_instrument' => true,
    ])->assertSessionHasErrors(['ids']);
});
