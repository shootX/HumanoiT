<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\TaskStage;
use App\Models\ProjectMilestone;
use App\Models\User;
use App\Models\Asset;
use App\Services\AssetTaskAllocationService;
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

        $query = Task::with(['project', 'taskStage', 'assignedTo', 'creator', 'milestone', 'members'])
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
                    ->orWhereHas('members', function ($mq) use ($user) {
                        $mq->where('user_id', $user->id);
                    })
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
                    ->orWhereHas('members', function ($mq) use ($request) {
                        $mq->where('user_id', $request->assigned_to);
                    });
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
        $assets = Asset::forWorkspace($workspace->id)
            ->whereRaw('COALESCE(quantity, 1) > 0')
            ->orderBy('name')
            ->get(['id', 'name', 'asset_code', 'quantity']);
        $members = User::whereHas('workspaces', function ($q) use ($workspace) {
            $q->where('workspace_id', $workspace->id)->where('status', 'active');
        })->whereNotIn('type', ['company', 'superadmin'])->get();

        // Get Google Calendar sync settings from company owner
        $companyOwner = $workspace->owner; // Get the company owner
        $googleCalendarEnabled = getSetting('is_googlecalendar_sync', '0', $companyOwner->id, $workspace->id) === '1';

        return Inertia::render('tasks/Index', [
            'tasks' => $tasks,
            'projects' => $projects,
            'stages' => $stages,
            'assets' => $assets,
            'members' => $members,
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
            'assets',
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

        $memberUsers = $task->project->members()->with('user')->get()->filter(fn ($m) => $m->user)->pluck('user');
        $clientUsers = $task->project->clients;
        $projectMembers = $memberUsers->merge($clientUsers)->unique('id')->values()->toArray();

        $stages = TaskStage::forWorkspace($currentUser->current_workspace_id)->ordered()->get();
        $milestones = $task->project->milestones ?? [];

        return response()->json([
            'task' => $task,
            'members' => $projectMembers,
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
            'asset_items' => 'nullable|array',
            'asset_items.*.asset_id' => 'required_with:asset_items|exists:assets,id',
            'asset_items.*.quantity' => 'required_with:asset_items|integer|min:1',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,critical',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'assigned_user_ids' => 'nullable|array',
            'assigned_user_ids.*' => 'exists:users,id',
            'is_googlecalendar_sync' => 'nullable|boolean'
        ]);

        // Ensure project belongs to current workspace
        $project = Project::find($validated['project_id']);
        if (!$project || $project->workspace_id != $workspace->id) {
            abort(403, 'Project not found in current workspace.');
        }

        $assetItems = $validated['asset_items'] ?? [];
        foreach ($assetItems as $item) {
            $asset = Asset::find($item['asset_id']);
            if (!$asset || $asset->workspace_id != $workspace->id) {
                abort(403, 'Asset not found in current workspace.');
            }
        }

        // Get first stage for the workspace
        $firstStage = TaskStage::forWorkspace(auth()->user()->current_workspace_id)
            ->ordered()
            ->first();

        $createData = collect($validated)->except(['assigned_user_ids', 'asset_items'])->toArray();
        $createData['task_stage_id'] = $firstStage->id;
        $createData['created_by'] = auth()->id();
        $createData['progress'] = 0;
        $createData['assigned_to'] = !empty($validated['assigned_user_ids']) ? (int) $validated['assigned_user_ids'][0] : null;

        $task = Task::create($createData);

        if (!empty($assetItems)) {
            $sync = AssetTaskAllocationService::processAssetItems($assetItems, $task, $workspace->id);
            $task->assets()->sync($sync);
        }

        if (!empty($validated['assigned_user_ids'])) {
            $syncData = collect($validated['assigned_user_ids'])->mapWithKeys(function ($userId) {
                return [$userId => ['assigned_by' => auth()->id()]];
            })->toArray();
            $task->members()->sync($syncData);
        }

        // Sync with Google Calendar if enabled
        if ($validated['is_googlecalendar_sync'] ?? false) {
            $this->syncTaskWithGoogleCalendar($task);
        }

        // Fire event for Slack notification
        if (!config('app.is_demo', true)) {
            event(new \App\Events\TaskCreated($task));
        }

        // Log activity and fire event for each assigned user
        if (!empty($validated['assigned_user_ids'])) {
            $task->load('project');
            foreach ($validated['assigned_user_ids'] as $userId) {
                $assignedUser = User::find($userId);
                if ($assignedUser) {
                    $task->logAssignment($assignedUser);
                    if (!config('app.is_demo', true)) {
                        event(new \App\Events\TaskAssigned($task, $assignedUser, auth()->user()));
                    }
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
            'assigned_user_ids' => 'nullable|array',
            'assigned_user_ids.*' => 'exists:users,id',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'asset_items' => 'nullable|array',
            'asset_items.*.asset_id' => 'required_with:asset_items|exists:assets,id',
            'asset_items.*.quantity' => 'required_with:asset_items|integer|min:1',
            'is_googlecalendar_sync' => 'nullable|boolean'
        ]);

        $assetItems = $validated['asset_items'] ?? [];
        foreach ($assetItems as $item) {
            $asset = Asset::find($item['asset_id']);
            if (!$asset || $asset->workspace_id != $workspace->id) {
                abort(403, 'Asset not found in current workspace.');
            }
        }

        $assigneesProvided = array_key_exists('assigned_user_ids', $validated);
        $oldMemberIds = $task->members->pluck('id')->sort()->values()->toArray();
        $newMemberIds = $assigneesProvided
            ? collect($validated['assigned_user_ids'] ?? [])->map(fn ($id) => (int) $id)->sort()->values()->toArray()
            : $oldMemberIds;

        $updateData = collect($validated)->except(['assigned_user_ids', 'asset_items'])->toArray();
        if ($assigneesProvided) {
            $updateData['assigned_to'] = !empty($newMemberIds) ? $newMemberIds[0] : null;
        }
        $task->update($updateData);

        if (array_key_exists('asset_items', $validated)) {
            $sync = AssetTaskAllocationService::processAssetItems($assetItems, $task, $workspace->id);
            $task->assets()->sync($sync);
        }

        if ($assigneesProvided) {
            if (!empty($newMemberIds)) {
                $syncData = collect($newMemberIds)->mapWithKeys(function ($userId) {
                    return [$userId => ['assigned_by' => auth()->id()]];
                })->toArray();
                $task->members()->sync($syncData);
            } else {
                $task->members()->detach();
            }
        }

        // Sync with Google Calendar if enabled
        if ($validated['is_googlecalendar_sync'] ?? false) {
            $this->syncTaskWithGoogleCalendar($task);
        } elseif ($task->google_calendar_event_id && !($validated['is_googlecalendar_sync'] ?? false)) {
            $this->googleCalendarService->deleteEvent($task->google_calendar_event_id, auth()->id());
            $task->update(['google_calendar_event_id' => null]);
        }

        if ($assigneesProvided) {
            $task->load('project');
            $newlyAssignedIds = array_diff($newMemberIds, $oldMemberIds);
            foreach ($newlyAssignedIds as $userId) {
                $assignedUser = User::find($userId);
                if ($assignedUser) {
                    $task->logAssignment($assignedUser);
                    if (!config('app.is_demo', true)) {
                        event(new \App\Events\TaskAssigned($task, $assignedUser, auth()->user()));
                    }
                }
            }
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
        $newTask->assigned_to = $task->assigned_to;
        $newTask->save();

        if ($task->members->isNotEmpty()) {
            $syncData = $task->members->mapWithKeys(function ($user) {
                return [$user->id => ['assigned_by' => auth()->id()]];
            })->toArray();
            $newTask->members()->sync($syncData);
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

        $task->logStatusChange($oldStage, $newStage);

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