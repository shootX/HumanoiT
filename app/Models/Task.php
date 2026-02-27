<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    use LogsActivity;
    protected $fillable = [
        'project_id', 'task_stage_id', 'milestone_id', 'asset_id', 'equipment_id', 'equipment_schedule_id',
        'title', 'description', 'priority', 'start_date', 'end_date', 'due_date', 'assigned_to', 'created_by', 'progress',
        'estimated_hours', 'google_calendar_event_id', 'is_googlecalendar_sync', 'google_sheet_sync_key'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'due_date' => 'date',
        'progress' => 'integer',
        'estimated_hours' => 'decimal:2',
        'is_googlecalendar_sync' => 'boolean'
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function taskStage(): BelongsTo
    {
        return $this->belongsTo(TaskStage::class);
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(ProjectMilestone::class, 'milestone_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function equipmentSchedule(): BelongsTo
    {
        return $this->belongsTo(EquipmentSchedule::class);
    }

    public function equipmentServicePhotos(): HasMany
    {
        return $this->hasMany(EquipmentServicePhoto::class);
    }

    public function assets(): BelongsToMany
    {
        return $this->belongsToMany(Asset::class, 'asset_task')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->latest();
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(TaskChecklist::class)->orderBy('order');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_members')
                    ->withPivot('assigned_by', 'assigned_at')
                    ->withTimestamps();
    }


    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function invoices(): HasManyThrough
    {
        return $this->hasManyThrough(Invoice::class, InvoiceItem::class, 'task_id', 'id', 'id', 'invoice_id');
    }

    public function scopeForProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByStage($query, $stageId)
    {
        return $query->where('task_stage_id', $stageId);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function isOverdue(): bool
    {
        return $this->end_date && $this->end_date->isPast() && $this->progress < 100;
    }

    public function calculateProgress(): int
    {
        $checklists = $this->checklists;
        if ($checklists->isEmpty()) {
            return $this->progress;
        }

        $completed = $checklists->where('is_completed', true)->count();
        return (int) (($completed / $checklists->count()) * 100);
    }

    protected function getActivityDescription(string $action): string
    {
        return match($action) {
            'created' => __('Task ":title" was created', ['title' => $this->title]),
            'updated' => __('Task ":title" was updated', ['title' => $this->title]),
            'deleted' => __('Task ":title" was deleted', ['title' => $this->title]),
            default => parent::getActivityDescription($action)
        };
    }

    public function logStatusChange(string $oldStage, string $newStage)
    {
        $this->logActivity('stage_changed', [
            'old_stage' => $oldStage,
            'new_stage' => $newStage,
            'description' => __('Task ":title" moved from :old_stage to :new_stage', [
                'title' => $this->title,
                'old_stage' => $oldStage,
                'new_stage' => $newStage
            ])
        ]);
    }

    public function logAssignment(User $user)
    {
        $this->logActivity('assigned', [
            'assigned_to' => $user->name,
            'description' => __('Task ":title" was assigned to :user', [
                'title' => $this->title,
                'user' => $user->name
            ])
        ]);
    }

    public function requiresEquipmentPhotosForCompletion(): bool
    {
        return (bool) $this->equipment_id;
    }

    public function hasRequiredEquipmentPhotos(): bool
    {
        if (!$this->requiresEquipmentPhotosForCompletion()) {
            return true;
        }
        $before = $this->equipmentServicePhotos()->before()->exists();
        $after = $this->equipmentServicePhotos()->after()->exists();
        return $before && $after;
    }

    public function updateMilestoneProgress(): void
    {
        if ($this->milestone_id) {
            $this->milestone->updateProgressFromTasks();
        }
        
        // Always update project progress
        $this->project->updateProgressFromMilestones();
    }

    protected static function booted()
    {
        static::updating(function (Task $task) {
            if ($task->isDirty('progress') && $task->progress >= 100 && $task->requiresEquipmentPhotosForCompletion() && !$task->hasRequiredEquipmentPhotos()) {
                $v = \Illuminate\Support\Facades\Validator::make([], []);
                $v->errors()->add('equipment_photos', __('Equipment maintenance tasks require Before and After photos before completion.'));
                throw new \Illuminate\Validation\ValidationException($v);
            }
        });
        static::updated(function ($task) {
            $task->updateMilestoneProgress();
        });
        
        static::created(function ($task) {
            $task->updateMilestoneProgress();
        });
        
        static::deleted(function ($task) {
            $task->updateMilestoneProgress();
        });
    }
}