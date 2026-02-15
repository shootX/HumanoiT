<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetWarrantyCase extends Model
{
    protected $fillable = [
        'asset_id', 'damage_description', 'comment', 'status', 'reported_at', 'created_by'
    ];

    protected $casts = [
        'reported_at' => 'datetime',
    ];

    public const STATUS_REPAIRED = 'repaired';
    public const STATUS_NOT_REPAIRED = 'not_repaired';
    public const STATUS_NOT_DONE = 'not_done';
    public const STATUS_NOT_WARRANTY = 'not_warranty_case';

    public static function statusOptions(): array
    {
        return [
            self::STATUS_REPAIRED => 'repaired',
            self::STATUS_NOT_REPAIRED => 'not_repaired',
            self::STATUS_NOT_DONE => 'not_done',
            self::STATUS_NOT_WARRANTY => 'not_warranty_case',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
