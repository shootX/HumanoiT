<?php

namespace App\Http\Controllers;

use App\Models\EquipmentType;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentTypeController extends Controller
{
    use HasPermissionChecks;

    public function index(): Response
    {
        $this->authorizePermission('equipment_type_manage');

        $user = auth()->user();
        $types = EquipmentType::forWorkspace($user->current_workspace_id)
            ->withCount('equipment')
            ->ordered()
            ->get();

        return Inertia::render('equipment-types/Index', [
            'types' => $types,
            'permissions' => [
                'create' => $this->checkPermission('equipment_type_manage'),
                'update' => $this->checkPermission('equipment_type_manage'),
                'delete' => $this->checkPermission('equipment_type_manage'),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('equipment_type_manage');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $maxOrder = EquipmentType::forWorkspace(auth()->user()->current_workspace_id)->max('order') ?? 0;

        EquipmentType::create([
            ...$validated,
            'workspace_id' => auth()->user()->current_workspace_id,
            'order' => $maxOrder + 1,
        ]);

        return back()->with('success', __('Equipment type created successfully!'));
    }

    public function update(Request $request, EquipmentType $equipmentType)
    {
        $this->authorizePermission('equipment_type_manage');

        if ($equipmentType->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $equipmentType->update($validated);

        return back()->with('success', __('Equipment type updated successfully!'));
    }

    public function destroy(EquipmentType $equipmentType)
    {
        $this->authorizePermission('equipment_type_manage');

        if ($equipmentType->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        if ($equipmentType->equipment()->count() > 0) {
            return back()->with('error', __('Cannot delete type with existing equipment'));
        }

        $equipmentType->delete();

        return back()->with('success', __('Equipment type deleted successfully!'));
    }
}
