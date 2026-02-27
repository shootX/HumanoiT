<?php

namespace App\Services;

use App\Models\EquipmentConsumableLimit;
use App\Models\EquipmentType;

class EquipmentConsumableLimitService
{
    /**
     * Check if quantity exceeds limit for equipment type + consumable type.
     * Returns the limit record if exceeded, null otherwise.
     */
    public function checkLimit(int $equipmentTypeId, string $consumableType, float $quantity): ?EquipmentConsumableLimit
    {
        return EquipmentConsumableLimit::checkLimit($equipmentTypeId, $consumableType, $quantity);
    }

    /**
     * Get warning message if limit exceeded.
     */
    public function getWarningMessage(?EquipmentConsumableLimit $limit, float $quantity): ?string
    {
        if (!$limit) {
            return null;
        }
        return __('Consumable quantity :quantity exceeds maximum :max :unit for this equipment type.', [
            'quantity' => $quantity,
            'max' => $limit->max_quantity,
            'unit' => $limit->unit,
        ]);
    }
}
