<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentSchedule;
use App\Models\ServiceType;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipmentScheduleController extends Controller
{
    use HasPermissionChecks;

    public function index(Request $request)
    {
        $this->authorizePermission('equipment_view_any');

        $user = auth()->user();
        $workspaceId = $user->current_workspace_id;

        $query = EquipmentSchedule::with(['equipment.project', 'equipment.equipmentType', 'serviceType'])
            ->whereHas('equipment', fn ($q) => $q->forWorkspace($workspaceId));

        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $query->whereHas('equipment', fn ($q) => $q->forProject($request->project_id));
        }

        if ($request->filled('equipment_type_id') && $request->equipment_type_id !== 'all') {
            $query->whereHas('equipment', fn ($q) => $q->byType($request->equipment_type_id));
        }

        if ($request->filled('service_type_id') && $request->service_type_id !== 'all') {
            $query->where('service_type_id', $request->service_type_id);
        }

        $schedules = $query->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'equipment_id' => $s->equipment_id,
                'service_type_id' => $s->service_type_id,
                'equipment' => $s->equipment,
                'service_type' => $s->serviceType->name,
                'interval_days' => $s->interval_days,
                'advance_days' => $s->advance_days,
                'last_service_date' => $s->last_service_date?->format('Y-m-d'),
                'next_service_date' => $s->next_service_date?->format('Y-m-d'),
                'task_due_date' => $s->task_due_date?->format('Y-m-d'),
            ];
        });

        $projects = \App\Models\Project::forWorkspace($workspaceId)->orderBy('title')->get(['id', 'title']);
        $equipmentTypes = \App\Models\EquipmentType::forWorkspace($workspaceId)->ordered()->get(['id', 'name']);
        $serviceTypes = ServiceType::forWorkspace($workspaceId)->ordered()->get(['id', 'name']);
        $equipment = Equipment::forWorkspace($workspaceId)->with('project')->orderBy('name')->get(['id', 'name', 'project_id']);

        return Inertia::render('equipment-schedule/Index', [
            'schedules' => $schedules,
            'projects' => $projects,
            'equipmentTypes' => $equipmentTypes,
            'serviceTypes' => $serviceTypes,
            'equipment' => $equipment,
            'filters' => $request->only(['project_id', 'equipment_type_id', 'service_type_id']),
            'canManage' => $this->checkPermission('equipment_update'),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('equipment_update');

        $validated = $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'service_type_id' => 'required|exists:service_types,id',
            'interval_days' => 'required|integer|min:1',
            'advance_days' => 'required|integer|min:0',
            'last_service_date' => 'nullable|date',
        ]);

        $equipment = Equipment::findOrFail($validated['equipment_id']);
        if ($equipment->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        EquipmentSchedule::updateOrCreate(
            [
                'equipment_id' => $validated['equipment_id'],
                'service_type_id' => $validated['service_type_id'],
            ],
            [
                'interval_days' => $validated['interval_days'],
                'advance_days' => $validated['advance_days'],
                'last_service_date' => $validated['last_service_date'] ?? null,
            ]
        );

        return back()->with('success', __('Schedule created successfully!'));
    }

    public function update(Request $request, EquipmentSchedule $equipmentSchedule)
    {
        $this->authorizePermission('equipment_update');

        if ($equipmentSchedule->equipment->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $validated = $request->validate([
            'interval_days' => 'required|integer|min:1',
            'advance_days' => 'required|integer|min:0',
            'last_service_date' => 'nullable|date',
        ]);

        $equipmentSchedule->update($validated);

        return back()->with('success', __('Schedule updated successfully!'));
    }

    public function destroy(EquipmentSchedule $equipmentSchedule)
    {
        $this->authorizePermission('equipment_update');

        if ($equipmentSchedule->equipment->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $equipmentSchedule->delete();

        return back()->with('success', __('Schedule deleted successfully!'));
    }
}
