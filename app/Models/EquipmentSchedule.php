<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentSchedule extends Model
{
    protected $fillable = [
        'equipment_id', 'service_type_id', 'interval_days', 'advance_days', 'last_service_date'
    ];

    protected $casts = [
        'interval_days' => 'integer',
        'advance_days' => 'integer',
        'last_service_date' => 'date',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }

    public function getNextServiceDateAttribute(): ?Carbon
    {
        $base = $this->last_service_date ?? $this->equipment?->installation_date ?? $this->equipment?->last_service_date;
        if (!$base) {
            return null;
        }
        return $base->copy()->addDays($this->interval_days);
    }

    public function getTaskDueDateAttribute(): ?Carbon
    {
        $next = $this->next_service_date;
        if (!$next) {
            return null;
        }
        return $next->copy()->subDays($this->advance_days);
    }

    public function isTaskDue(): bool
    {
        $due = $this->task_due_date;
        return $due && $due->isPast();
    }
}
