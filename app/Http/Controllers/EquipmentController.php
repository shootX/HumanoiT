<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentType;
use App\Models\Project;
use App\Models\ServiceType;
use App\Models\Task;
use App\Traits\HasPermissionChecks;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
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
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
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

        $perPage = $request->get('per_page', 50);
        $equipment = $query->latest()->paginate($perPage)->withQueryString();

        $projects = Project::forWorkspace($workspaceId)->orderBy('title')->get(['id', 'title']);
        $equipmentTypes = EquipmentType::forWorkspace($workspaceId)->ordered()->get(['id', 'name']);

        $baseQuery = Equipment::forWorkspace($workspaceId);
        $byType = (clone $baseQuery)->selectRaw('equipment_type_id, count(*) as cnt')
            ->groupBy('equipment_type_id')
            ->get()
            ->map(function ($r) {
                $type = EquipmentType::find($r->equipment_type_id);
                return ['name' => $type?->name ?? '—', 'count' => (int) $r->cnt];
            })
            ->values()
            ->all();
        $metrics = [
            'total' => (clone $baseQuery)->count(),
            'by_type' => $byType,
            'by_status' => [
                'green' => (clone $baseQuery)->where('health_status', 'green')->count(),
                'yellow' => (clone $baseQuery)->where('health_status', 'yellow')->count(),
                'red' => (clone $baseQuery)->where('health_status', 'red')->count(),
            ],
        ];

        return Inertia::render('equipment/Index', [
            'equipment' => $equipment,
            'projects' => $projects,
            'equipmentTypes' => $equipmentTypes,
            'metrics' => $metrics,
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
            ->orderByRaw('end_date IS NULL ASC, end_date DESC')
            ->get();

        $upcomingSchedules = $equipment->schedules->map(function ($s) {
            return [
                'id' => $s->id,
                'service_type' => $s->serviceType->name,
                'next_service_date' => $s->next_service_date?->format('Y-m-d'),
                'task_due_date' => $s->task_due_date?->format('Y-m-d'),
            ];
        });

        $serviceTypes = ServiceType::forWorkspace($equipment->workspace_id)->ordered()->get(['id', 'name']);

        return Inertia::render('equipment/Show', [
            'equipment' => $equipment,
            'completedServices' => $completedServices,
            'upcomingSchedules' => $upcomingSchedules,
            'serviceTypes' => $serviceTypes,
            'canDelete' => $this->checkPermission('equipment_delete'),
            'canManage' => $this->checkPermission('equipment_update'),
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
            'code' => 'nullable|string|max:32|unique:equipment,code',
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

        $createData = collect($validated)->filter(fn ($v) => $v !== null && $v !== '')->all();
        Equipment::create([
            ...$createData,
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
            'code' => 'nullable|string|max:32|unique:equipment,code,' . $equipment->id,
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

        $updateData = collect($validated)->filter(fn ($v) => $v !== null && $v !== '')->all();
        $equipment->update($updateData);

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

    public function bulkDelete(Request $request)
    {
        $this->authorizePermission('equipment_delete');

        $workspaceId = auth()->user()->current_workspace_id;

        $validated = $request->validate([
            'equipment_ids' => 'required|array',
            'equipment_ids.*' => 'integer|exists:equipment,id',
        ]);

        $count = Equipment::forWorkspace($workspaceId)
            ->whereIn('id', $validated['equipment_ids'])
            ->delete();

        return back()->with('success', __(':count equipment deleted successfully!', ['count' => $count]));
    }

    public function bulkUpdate(Request $request)
    {
        $this->authorizePermission('equipment_update');

        $workspaceId = auth()->user()->current_workspace_id;

        $validated = $request->validate([
            'equipment_ids' => 'required|array',
            'equipment_ids.*' => 'integer|exists:equipment,id',
            'health_status' => 'nullable|in:green,yellow,red',
            'last_service_date' => 'nullable|date',
        ]);

        $items = Equipment::forWorkspace($workspaceId)->whereIn('id', $validated['equipment_ids'])->get();

        $updates = [];
        if (isset($validated['health_status'])) {
            $updates['health_status'] = $validated['health_status'];
        }
        if (isset($validated['last_service_date'])) {
            $updates['last_service_date'] = $validated['last_service_date'];
        }

        if (empty($updates)) {
            return back()->with('error', __('No updates provided'));
        }

        foreach ($items as $eq) {
            $eq->update($updates);
        }

        return back()->with('success', __(':count equipment updated successfully!', ['count' => $items->count()]));
    }

    public function downloadQrCodes(Request $request)
    {
        $this->authorizePermission('equipment_view_any');

        $workspaceId = auth()->user()->current_workspace_id;
        $query = Equipment::forWorkspace($workspaceId)->with(['project', 'equipmentType']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%");
            });
        }
        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $query->forProject($request->project_id);
        }
        if ($request->filled('equipment_type_id') && $request->equipment_type_id !== 'all') {
            $query->byType($request->equipment_type_id);
        }

        $equipment = $query->orderBy('code')->get();
        if ($equipment->isEmpty()) {
            return back()->with('error', __('No equipment to export'));
        }

        $cards = [];
        foreach ($equipment as $eq) {
            $eq->ensureQrToken();
            $url = url(route('equipment.show-by-qr', $eq->qr_token));
            if (!$url) {
                continue;
            }
            $builder = new Builder(writer: new PngWriter(), data: $url, size: 120, margin: 4);
            $result = $builder->build();
            $cards[] = [
                'dataUri' => $result->getDataUri(),
                'code' => $eq->code ?? ('ID-' . $eq->id),
                'name' => $eq->name,
            ];
        }

        $html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>
            body{font-family:DejaVu Sans,sans-serif;margin:12px}
            table{width:100%;border-collapse:collapse}
            td{width:33%;padding:10px;vertical-align:top;border:1px solid #ddd;text-align:center}
            td img{display:block;margin:0 auto 6px}
            .code{font-weight:bold;font-size:11pt;margin-bottom:2px}
            .name{font-size:9pt;color:#666}
        </style></head><body><table>';

        $cols = 3;
        $i = 0;
        foreach ($cards as $c) {
            if ($i % $cols === 0) {
                $html .= '<tr>';
            }
            $html .= '<td><img src="' . $c['dataUri'] . '" width="120" height="120"/><div class="code">' . htmlspecialchars($c['code']) . '</div><div class="name">' . htmlspecialchars($c['name']) . '</div></td>';
            $i++;
            if ($i % $cols === 0) {
                $html .= '</tr>';
            }
        }
        if ($i % $cols !== 0) {
            while ($i % $cols !== 0) {
                $html .= '<td></td>';
                $i++;
            }
            $html .= '</tr>';
        }
        $html .= '</table></body></html>';

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        return $pdf->download('equipment_qr_codes_' . date('Y-m-d') . '.pdf');
    }
}
