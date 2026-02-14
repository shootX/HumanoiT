<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmContact extends Model
{
    protected $fillable = [
        'workspace_id',
        'type',
        'name',
        'company_name',
        'brand_name',
        'identification_code',
        'email',
        'phone',
        'address',
        'notes',
        'created_by',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function getDisplayNameAttribute(): string
    {
        if ($this->type === 'legal') {
            return $this->company_name ?? $this->brand_name ?? $this->name;
        }
        return $this->name;
    }
}
