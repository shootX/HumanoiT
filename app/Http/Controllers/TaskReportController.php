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

        $stats = $this->calculateStats($workspace->id);

        $initialTasks = $this->getTasksQuery($workspace->id, $request)
            ->limit(15)
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
            'filters' => $request->only(['search', 'project_id', 'user_id', 'status', 'priority', 'per_page'])
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

        $filters = $request->only(['search', 'project_id', 'user_id', 'status', 'priority']);
        $export = new TaskReportExport($workspace->id, $filters);
        $filename = 'task_report_' . date('Y-m-d') . '.xlsx';
        return Excel::download($export, $filename);
    }

    private function getTasksQuery(int $workspaceId, Request $request)
    {
        $query = Task::whereHas('project', fn($q) => $q->where('workspace_id', $workspaceId))
            ->with(['taskStage', 'members', 'milestone', 'assignedUser', 'project']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%");
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

        return $query->orderBy('created_at', 'desc');
    }

    private function transformTask(Task $task): array
    {
        $loggedHours = 0;
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

    private function calculateStats(int $workspaceId): array
    {
        $baseQuery = Task::whereHas('project', fn($q) => $q->where('workspace_id', $workspaceId));
        $total = $baseQuery->count();
        $completed = (clone $baseQuery)->where('progress', 100)->count();
        $doneStageId = TaskStage::where('workspace_id', $workspaceId)->where('name', 'Done')->value('id');
        $inDone = $doneStageId ? (clone $baseQuery)->where('task_stage_id', $doneStageId)->count() : $completed;

        $priorityStats = (clone $baseQuery)->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')->pluck('count', 'priority')->toArray();

        $taskIds = (clone $baseQuery)->pluck('id');
        $totalHours = 0;

        return [
            'total_tasks' => $total,
            'completed_tasks' => $completed,
            'in_done_stage' => $inDone,
            'completion_percentage' => $total > 0 ? round(($completed / $total) * 100) : 0,
            'total_logged_hours' => round($totalHours, 2),
            'priority_stats' => $priorityStats,
        ];
    }
}
