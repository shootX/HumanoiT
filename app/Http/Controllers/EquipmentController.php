<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentType;
use App\Models\Project;
use App\Models\ServiceType;
use App\Models\Task;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentController extends Controller
{
    use HasPermissionChecks;

    public function index(Request $request): Response
    {
        $this->authorizePermission('equipment_view_any');

        $user = auth()->user();
        $workspaceId = $user->current_workspace_id;

        $query = Equipment::forWorkspace($workspaceId)->with(['project', 'equipmentType']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $query->forProject($request->project_id);
        }

        if ($request->filled('equipment_type_id') && $request->equipment_type_id !== 'all') {
            $query->byType($request->equipment_type_id);
        }

        if ($request->filled('health_status') && $request->health_status !== 'all') {
            $query->byHealthStatus($request->health_status);
        }

        $perPage = $request->get('per_page', 30);
        $equipment = $query->latest()->paginate($perPage)->withQueryString();

        $projects = Project::forWorkspace($workspaceId)->orderBy('title')->get(['id', 'title']);
        $equipmentTypes = EquipmentType::forWorkspace($workspaceId)->ordered()->get(['id', 'name']);

        return Inertia::render('equipment/Index', [
            'equipment' => $equipment,
            'projects' => $projects,
            'equipmentTypes' => $equipmentTypes,
            'filters' => $request->only(['search', 'project_id', 'equipment_type_id', 'health_status', 'per_page']),
            'canDelete' => $this->checkPermission('equipment_delete'),
        ]);
    }

    public function edit(Equipment $equipment): Response
    {
        $this->authorizePermission('equipment_update');

        if ($equipment->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $projects = Project::forWorkspace($equipment->workspace_id)->orderBy('title')->get(['id', 'title']);
        $equipmentTypes = EquipmentType::forWorkspace($equipment->workspace_id)->ordered()->get(['id', 'name']);

        return Inertia::render('equipment/Edit', [
            'equipment' => $equipment,
            'projects' => $projects,
            'equipmentTypes' => $equipmentTypes,
        ]);
    }

    public function show(Equipment $equipment): Response
    {
        $this->authorizePermission('equipment_view');

        if ($equipment->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $equipment->load([
            'project', 'equipmentType', 'schedules.serviceType',
            'tasks' => fn ($q) => $q->with(['project', 'taskStage', 'assignedTo'])->latest()->limit(10),
        ]);

        $completedServices = Task::where('equipment_id', $equipment->id)
            ->where('progress', 100)
            ->with(['project', 'taskStage', 'assignedTo', 'equipmentSchedule.serviceType'])
            ->orderBy('end_date', 'desc')
            ->limit(20)
            ->get();

        $upcomingSchedules = $equipment->schedules->map(function ($s) {
            return [
                'id' => $s->id,
                'service_type' => $s->serviceType->name,
                'next_service_date' => $s->next_service_date?->format('Y-m-d'),
                'task_due_date' => $s->task_due_date?->format('Y-m-d'),
            ];
        });

        return Inertia::render('equipment/Show', [
            'equipment' => $equipment,
            'completedServices' => $completedServices,
            'upcomingSchedules' => $upcomingSchedules,
            'canDelete' => $this->checkPermission('equipment_delete'),
        ]);
    }

    public function showByQr(string $token): Response
    {
        $equipment = Equipment::where('qr_token', $token)->firstOrFail();

        if ($equipment->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        return $this->show($equipment);
    }

    public function create(): Response
    {
        $this->authorizePermission('equipment_create');

        $user = auth()->user();
        $projects = Project::forWorkspace($user->current_workspace_id)->orderBy('title')->get(['id', 'title']);
        $equipmentTypes = EquipmentType::forWorkspace($user->current_workspace_id)->ordered()->get(['id', 'name']);

        return Inertia::render('equipment/Create', [
            'projects' => $projects,
            'equipmentTypes' => $equipmentTypes,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('equipment_create');

        $workspaceId = auth()->user()->current_workspace_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            'equipment_type_id' => 'required|exists:equipment_types,id',
            'installation_date' => 'nullable|date',
            'last_service_date' => 'nullable|date',
            'health_status' => 'required|in:green,yellow,red',
            'notes' => 'nullable|string',
        ]);

        $project = Project::find($validated['project_id']);
        if ($project->workspace_id !== $workspaceId) {
            abort(403);
        }

        Equipment::create([
            ...$validated,
            'workspace_id' => $workspaceId,
        ]);

        return redirect()->route('equipment.index')->with('success', __('Equipment created successfully!'));
    }

    public function update(Request $request, Equipment $equipment)
    {
        $this->authorizePermission('equipment_update');

        if ($equipment->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            'equipment_type_id' => 'required|exists:equipment_types,id',
            'installation_date' => 'nullable|date',
            'last_service_date' => 'nullable|date',
            'health_status' => 'required|in:green,yellow,red',
            'notes' => 'nullable|string',
        ]);

        $project = Project::find($validated['project_id']);
        if ($project->workspace_id !== $equipment->workspace_id) {
            abort(403);
        }

        $equipment->update($validated);

        return back()->with('success', __('Equipment updated successfully!'));
    }

    public function destroy(Equipment $equipment)
    {
        $this->authorizePermission('equipment_delete');

        if ($equipment->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $equipment->delete();

        return redirect()->route('equipment.index')->with('success', __('Equipment deleted successfully!'));
    }
}
