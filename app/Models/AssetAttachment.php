<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetAttachment extends Model
{
    protected $fillable = [
        'asset_id', 'workspace_id', 'media_item_id', 'attachment_type', 'uploaded_by'
    ];

    protected $with = ['mediaItem'];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function mediaItem(): BelongsTo
    {
        return $this->belongsTo(MediaItem::class, 'media_item_id');
    }

    protected static function booted()
    {
        static::retrieved(function ($attachment) {
            if ($attachment->mediaItem) {
                $attachment->mediaItem->makeVisible(['url', 'thumb_url']);
            }
        });
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
