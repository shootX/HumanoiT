<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\Asset;
use App\Models\TaskStage;
use App\Models\ProjectMilestone;
use App\Models\User;
use App\Services\GoogleCalendarService;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    use HasPermissionChecks;
    
    protected $googleCalendarService;

    public function __construct(GoogleCalendarService $googleCalendarService)
    {
        $this->googleCalendarService = $googleCalendarService;
    }
    public function index(Request $request): Response
    {
        $this->authorizePermission('task_view_any');

        $user = auth()->user();
        $workspace = $user->currentWorkspace;
        $userWorkspaceRole = $workspace->getMemberRole($user);

        $query = Task::with(['project', 'taskStage', 'assignedTo', 'creator', 'milestone', 'members', 'asset'])
            ->whereHas('project', function ($q) use ($user, $userWorkspaceRole) {
                $q->forWorkspace($user->current_workspace_id);

                // If not workspace owner, only show tasks from accessible projects
                if ($userWorkspaceRole !== 'owner') {
                    $q->where(function ($projectQuery) use ($user) {
                        $projectQuery->whereHas('members', function ($memberQuery) use ($user) {
                            $memberQuery->where('user_id', $user->id);
                        })
                            ->orWhereHas('clients', function ($clientQuery) use ($user) {
                                $clientQuery->where('user_id', $user->id);
                            })
                            ->orWhere('created_by', $user->id);
                    });
                }
            });

        // Filter tasks by assignment for members only
        if ($userWorkspaceRole === 'member') {
            $query->where(function ($taskQuery) use ($user) {
                $taskQuery->where('assigned_to', $user->id)
                    ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
                    ->orWhere('created_by', $user->id);
            });
        }

        if ($request->project_id) {
            $query->forProject($request->project_id);
        }

        if ($request->stage_id) {
            $query->byStage($request->stage_id);
        }

        if ($request->priority) {
            $query->byPriority($request->priority);
        }

        if ($request->assigned_to) {
            $query->where(function ($q) use ($request) {
                $q->where('assigned_to', $request->assigned_to)
                    ->orWhereHas('members', fn ($mq) => $mq->where('user_id', $request->assigned_to));
            });
        }

        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Default to kanban view and get all data without pagination
        $view = $request->get('view', 'kanban');

        if ($view === 'kanban') {
            $tasks = $query->get();
        } else {
            $perPage = $request->get('per_page', 20);
            $perPage = in_array($perPage, [20, 50, 100]) ? $perPage : 20;
            $tasks = $query->latest()->paginate($perPage);
        }

        // Apply same access control to projects dropdown as used for task filtering
        $projectsQuery = Project::forWorkspace($user->current_workspace_id)
            ->with(['milestones', 'members.user', 'clients']);

        // If not workspace owner, only show accessible projects
        if ($userWorkspaceRole !== 'owner') {
            $projectsQuery->where(function ($q) use ($user) {
                $q->whereHas('members', function ($memberQuery) use ($user) {
                    $memberQuery->where('user_id', $user->id);
                })
                    ->orWhereHas('clients', function ($clientQuery) use ($user) {
                        $clientQuery->where('user_id', $user->id);
                    })
                    ->orWhere('created_by', $user->id);
            });
        }

        $projects = $projectsQuery->get();
        $stages = TaskStage::forWorkspace($user->current_workspace_id)->ordered()->get();
        $members = User::whereHas('workspaces', function ($q) use ($workspace) {
            $q->where('workspace_id', $workspace->id)->where('status', 'active');
        })->where('type', '!=', 'superadmin')->get();

        $assets = Asset::forWorkspace($workspace->id)->orderBy('name')->get(['id', 'name', 'asset_code', 'type', 'project_id']);

        // Get Google Calendar sync settings from company owner
        $companyOwner = $workspace->owner; // Get the company owner
        $googleCalendarEnabled = getSetting('is_googlecalendar_sync', '0', $companyOwner->id, $workspace->id) === '1';

        return Inertia::render('tasks/Index', [
            'tasks' => $tasks,
            'projects' => $projects,
            'stages' => $stages,
            'members' => $members,
            'assets' => $assets,
            'filters' => array_merge(
                $request->only(['project_id', 'stage_id', 'priority', 'assigned_to', 'search', 'per_page']),
                ['view' => $view]
            ),
            'project_name' => $request->project_name,
            'userWorkspaceRole' => $userWorkspaceRole,
            'permissions' => [
                'create' => $this->checkPermission('task_create'),
                'update' => $this->checkPermission('task_update'),
                'delete' => $this->checkPermission('task_delete'),
                'duplicate' => $this->checkPermission('task_duplicate'),
                'change_status' => $this->checkPermission('task_change_status'),
                'assign_users' => $this->checkPermission('task_assign_users'),
                'manage_stages' => $this->checkPermission('task_manage_stages'),
                'add_comments' => $this->checkPermission('task_add_comments'),
                'add_attachments' => $this->checkPermission('task_add_attachments'),
                'manage_checklists' => $this->checkPermission('task_manage_checklists'),
            ],
            'googleCalendarEnabled' => $googleCalendarEnabled
        ]);
    }

    public function show(Task $task)
    {
        $this->authorizePermission('task_view');

        $task->load([
            'project.workspace',
            'project.members.user',
            'project.clients',
            'taskStage',
            'assignedTo',
            'creator',
            'milestone',
            'asset',
            'members',
            'comments.user',
            'checklists.assignedTo',
            'checklists.creator',
            'attachments.mediaItem',
            'invoices'
        ]);

        // Ensure MediaItem appended attributes are loaded
        $task->attachments->load('mediaItem');
        $task->attachments->each(function ($attachment) {
            if ($attachment->mediaItem) {
                // Force load the media to ensure appended attributes work
                $attachment->mediaItem->getFirstMedia('images');
            }
        });

        $currentUser = auth()->user();
        $workspace = $currentUser->currentWorkspace;

        // Ensure task belongs to current workspace
        if (!$workspace || $task->project->workspace_id != $workspace->id) {
            abort(403, 'Task not found in current workspace.');
        }

        // Add permission flags to comments
        $task->comments->each(function ($comment) use ($currentUser) {
            $comment->can_update = $comment->canBeUpdatedBy($currentUser);
            $comment->can_delete = $comment->canBeDeletedBy($currentUser);
        });

        // Add permission flags to checklists
        $task->checklists->each(function ($checklist) use ($currentUser) {
            $checklist->can_update = $checklist->canBeUpdatedBy($currentUser);
            $checklist->can_delete = $checklist->canBeDeletedBy($currentUser);
        });

        $allMembers = User::whereHas('workspaces', function ($q) use ($workspace) {
            $q->where('workspace_id', $workspace->id)->where('status', 'active');
        })->where('type', '!=', 'superadmin')->get();

        $stages = TaskStage::forWorkspace($currentUser->current_workspace_id)->ordered()->get();
        $milestones = $task->project->milestones ?? [];
        $assets = Asset::forWorkspace($workspace->id)->orderBy('name')->get(['id', 'name', 'asset_code', 'type', 'project_id']);

        return response()->json([
            'task' => $task,
            'members' => $allMembers,
            'assets' => $assets,
            'stages' => $stages,
            'milestones' => $milestones,
            'permissions' => [
                'update' => $this->checkPermission('task_update'),
                'delete' => $this->checkPermission('task_delete'),
                'duplicate' => $this->checkPermission('task_duplicate'),
                'change_status' => $this->checkPermission('task_change_status'),
                'assign_users' => $this->checkPermission('task_assign_users'),
                'add_comments' => $this->checkPermission('task_add_comments'),
                'add_attachments' => $this->checkPermission('task_add_attachments'),
                'manage_checklists' => $this->checkPermission('task_manage_checklists'),
            ]
        ]);
    }



    public function store(Request $request)
    {
        $this->authorizePermission('task_create');

        $user = auth()->user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            abort(403, 'No workspace selected.');
        }
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'asset_id' => 'nullable|exists:assets,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,critical',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'assigned_to' => 'nullable|exists:users,id',
            'assigned_user_ids' => 'nullable|array',
            'assigned_user_ids.*' => 'exists:users,id',
            'is_googlecalendar_sync' => 'nullable|boolean'
        ]);

        // Ensure project belongs to current workspace
        $project = Project::find($validated['project_id']);
        if (!$project || $project->workspace_id != $workspace->id) {
            abort(403, 'Project not found in current workspace.');
        }

        $ids = $validated['assigned_user_ids'] ?? [];
        if (empty($ids) && !empty($validated['assigned_to'])) {
            $ids = [$validated['assigned_to']];
        }
        $ids = array_values(array_unique(array_map('intval', $ids)));

        $taskData = collect($validated)->except(['assigned_user_ids'])->toArray();
        $taskData['assigned_to'] = $ids[0] ?? $validated['assigned_to'] ?? null;

        // Get first stage for the workspace
        $firstStage = TaskStage::forWorkspace(auth()->user()->current_workspace_id)
            ->ordered()
            ->first();

        $task = Task::create([
            ...$taskData,
            'task_stage_id' => $firstStage->id,
            'created_by' => auth()->id(),
            'progress' => 0
        ]);

        if (!empty($ids)) {
            $task->members()->sync(collect($ids)->mapWithKeys(fn ($id) => [$id => ['assigned_by' => auth()->id()]])->toArray());
        }

        // Sync with Google Calendar if enabled
        if ($validated['is_googlecalendar_sync'] ?? false) {
            $this->syncTaskWithGoogleCalendar($task);
        }

        // Fire event for Slack notification
        if (!config('app.is_demo', true)) {
            event(new \App\Events\TaskCreated($task));
        }

        // Fire TaskAssigned for each assigned user
        if (!empty($ids) && !config('app.is_demo', true)) {
            $task->load(['project', 'members']);
            foreach ($ids as $userId) {
                $assignedUser = User::find($userId);
                if ($assignedUser) {
                    event(new \App\Events\TaskAssigned($task, $assignedUser, auth()->user()));
                }
            }
        }

        return back()->with('success', __('Task created successfully!'));
    }

    public function update(Request $request, Task $task)
    {
        $this->authorizePermission('task_update');

        $user = auth()->user();
        $workspace = $user->currentWorkspace;

        if (!$workspace || $task->project->workspace_id != $workspace->id) {
            abort(403, 'Task not found in current workspace.');
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,critical',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'assigned_to' => 'nullable|exists:users,id',
            'assigned_user_ids' => 'nullable|array',
            'assigned_user_ids.*' => 'exists:users,id',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'asset_id' => 'nullable|exists:assets,id',
            'is_googlecalendar_sync' => 'nullable|boolean'
        ]);

        $ids = $validated['assigned_user_ids'] ?? null;
        if ($ids === null && isset($validated['assigned_to'])) {
            $ids = $validated['assigned_to'] ? [$validated['assigned_to']] : [];
        }
        $ids = $ids !== null ? array_values(array_unique(array_map('intval', $ids))) : null;

        $oldMemberIds = $task->members->pluck('id')->toArray();

        if ($ids !== null) {
            $task->members()->sync(collect($ids)->mapWithKeys(fn ($id) => [$id => ['assigned_by' => auth()->id()]])->toArray());
            $newlyAssigned = array_diff($ids, $oldMemberIds);
            if (!empty($newlyAssigned) && !config('app.is_demo', true)) {
                $task->load(['project', 'members']);
                foreach ($newlyAssigned as $userId) {
                    $assignedUser = User::find($userId);
                    if ($assignedUser) {
                        event(new \App\Events\TaskAssigned($task, $assignedUser, auth()->user()));
                    }
                }
            }
        }

        $updateData = collect($validated)->except(['assigned_user_ids'])->toArray();
        if ($ids !== null) {
            $updateData['assigned_to'] = $ids[0] ?? null;
        }
        $task->update($updateData);

        // Sync with Google Calendar if enabled
        if ($validated['is_googlecalendar_sync'] ?? false) {
            $this->syncTaskWithGoogleCalendar($task);
        } elseif ($task->google_calendar_event_id && !($validated['is_googlecalendar_sync'] ?? false)) {
            $this->googleCalendarService->deleteEvent($task->google_calendar_event_id, auth()->id());
            $task->update(['google_calendar_event_id' => null]);
        }

        if (!$request->header('X-Inertia') && ($request->wantsJson() || $request->ajax())) {
            return response()->json(['success' => true]);
        }
        return back()->with('success', __('Task updated successfully!'));
    }

    public function destroy(Task $task)
    {
        $this->authorizePermission('task_delete');

        $user = auth()->user();
        $workspace = $user->currentWorkspace;

        if (!$workspace || $task->project->workspace_id != $workspace->id) {
            abort(403, 'Task not found in current workspace.');
        }

        // Delete Google Calendar event
        if ($task->google_calendar_event_id) {
            try {
                $this->googleCalendarService->deleteEvent($task->google_calendar_event_id, auth()->id(), $user->current_workspace_id);
            } catch (\Exception $e) {
                \Log::error('Failed to delete Google Calendar event', [
                    'task_id' => $task->id,
                    'event_id' => $task->google_calendar_event_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $task->delete();

        return back()->with('success', __('Task deleted successfully!'));
    }

    public function duplicate(Task $task)
    {
        $this->authorizePermission('task_duplicate');

        $user = auth()->user();
        $workspace = $user->currentWorkspace;

        if (!$workspace || $task->project->workspace_id != $workspace->id) {
            abort(403, 'Task not found in current workspace.');
        }
        $task->load('members');
        $newTask = $task->replicate();
        $newTask->title = $task->title . ' (Copy)';
        $newTask->start_date = null;
        $newTask->end_date = null;
        $newTask->progress = 0;
        $newTask->created_by = auth()->id();
        $memberIds = $task->members->pluck('id')->toArray();
        $newTask->assigned_to = $memberIds[0] ?? $task->assigned_to;
        $newTask->save();

        if (!empty($memberIds)) {
            $newTask->members()->sync(collect($memberIds)->mapWithKeys(fn ($id) => [$id => ['assigned_by' => auth()->id()]])->toArray());
        }

        // Copy checklists
        foreach ($task->checklists as $checklist) {
            $newChecklist = $checklist->replicate();
            $newChecklist->task_id = $newTask->id;
            $newChecklist->is_completed = false;
            $newChecklist->created_by = auth()->id();
            $newChecklist->save();
        }

        return back()->with('success', __('Task duplicated successfully!'));
    }

    public function changeStage(Request $request, Task $task)
    {
        $this->authorizePermission('task_change_status');

        $user = auth()->user();
        $workspace = $user->currentWorkspace;

        if (!$workspace || $task->project->workspace_id != $workspace->id) {
            abort(403, 'Task not found in current workspace.');
        }
        $validated = $request->validate([
            'task_stage_id' => 'required|exists:task_stages,id'
        ]);

        $oldStage = $task->taskStage->name ?? 'Unknown';
        $task->update($validated);
        $newStage = TaskStage::find($validated['task_stage_id'])->name ?? 'Unknown';

        // Fire event for Slack notification
        if (!config('app.is_demo', true)) {
            event(new \App\Events\TaskStageUpdated($task, $oldStage, $newStage));
        }

        return back()->with('success', __('Task stage updated successfully!'));
    }

    /**
     * Sync task with Google Calendar
     */
    private function syncTaskWithGoogleCalendar(Task $task)
    {
        try {
            $user = auth()->user();
            $workspaceId = $user->current_workspace_id;
            
            // Check if Google Calendar is enabled and configured from company owner
            $companyOwner = $user->currentWorkspace->owner;
            $googleCalendarEnabled = getSetting('is_googlecalendar_sync', '0', $companyOwner->id, $workspaceId);
            
            if ($googleCalendarEnabled !== '1') {
                return;
            }
            
            if ($task->google_calendar_event_id) {
                // Update existing event
                $this->googleCalendarService->updateEvent($task->google_calendar_event_id, $task, $user->id, $workspaceId);
            } else {
                // Create new event
                $eventId = $this->googleCalendarService->createEvent($task, $user->id, $workspaceId);
                if ($eventId) {
                    $task->update(['google_calendar_event_id' => $eventId]);
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to sync task with Google Calendar', [
                'task_id' => $task->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get tasks for calendar view (including Google Calendar tasks)
     */
    public function getCalendarTasks(Request $request)
    {
        $user = auth()->user();
        $workspace = $user->currentWorkspace;
        $calendarView = $request->get('calendar_view', 'local'); // 'local' or 'google'
        
        $tasks = Task::with(['project', 'taskStage', 'assignedTo'])
            ->whereHas('project', function ($q) use ($user) {
                $q->forWorkspace($user->current_workspace_id);
            })
            ->when($calendarView === 'google', function ($query) {
                $query->where('is_googlecalendar_sync', true);
            })
            ->get();
            
        return response()->json([
            'tasks' => $tasks,
            'calendar_view' => $calendarView
        ]);
    }
}