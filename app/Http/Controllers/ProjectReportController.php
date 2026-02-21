<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStage;
use App\Models\User;
use App\Models\ProjectMilestone;
use App\Models\TimesheetEntry;
use App\Models\Workspace;
use App\Exports\ProjectTaskReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProjectReportController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            return redirect()->route('dashboard')->with('error', 'No workspace selected.');
        }

        $userWorkspaceRole = $workspace->getMemberRole($user);

        $query = Project::with(['workspace', 'clients', 'creator', 'members.user'])
            ->forWorkspace($user->current_workspace_id);

        // Access control based on workspace role
        if ($userWorkspaceRole === 'owner') {
            // Owner: Full access to all projects
        } else {
            // Non-owners: Only assigned projects
            $query->where(function ($q) use ($user, $userWorkspaceRole) {
                $q->whereHas('members', function ($memberQuery) use ($user) {
                    $memberQuery->where('user_id', $user->id);
                })
                    ->orWhereHas('clients', function ($clientQuery) use ($user) {
                        $clientQuery->where('user_id', $user->id);
                    });

                // Client/Member: Only self-created projects
                if (in_array($userWorkspaceRole, ['client', 'member'])) {
                    $q->orWhere('created_by', $user->id);
                }
            });
        }

        if ($request->search)
            $query->search($request->search);
        if ($request->status)
            $query->byStatus($request->status);
        if ($request->user_id)
            $query->where(function ($q) use ($request) {
                $q->whereHas('members', function ($memberQuery) use ($request) {
                    $memberQuery->where('user_id', $request->user_id);
                })
                    ->orWhereHas('clients', function ($clientQuery) use ($request) {
                        $clientQuery->where('user_id', $request->user_id);
                    });
            });

        $perPage = in_array($request->get('per_page', 12), [12, 24, 48]) ? $request->get('per_page', 12) : 12;
        $projects = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $users = User::whereHas('workspaces', function ($q) use ($workspace) {
            $q->where('workspace_id', $workspace->id)->where('status', 'active');
        })->get();

        return Inertia::render('project-reports/Index', [
            'projects' => $projects,
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'user_id']),
            'userWorkspaceRole' => $userWorkspaceRole,
        ]);
    }

    public function show(Project $project)
    {
        $user = Auth::user();
        $workspace = $user->currentWorkspace;

        // Check if user has access to this project
        if (!$this->userHasProjectAccess($user, $project)) {
            return redirect()->route('project-reports.index')->with('error', 'Access denied to this project.');
        }

        // Get project with relationships
        $project->load(['members', 'clients', 'milestones', 'tasks.taskStage', 'tasks.members']);

        // Calculate project statistics
        $stats = $this->calculateProjectStats($project);
        
        // Calculate user statistics
        $userStats = $this->calculateUserStats($project);

        // Get chart data
        $chartData = $this->getProjectChartData($project, $workspace);

        // Get workspace users and stages for filtering
        $users = $workspace->members()->with('user')->get();
        $stages = TaskStage::where('workspace_id', $workspace->id)->orderBy('order')->get();

        // Get initial tasks data
        $initialTasksQuery = Task::where('project_id', $project->id)
            ->with(['taskStage', 'members', 'milestone', 'assignedUser'])
            ->limit(10);
        
        $initialTasks = $initialTasksQuery->get()->map(function ($task) {
            $loggedHours = TimesheetEntry::where('task_id', $task->id)->sum('hours');
            
            // Get assigned users
            $assignedUsers = collect();
            if ($task->assignedUser) {
                $assignedUsers->push($task->assignedUser);
            }
            if ($task->members && $task->members->count() > 0) {
                $assignedUsers = $assignedUsers->merge($task->members);
            }
            $assignedUsers = $assignedUsers->unique('id');
            
            return [
                'id' => $task->id,
                'title' => $task->title,
                'name' => $task->title,
                'description' => $task->description,
                'start_date' => $task->start_date,
                'due_date' => $task->end_date,
                'end_date' => $task->end_date,
                'priority' => $task->priority ?: 'medium',
                'status' => $task->taskStage ? $task->taskStage->name : 'To Do',
                'stage' => $task->taskStage ? $task->taskStage->name : 'To Do',
                'task_stage' => $task->taskStage ? [
                    'id' => $task->taskStage->id,
                    'name' => $task->taskStage->name,
                    'color' => $task->taskStage->color
                ] : null,
                'milestone' => $task->milestone ? [
                    'id' => $task->milestone->id,
                    'title' => $task->milestone->title
                ] : null,
                'milestone_title' => $task->milestone ? $task->milestone->title : null,
                'assigned_users' => $assignedUsers->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'user' => ['name' => $user->name]
                    ];
                })->values(),
                'logged_hours' => round($loggedHours, 2),
                'total_logged_hours' => round($loggedHours, 2),
                'progress' => $task->progress ?: 0,
                'estimated_hours' => $task->estimated_hours ?: 0,
            ];
        });

        return Inertia::render('project-reports/Show', [
            'project' => $project,
            'stats' => $stats,
            'userStats' => $userStats,
            'chartData' => $chartData,
            'users' => $users,
            'stages' => $stages,
            'workspace' => $workspace,
            'tasks' => [
                'data' => $initialTasks,
                'total' => Task::where('project_id', $project->id)->count()
            ],
            'filters' => request()->only(['search', 'user_id', 'status', 'priority', 'milestone_id', 'per_page'])
        ]);
    }

    public function getTasksData(Request $request, Project $project)
    {
        $user = Auth::user();
        
        if (!$this->userHasProjectAccess($user, $project)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $tasksQuery = Task::where('project_id', $project->id)
            ->with(['taskStage', 'members', 'milestone', 'assignedUser']);

        // Apply search filter
        if ($request->filled('search')) {
            $tasksQuery->where(function ($query) use ($request) {
                $query->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Apply filters
        if ($request->filled('user_id') && $request->user_id !== 'all') {
            $tasksQuery->where(function ($query) use ($request) {
                $query->where('assigned_to', $request->user_id)
                      ->orWhereHas('members', function ($memberQuery) use ($request) {
                          $memberQuery->where('user_id', $request->user_id);
                      });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $tasksQuery->whereHas('taskStage', function ($query) use ($request) {
                $query->where('name', $request->status);
            });
        }

        if ($request->filled('priority') && $request->priority !== 'all') {
            $tasksQuery->where('priority', $request->priority);
        }

        if ($request->filled('milestone_id') && $request->milestone_id !== 'all') {
            $tasksQuery->where('milestone_id', $request->milestone_id);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $tasks = $tasksQuery->paginate($perPage);

        // Transform tasks data
        $transformedTasks = $tasks->getCollection()->map(function ($task) {
            $loggedHours = TimesheetEntry::where('task_id', $task->id)->sum('hours');
            
            // Get assigned users
            $assignedUsers = collect();
            if ($task->assignedUser) {
                $assignedUsers->push($task->assignedUser);
            }
            if ($task->members && $task->members->count() > 0) {
                $assignedUsers = $assignedUsers->merge($task->members);
            }
            $assignedUsers = $assignedUsers->unique('id');
            
            return [
                'id' => $task->id,
                'title' => $task->title,
                'name' => $task->title, // Alias for compatibility
                'description' => $task->description,
                'start_date' => $task->start_date,
                'due_date' => $task->end_date,
                'end_date' => $task->end_date, // Alias for compatibility
                'priority' => $task->priority ?: 'medium',
                'status' => $task->taskStage ? $task->taskStage->name : 'To Do',
                'stage' => $task->taskStage ? $task->taskStage->name : 'To Do',
                'task_stage' => $task->taskStage ? [
                    'id' => $task->taskStage->id,
                    'name' => $task->taskStage->name,
                    'color' => $task->taskStage->color
                ] : null,
                'milestone' => $task->milestone ? [
                    'id' => $task->milestone->id,
                    'title' => $task->milestone->title
                ] : null,
                'milestone_title' => $task->milestone ? $task->milestone->title : null,
                'assigned_users' => $assignedUsers->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'user' => ['name' => $user->name] // For compatibility
                    ];
                })->values(),
                'assignees' => $assignedUsers->pluck('name')->join(', '),
                'logged_hours' => round($loggedHours, 2),
                'total_logged_hours' => round($loggedHours, 2),
                'is_completed' => $task->progress >= 100,
                'progress' => $task->progress ?: 0,
                'estimated_hours' => $task->estimated_hours ?: 0,
                'created_at' => $task->created_at,
                'updated_at' => $task->updated_at,
            ];
        });

        // Replace the collection in the paginator
        $tasks->setCollection($transformedTasks);

        return response()->json([
            'data' => $transformedTasks,
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

    public function export(Request $request, Project $project)
    {
        $user = Auth::user();
        
        if (!$this->userHasProjectAccess($user, $project)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $format = $request->query('format', 'pdf');

        if ($format === 'xlsx') {
            $filters = $request->only(['search', 'user_id', 'status', 'priority', 'milestone_id']);
            $export = new ProjectTaskReportExport($project, $filters);
            $filename = 'task_report_' . ($project->title ?? $project->name) . '_' . date('Y-m-d') . '.xlsx';
            return Excel::download($export, $filename);
        }

        $project->load(['members', 'clients', 'milestones', 'tasks.taskStage', 'tasks.members']);
        $stats = $this->calculateProjectStats($project);
        $userStats = $this->calculateUserStats($project);
        $tasks = Task::where('project_id', $project->id)->with(['taskStage', 'members', 'milestone', 'assignedUser'])->get();

        $html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Project Detail - ' . ($project->title ?? $project->name) . '</title><style>body{font-family:Arial,sans-serif;margin:20px;color:#333;background:#fff}.container{max-width:1200px;margin:0 auto}.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:1px solid #e5e7eb}.title{font-size:24px;font-weight:bold;color:#1f2937;margin-bottom:10px}.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:30px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1)}.card-title{font-size:16px;font-weight:bold;color:#1f2937;margin-bottom:15px}.overview-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:15px;align-items:center}.overview-left{grid-column:span 4}.overview-center{grid-column:span 3}.overview-right{grid-column:span 5;text-align:center}.info-item{margin-bottom:15px}.info-label{font-size:12px;color:#6b7280;margin-bottom:4px}.info-value{font-weight:600;color:#374151}.progress-circle{width:150px;height:150px;margin:0 auto;position:relative;display:flex;align-items:center;justify-content:center;border:8px solid #e5e7eb;border-radius:50%;border-top-color:#f97316}.progress-text{font-size:24px;font-weight:bold;color:#1f2937}.milestone-progress{text-align:center}.milestone-number{font-size:32px;font-weight:bold;color:#22c55e;margin-bottom:5px}.milestone-label{font-size:16px;color:#22c55e;font-weight:500}.priority-chart{text-align:center}.priority-legend{display:flex;justify-content:center;gap:15px;margin-top:10px;font-size:10px}.legend-item{display:flex;align-items:center;gap:5px}.legend-color{width:12px;height:12px;border-radius:2px}.table-container{background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:12px 8px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb}td{padding:12px 8px;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6}.status-badge{padding:4px 8px;border-radius:4px;font-size:10px;font-weight:500}.status-pending{background:#fef3c7;color:#92400e}.status-active{background:#dcfce7;color:#166534}.priority-low{background:#dcfce7;color:#166534}.priority-medium{background:#fef3c7;color:#92400e}.priority-high{background:#fed7aa;color:#c2410c}.priority-critical{background:#fecaca;color:#dc2626}</style></head><body><div class="container"><div class="header"><div class="title">' . ($project->title ?? $project->name) . '</div><div style="color:#6b7280;font-size:14px;">Project Detail Report - ' . date('F j, Y') . '</div></div><div class="row"><div class="card" style="grid-column:span 4;"><div class="card-title">Overview</div><div class="overview-grid"><div class="overview-left"><div class="info-item"><div class="info-label">Project Name:</div><div class="info-value">' . ($project->title ?? $project->name) . '</div></div><div class="info-item"><div class="info-label">Project Status:</div><div class="info-value"><span class="status-badge status-' . $project->status . '">' . ucfirst(str_replace('_', ' ', $project->status)) . '</span></div></div><div class="info-item"><div class="info-label">Total Members:</div><div class="info-value">' . ($project->members->count() + $project->clients->count()) . '</div></div></div><div class="overview-center"><div class="info-item"><div class="info-label">Start Date:</div><div class="info-value">' . ($project->start_date ? \Carbon\Carbon::parse($project->start_date)->format('M j, Y') : '-') . '</div></div><div class="info-item"><div class="info-label">Due Date:</div><div class="info-value">' . (($project->deadline ?? $project->end_date) ? \Carbon\Carbon::parse($project->deadline ?? $project->end_date)->format('M j, Y') : '-') . '</div></div></div><div class="overview-right"><div class="progress-circle"><div class="progress-text">' . ($stats['completion_percentage'] ?? 0) . '%</div></div></div></div></div><div class="card" style="grid-column:span 3;"><div class="card-title">Milestone Progress</div><div class="milestone-progress"><div class="milestone-number">' . ($stats['milestone_completion_percentage'] ?? 0) . '%</div><div class="milestone-label">Progress</div></div></div><div class="card" style="grid-column:span 3;"><div class="card-title">Task Priority</div><div class="priority-chart"><div style="margin:20px 0;">Critical: ' . ($stats['priority_stats']['critical'] ?? 0) . '<br>High: ' . ($stats['priority_stats']['high'] ?? 0) . '<br>Medium: ' . ($stats['priority_stats']['medium'] ?? 0) . '<br>Low: ' . ($stats['priority_stats']['low'] ?? 0) . '</div><div class="priority-legend"><div class="legend-item"><div class="legend-color" style="background:#ef4444;"></div>Critical</div><div class="legend-item"><div class="legend-color" style="background:#f97316;"></div>High</div><div class="legend-item"><div class="legend-color" style="background:#f59e0b;"></div>Medium</div><div class="legend-item"><div class="legend-color" style="background:#10B77F;"></div>Low</div></div></div></div></div><div class="row"><div class="card" style="grid-column:span 4;"><div class="card-title">Hours Estimation</div><div style="margin:20px 0;"><div class="info-item"><div class="info-label">Logged Hours</div><div class="info-value">' . ($stats['total_logged_hours'] ?? 0) . 'h</div></div></div></div></div>';

        $html .= '<div class="row">';
        if ($userStats && count($userStats) > 0) {
            $html .= '<div class="card" style="grid-column:span 6;"><div class="card-title">Users</div><div class="table-container"><table><thead><tr><th>NAME</th><th>ASSIGNED TASKS</th><th>DONE TASKS</th></tr></thead><tbody>';
            foreach ($userStats as $userStat) {
                $html .= '<tr><td>' . $userStat['name'] . '</td><td>' . $userStat['assigned_tasks'] . '</td><td>' . $userStat['done_tasks'] . '</td></tr>';
            }
            $html .= '</tbody></table></div></div>';
        }

        if ($project->milestones && $project->milestones->count() > 0) {
            $html .= '<div class="card" style="grid-column:span 6;"><div class="card-title">Milestones</div><div class="table-container"><table><thead><tr><th>NAME</th><th>PROGRESS</th><th>STATUS</th><th>DUE DATE</th></tr></thead><tbody>';
            foreach ($project->milestones as $milestone) {
                $html .= '<tr><td>' . $milestone->title . '</td><td>' . ($milestone->progress ?? 0) . '%</td><td><span class="status-badge status-' . $milestone->status . '">' . ucfirst($milestone->status) . '</span></td><td>' . ($milestone->due_date ? \Carbon\Carbon::parse($milestone->due_date)->format('M j, Y') : '-') . '</td></tr>';
            }
            $html .= '</tbody></table></div></div>';
        }
        $html .= '</div>';

        $html .= '<div class="table-container"><div style="padding:16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><div style="font-size:16px;font-weight:bold;color:#1f2937;">Tasks</div></div><table><thead><tr><th>TASK NAME</th><th>MILESTONE</th><th>START DATE</th><th>DUE DATE</th><th>ASSIGNED TO</th><th>TOTAL LOGGED HOURS</th><th>PRIORITY</th><th>STATUS</th></tr></thead><tbody>';

        foreach ($tasks as $task) {
            $loggedHours = TimesheetEntry::where('task_id', $task->id)->sum('hours');
            $assignedUsers = collect();
            if ($task->assignedUser) $assignedUsers->push($task->assignedUser);
            if ($task->members) $assignedUsers = $assignedUsers->merge($task->members);
            $assignedUsers = $assignedUsers->unique('id');
            
            $html .= '<tr><td>' . $task->title . '</td><td>' . ($task->milestone ? $task->milestone->title : '-') . '</td><td>' . ($task->start_date ? \Carbon\Carbon::parse($task->start_date)->format('M j, Y') : '-') . '</td><td>' . (($task->due_date ?? $task->end_date) ? \Carbon\Carbon::parse($task->due_date ?? $task->end_date)->format('M j, Y') : '-') . '</td><td>' . ($assignedUsers->pluck('name')->join(', ') ?: '-') . '</td><td>' . round($loggedHours, 2) . 'h</td><td><span class="priority-' . ($task->priority ?? 'medium') . '">' . ucfirst($task->priority ?? 'medium') . '</span></td><td>' . ($task->taskStage ? $task->taskStage->name : 'To Do') . '</td></tr>';
        }

        $html .= '</tbody></table></div></div></body></html>';
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        return $pdf->download('project_report_' . ($project->title ?: $project->name) . '_' . date('Y-m-d') . '.pdf');
    }

    private function userHasProjectAccess($user, $project)
    {
        if ($user->hasRole(['company', 'owner'])) {
            return $project->workspace_id === $user->currentWorkspace->id;
        }

        if ($user->hasRole('client')) {
            return $project->clients()->where('user_id', $user->id)->exists();
        }

        return $project->members()->where('user_id', $user->id)->exists();
    }

    private function calculateProjectStats($project)
    {
        $totalTasks = $project->tasks()->count();
        $completedTasks = $project->tasks()->where('progress', 100)->count();

        $totalMilestones = $project->milestones()->count();
        $completedMilestones = $project->milestones()->where('status', 'completed')->count();
        // Calculate logged hours from timesheet entries
        $totalLoggedHours = TimesheetEntry::whereIn('task_id', $project->tasks()->pluck('id'))->sum('hours');
        


        // Task priority distribution
        $priorityStats = $project->tasks()
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        // Task status distribution
        $statusStats = $project->tasks()
            ->join('task_stages', 'tasks.task_stage_id', '=', 'task_stages.id')
            ->select('task_stages.name', DB::raw('count(*) as count'))
            ->groupBy('task_stages.name')
            ->pluck('count', 'name')
            ->toArray();

        // Get task-wise hours data for chart
        $taskHoursData = [];
        foreach ($project->tasks as $task) {
            $taskLogged = TimesheetEntry::where('task_id', $task->id)->sum('hours');
            
            $taskHoursData[] = [
                'task_name' => $task->title,
                'logged_hours' => round($taskLogged, 2)
            ];
        }

        $milestoneProgress = $totalMilestones > 0 ? ($completedMilestones / $totalMilestones) * 100 : 0;

        return [
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'completion_percentage' => $project->progress ?? 0,
            'total_milestones' => $totalMilestones,
            'completed_milestones' => $completedMilestones,
            'milestone_completion_percentage' => round($milestoneProgress, 2),
            'total_logged_hours' => round($totalLoggedHours, 2),
            'priority_stats' => $priorityStats,
            'status_stats' => $statusStats,
            'task_hours_data' => $taskHoursData,
            'days_left' => $project->end_date ? \Carbon\Carbon::now()->diffInDays(\Carbon\Carbon::parse($project->end_date), false) : null,
        ];
    }

    private function getProjectChartData($project, $workspace)
    {
        // Get last 7 days of task updates
        $dates = collect();
        for ($i = 6; $i >= 0; $i--) {
            $dates->push(\Carbon\Carbon::now()->subDays($i)->format('Y-m-d'));
        }

        $stages = TaskStage::where('workspace_id', $workspace->id)->orderBy('order')->get();

        $chartData = [
            'labels' => $dates->map(function ($date) {
                return \Carbon\Carbon::parse($date)->format('M d');
            })->toArray(),
            'datasets' => [],
        ];

        foreach ($stages as $stage) {
            $data = $dates->map(function ($date) use ($project, $stage) {
                return Task::where('project_id', $project->id)
                    ->where('task_stage_id', $stage->id)
                    ->whereDate('updated_at', $date)
                    ->count();
            })->toArray();

            $chartData['datasets'][] = [
                'label' => $stage->name,
                'data' => $data,
                'backgroundColor' => $stage->color ?? '#3B82F6',
                'borderColor' => $stage->color ?? '#3B82F6',
            ];
        }

        return $chartData;
    }
    
    private function calculateUserStats($project)
    {
        $userStats = [];
        
        // Get all users who have tasks assigned in this project using assigned_to field
        $taskUsers = DB::table('tasks')
            ->join('users', 'tasks.assigned_to', '=', 'users.id')
            ->where('tasks.project_id', $project->id)
            ->whereNotNull('tasks.assigned_to')
            ->select('users.id', 'users.name')
            ->distinct()
            ->get();
        

        
        // Calculate stats for each user who has tasks assigned
        foreach ($taskUsers as $user) {
            $userId = $user->id;
            
            // Count assigned tasks
            $assignedTasks = DB::table('tasks')
                ->where('project_id', $project->id)
                ->where('assigned_to', $userId)
                ->count();
            
            // Count done tasks - check what stage ID is "Done"
            $doneStageId = DB::table('task_stages')
                ->where('workspace_id', $project->workspace_id)
                ->where('name', 'Done')
                ->value('id');
                
            $doneTasks = DB::table('tasks')
                ->where('project_id', $project->id)
                ->where('assigned_to', $userId)
                ->where('task_stage_id', $doneStageId)
                ->count();
            
            $userStats[] = [
                'name' => $user->name,
                'role' => 'member',
                'assigned_tasks' => $assignedTasks,
                'done_tasks' => $doneTasks
            ];
        }
        
        return $userStats;
    }
}