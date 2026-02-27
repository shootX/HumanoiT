<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentServicePhoto extends Model
{
    protected $fillable = [
        'task_id', 'type', 'file_path', 'media_item_id'
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function mediaItem(): BelongsTo
    {
        return $this->belongsTo(MediaItem::class);
    }

    public function scopeBefore($query)
    {
        return $query->where('type', 'before');
    }

    public function scopeAfter($query)
    {
        return $query->where('type', 'after');
    }
}
