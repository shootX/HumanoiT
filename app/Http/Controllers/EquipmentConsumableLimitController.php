<?php

namespace App\Http\Controllers;

use App\Models\EquipmentConsumableLimit;
use App\Models\EquipmentType;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;

class EquipmentConsumableLimitController extends Controller
{
    use HasPermissionChecks;

    public function index(EquipmentType $equipmentType)
    {
        $this->authorizePermission('equipment_type_manage');

        if ($equipmentType->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $limits = $equipmentType->consumableLimits;

        return response()->json(['limits' => $limits]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('equipment_type_manage');

        $validated = $request->validate([
            'equipment_type_id' => 'required|exists:equipment_types,id',
            'consumable_type' => 'required|string|max:100',
            'max_quantity' => 'required|numeric|min:0',
            'unit' => 'nullable|string|max:20',
        ]);

        $type = EquipmentType::findOrFail($validated['equipment_type_id']);
        if ($type->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        EquipmentConsumableLimit::updateOrCreate(
            [
                'equipment_type_id' => $validated['equipment_type_id'],
                'consumable_type' => $validated['consumable_type'],
            ],
            [
                'max_quantity' => $validated['max_quantity'],
                'unit' => $validated['unit'] ?? 'kg',
            ]
        );

        return back()->with('success', __('Limit saved.'));
    }

    public function destroy(EquipmentConsumableLimit $equipmentConsumableLimit)
    {
        $this->authorizePermission('equipment_type_manage');

        if ($equipmentConsumableLimit->equipmentType->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $equipmentConsumableLimit->delete();

        return back()->with('success', __('Limit removed.'));
    }
}
