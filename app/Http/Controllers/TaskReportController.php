<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStage;
use App\Models\User;
use App\Exports\TaskReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class TaskReportController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            return redirect()->route('dashboard')->with('error', 'No workspace selected.');
        }

        $projects = Project::forWorkspace($workspace->id)->orderBy('title')->get(['id', 'title']);
        $users = User::whereHas('workspaces', fn($q) => $q->where('workspace_id', $workspace->id)->where('status', 'active'))->get(['id', 'name']);
        $stages = TaskStage::where('workspace_id', $workspace->id)->orderBy('order')->get(['id', 'name', 'color']);

        $stats = $this->calculateStats($workspace->id, $request);
        $perPage = (int) $request->input('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        }

        $initialTasks = $this->getTasksQuery($workspace->id, $request)
            ->limit($perPage)
            ->get()
            ->map(fn($task) => $this->transformTask($task));

        return Inertia::render('task-reports/Index', [
            'projects' => $projects,
            'users' => $users,
            'stages' => $stages,
            'stats' => $stats,
            'tasks' => [
                'data' => $initialTasks,
                'total' => $this->getTasksQuery($workspace->id, $request)->count()
            ],
            'filters' => $request->only(['search', 'project_id', 'user_id', 'status', 'priority', 'per_page', 'date_from', 'date_to', 'date_basis'])
        ]);
    }

    public function getTasksData(Request $request)
    {
        $user = Auth::user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            return response()->json(['error' => 'No workspace'], 403);
        }

        $query = $this->getTasksQuery($workspace->id, $request);
        $perPage = $request->get('per_page', 15);
        $tasks = $query->paginate($perPage);

        $transformed = $tasks->getCollection()->map(fn($task) => $this->transformTask($task));
        $tasks->setCollection($transformed);

        return response()->json([
            'data' => $transformed,
            'stats' => $this->calculateStats($workspace->id, $request),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
                'from' => $tasks->firstItem(),
                'to' => $tasks->lastItem(),
            ]
        ]);
    }

    public function export(Request $request)
    {
        $user = Auth::user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            return response()->json(['error' => 'No workspace'], 403);
        }

        $filters = $request->only(['search', 'project_id', 'user_id', 'status', 'priority', 'date_from', 'date_to', 'date_basis']);
        $export = new TaskReportExport($workspace->id, $filters);
        $filename = 'task_report_' . date('Y-m-d') . '.xlsx';
        return Excel::download($export, $filename);
    }

    private function getFilteredTasksBaseQuery(int $workspaceId, Request $request)
    {
        $query = Task::whereHas('project', fn($q) => $q->where('workspace_id', $workspaceId));

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }
        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $query->where('project_id', $request->project_id);
        }
        if ($request->filled('user_id') && $request->user_id !== 'all') {
            $query->where(function ($q) use ($request) {
                $q->where('assigned_to', $request->user_id)
                    ->orWhereHas('members', fn($m) => $m->where('user_id', $request->user_id));
            });
        }
        if ($request->filled('status') && $request->status !== 'all') {
            $query->whereHas('taskStage', fn($q) => $q->where('name', $request->status));
        }
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        $this->applyTaskDateFilters($query, $request);

        return $query;
    }

    private function getTasksQuery(int $workspaceId, Request $request)
    {
        $query = $this->getFilteredTasksBaseQuery($workspaceId, $request)
            ->with(['taskStage', 'members', 'milestone', 'assignedUser', 'project']);

        if (Schema::hasTable('timesheet_entries')) {
            $query->select('tasks.*')->selectSub(function ($sub) {
                $sub->from('timesheet_entries')
                    ->selectRaw('COALESCE(SUM(hours), 0)')
                    ->whereColumn('timesheet_entries.task_id', 'tasks.id');
            }, 'logged_hours');
        }

        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Filter by task dates: date_basis=due (default) uses COALESCE(end_date, due_date); date_basis=start uses start_date.
     */
    private function applyTaskDateFilters($query, Request $request): void
    {
        $hasFrom = $request->filled('date_from');
        $hasTo = $request->filled('date_to');
        if (!$hasFrom && !$hasTo) {
            return;
        }

        $basis = $request->get('date_basis', 'due');
        if ($basis === 'start') {
            if ($hasFrom) {
                $query->whereDate('start_date', '>=', $request->date_from);
            }
            if ($hasTo) {
                $query->whereDate('start_date', '<=', $request->date_to);
            }

            return;
        }

        if ($hasFrom) {
            $query->whereRaw('DATE(COALESCE(end_date, due_date)) >= ?', [$request->date_from]);
        }
        if ($hasTo) {
            $query->whereRaw('DATE(COALESCE(end_date, due_date)) <= ?', [$request->date_to]);
        }
    }

    private function transformTask(Task $task): array
    {
        $loggedHours = is_numeric($task->logged_hours ?? null) ? (float) $task->logged_hours : 0.0;
        $assignedUsers = collect();
        if ($task->assignedUser) $assignedUsers->push($task->assignedUser);
        if ($task->members?->count() > 0) $assignedUsers = $assignedUsers->merge($task->members);
        $assignedUsers = $assignedUsers->unique('id');

        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'project' => $task->project ? ['id' => $task->project->id, 'title' => $task->project->title] : null,
            'start_date' => $task->start_date,
            'end_date' => $task->end_date,
            'due_date' => $task->end_date ?? $task->due_date,
            'priority' => $task->priority ?: 'medium',
            'status' => $task->taskStage?->name ?? 'To Do',
            'task_stage' => $task->taskStage ? ['id' => $task->taskStage->id, 'name' => $task->taskStage->name, 'color' => $task->taskStage->color] : null,
            'milestone_title' => $task->milestone?->title,
            'assigned_users' => $assignedUsers->map(fn($u) => ['id' => $u->id, 'name' => $u->name])->values(),
            'assignees' => $assignedUsers->pluck('name')->join(', ') ?: '-',
            'logged_hours' => round($loggedHours, 2),
            'progress' => $task->progress ?: 0,
            'estimated_hours' => $task->estimated_hours ?: 0,
        ];
    }

    private function calculateStats(int $workspaceId, Request $request): array
    {
        $baseQuery = $this->getFilteredTasksBaseQuery($workspaceId, $request);
        $total = $baseQuery->count();

        $doneStageId = TaskStage::where('workspace_id', $workspaceId)
            ->whereRaw('LOWER(name) = ?', ['done'])
            ->value('id');

        $doneCount = $doneStageId
            ? (clone $baseQuery)->where('task_stage_id', $doneStageId)->count()
            : (clone $baseQuery)->where('progress', 100)->count();

        $priorityStats = (clone $baseQuery)->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')->pluck('count', 'priority')->toArray();

        $totalHours = 0.0;
        if (Schema::hasTable('timesheet_entries')) {
            $taskIdSubquery = (clone $baseQuery)->select('tasks.id');
            $totalHours = (float) DB::table('timesheet_entries')
                ->whereIn('task_id', $taskIdSubquery)
                ->sum('hours');
        }

        return [
            'total_tasks' => $total,
            // "completed" is interpreted as "Done" stage for reports
            'completed_tasks' => $doneCount,
            'remaining_tasks' => max(0, $total - $doneCount),
            'completion_percentage' => $total > 0 ? round(($doneCount / $total) * 100) : 0,
            'total_logged_hours' => round($totalHours, 2),
            'priority_stats' => $priorityStats,
        ];
    }
}
