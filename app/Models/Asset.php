<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Asset extends Model
{
    protected $fillable = [
        'workspace_id', 'project_id', 'invoice_id', 'asset_category_id', 'name', 'quantity', 'asset_code', 'type',
        'location', 'purchase_date', 'warranty_until', 'status', 'value', 'notes'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_until' => 'date',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assetCategory(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function taskAllocations(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'asset_task')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function scopeForWorkspace(Builder $query, $workspaceId): Builder
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeForProject(Builder $query, $projectId): Builder
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByStatus(Builder $query, $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeByType(Builder $query, $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeByCategory(Builder $query, $categoryId): Builder
    {
        return $query->where('asset_category_id', $categoryId);
    }

    public function isUnderWarranty(): bool
    {
        return $this->warranty_until && $this->warranty_until->isFuture();
    }

    public static function generateUniqueAssetCode(int $workspaceId): string
    {
        $prefix = 'HI-0901';
        $last = static::forWorkspace($workspaceId)
            ->where('asset_code', 'like', $prefix . '%')
            ->get()
            ->map(fn ($a) => (int) preg_replace('/^' . preg_quote($prefix, '/') . '/', '', $a->asset_code ?? '0'))
            ->max() ?? 0;

        return $prefix . str_pad((string) ($last + 1), 4, '0', STR_PAD_LEFT);
    }
}
