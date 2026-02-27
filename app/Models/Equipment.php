<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Equipment extends Model
{
    protected $fillable = [
        'workspace_id', 'project_id', 'equipment_type_id', 'name', 'qr_token',
        'installation_date', 'last_service_date', 'health_status', 'notes'
    ];

    protected $casts = [
        'installation_date' => 'date',
        'last_service_date' => 'date',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function equipmentType(): BelongsTo
    {
        return $this->belongsTo(EquipmentType::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(EquipmentSchedule::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeForProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByType($query, $equipmentTypeId)
    {
        return $query->where('equipment_type_id', $equipmentTypeId);
    }

    public function scopeByHealthStatus($query, $status)
    {
        return $query->where('health_status', $status);
    }

    public function ensureQrToken(): string
    {
        if (!$this->qr_token) {
            $this->qr_token = Str::random(32);
            $this->save();
        }
        return $this->qr_token;
    }

    public function getQrUrlAttribute(): ?string
    {
        if (!$this->qr_token) {
            return null;
        }
        return route('equipment.show-by-qr', $this->qr_token);
    }

    protected static function booted()
    {
        static::creating(function (Equipment $equipment) {
            if (!$equipment->qr_token) {
                $equipment->qr_token = Str::random(32);
            }
        });
    }
}
