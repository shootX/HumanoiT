<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'amount',
        'payment_method',
        'transaction_id',
        'payment_date',
        'created_by',
        'workspace_id',
        'status',
        'gateway_response'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'gateway_response' => 'array'
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    protected static function booted()
    {
        static::created(function ($payment) {
            if ($payment->invoice) {
                $payment->invoice->updatePaymentStatus();
            }
        });

        static::updated(function ($payment) {
            if ($payment->invoice) {
                $payment->invoice->updatePaymentStatus();
            }
        });

        static::deleted(function ($payment) {
            if ($payment->invoice) {
                $payment->invoice->updatePaymentStatus();
            }
        });
    }

    public function getPaymentMethodDisplayAttribute(): string
    {
        return match($this->payment_method) {
            'cash' => 'Cash',
            'bank_transfer' => 'Bank Transfer',
            'company_card' => 'Company Card',
            'personal' => 'Personal',
            'personal_card' => 'Personal Card',
            default => $this->payment_method ? ucfirst(str_replace('_', ' ', $this->payment_method)) : ''
        };
    }
}