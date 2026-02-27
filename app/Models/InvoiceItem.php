<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'task_id',
        'expense_id',
        'asset_id',
        'equipment_id',
        'service_type_id',
        'asset_category_id',
        'asset_name',
        'tax_id',
        'type',
        'description',
        'quantity',
        'rate',
        'amount',
        'sort_order'
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'amount' => 'decimal:2',
        'quantity' => 'float',
        'sort_order' => 'integer',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function expense(): BelongsTo
    {
        return $this->belongsTo(ProjectExpense::class, 'expense_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }

    public function assetCategory(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class);
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Tax::class);
    }

    public function taskAllocations(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'invoice_item_task')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    protected static function booted()
    {
        static::saving(function ($item) {
            $item->amount = $item->rate * ($item->quantity ?: 1);
        });

        static::saved(function ($item) {
            $item->invoice->calculateTotals();
        });

        static::deleted(function ($item) {
            $item->invoice->calculateTotals();
        });
    }
}