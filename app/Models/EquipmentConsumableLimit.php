<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentConsumableLimit extends Model
{
    protected $fillable = [
        'equipment_type_id', 'consumable_type', 'max_quantity', 'unit'
    ];

    protected $casts = [
        'max_quantity' => 'decimal:4',
    ];

    public function equipmentType(): BelongsTo
    {
        return $this->belongsTo(EquipmentType::class);
    }

    public function exceedsLimit(float $quantity): bool
    {
        return $quantity > (float) $this->max_quantity;
    }

    public static function checkLimit(int $equipmentTypeId, string $consumableType, float $quantity): ?self
    {
        $limit = static::where('equipment_type_id', $equipmentTypeId)
            ->where('consumable_type', $consumableType)
            ->first();
        if (!$limit || !$limit->exceedsLimit($quantity)) {
            return null;
        }
        return $limit;
    }
}
