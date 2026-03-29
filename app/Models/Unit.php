<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    protected $fillable = [
        'workspace_id', 'name', 'short_name'
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public static function findIdForWorkspace(int $workspaceId, ?string $label): ?int
    {
        $label = trim((string) $label);
        if ($label === '') {
            return null;
        }
        if (!Schema::hasTable('units')) {
            return null;
        }
        return static::query()
            ->where('workspace_id', $workspaceId)
            ->where(function ($q) use ($label) {
                $q->where('short_name', $label)->orWhere('name', $label);
            })
            ->value('id');
    }
}
