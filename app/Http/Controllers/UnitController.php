<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $units = Unit::forWorkspace($user->current_workspace_id)
            ->withCount('assets')
            ->orderBy('name')
            ->get();

        $can = $user->canManageWorkspaceUnits();

        return Inertia::render('units/Index', [
            'units' => $units,
            'permissions' => [
                'create' => $can,
                'update' => $can,
                'delete' => $can,
            ]
        ]);
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:50',
        ]);

        Unit::create([
            ...$validated,
            'workspace_id' => auth()->user()->current_workspace_id,
        ]);

        return back()->with('success', __('Unit created successfully!'));
    }

    public function update(Request $request, Unit $unit)
    {

        if ($unit->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:50',
        ]);

        $unit->update($validated);

        return back()->with('success', __('Unit updated successfully!'));
    }

    public function destroy(Unit $unit)
    {

        if ($unit->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        if ($unit->assets()->count() > 0) {
            return back()->with('error', __('Cannot delete unit with existing assets'));
        }

        $unit->delete();

        return back()->with('success', __('Unit deleted successfully!'));
    }
}
