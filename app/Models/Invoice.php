<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'invoice_number',
        'project_id',
        'task_id',
        'workspace_id',
        'client_id',
        'created_by',
        'title',
        'description',
        'invoice_date',
        'due_date',
        'subtotal',
        'tax_rate',
        'tax_amount',

        'total_amount',
        'status',
        'paid_amount',
        'sent_at',
        'approved_at',
        'approved_by',
        'viewed_at',
        'paid_at',
        'payment_method',
        'payment_reference',
        'payment_details',
        'client_details',
        'notes',
        'terms',
        'payment_token'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'invoice_date' => 'date',
        'due_date' => 'date',
        'sent_at' => 'datetime',
        'approved_at' => 'datetime',
        'viewed_at' => 'datetime',
        'paid_at' => 'datetime',
        'payment_details' => 'array',
        'client_details' => 'array',
    ];

    protected $appends = [
        'formatted_total',
        'balance_due',
        'remaining_amount',
        'is_overdue',
        'days_overdue',
        'status_color',
        'payment_url'
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function budgetCategory(): BelongsTo
    {
        return $this->belongsTo(\App\Models\BudgetCategory::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function canBeApproved(): bool
    {
        return in_array($this->status, ['draft', 'sent', 'viewed']) && !$this->approved_at;
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // Scopes
    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeForProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
                    ->whereNotIn('status', ['paid', 'cancelled']);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['sent', 'viewed']);
    }

    // Accessors
    public function getFormattedTotalAttribute()
    {
        return number_format($this->total_amount, 2);
    }

    public function getBalanceDueAttribute()
    {
        return $this->total_amount - $this->paid_amount;
    }

    public function getRemainingAmountAttribute()
    {
        $totalPaid = $this->payments()->sum('amount');
        return max(0, $this->total_amount - $totalPaid);
    }

    public function getDueAmountAttribute()
    {
        return $this->remaining_amount;
    }

    public function getIsOverdueAttribute()
    {
        if (!$this->due_date) {
            return false;
        }
        return $this->due_date < now() && !in_array($this->status, ['paid', 'cancelled']);
    }

    public function getDaysOverdueAttribute()
    {
        if (!$this->is_overdue || !$this->due_date) {
            return 0;
        }
        return (int) $this->due_date->diffInDays(now());
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'draft' => 'gray',
            'sent' => 'blue',
            'viewed' => 'yellow',
            'paid' => 'green',
            'partial_paid' => 'orange',
            'overdue' => 'red',
            'cancelled' => 'gray',
            default => 'gray'
        };
    }

    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            'draft' => 'Draft',
            'sent' => 'Sent',
            'viewed' => 'Viewed',
            'paid' => 'Paid',
            'partial_paid' => 'Partially Paid',
            'overdue' => 'Overdue',
            'cancelled' => 'Cancelled',
            default => ucfirst($this->status)
        };
    }

    // Methods
    public function generateInvoiceNumber()
    {
        $prefix = 'INV-' . date('Y') . '-';
        $lastInvoice = static::where('invoice_number', 'like', $prefix . '%')
                           ->orderBy('invoice_number', 'desc')
                           ->first();

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice->invoice_number, strlen($prefix));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    public function calculateTotals()
    {
        $subtotal = 0;   // ბაზა (გადასახადამდე)
        $perItemTaxAmount = 0;
        $totalAmount = 0;
        $taxData = [];

        foreach ($this->items()->with('tax')->get() as $item) {
            $itemAmount = $item->rate * ($item->quantity ?: 1);

            if ($item->tax_id && $item->tax) {
                $rate = $item->tax->rate ?? 0;
                $isInclusive = $item->tax->is_inclusive ?? false;
                if ($isInclusive) {
                    // 100 ლარი = სრული თანხა, 18% დღგ უკვე შედის. ბაზა = 100/1.18, დღგ = 100 - ბაზა
                    $base = $itemAmount / (1 + ($rate / 100));
                    $taxAmt = $itemAmount - $base;
                    $subtotal += $base;
                    $totalAmount += $itemAmount; // სრული თანხა უკვე არის rate-ში
                } else {
                    // ექსკლუზიური: rate = ბაზა, დღგ ემატება
                    $taxAmt = ($itemAmount * $rate) / 100;
                    $subtotal += $itemAmount;
                    $totalAmount += $itemAmount + $taxAmt;
                }
                $perItemTaxAmount += $taxAmt;
                $taxKey = $item->tax->id;
                if (!isset($taxData[$taxKey])) {
                    $taxData[$taxKey] = ['id' => $item->tax->id, 'name' => $item->tax->name, 'rate' => $item->tax->rate, 'is_inclusive' => (bool) $item->tax->is_inclusive, 'amount' => 0];
                }
                $taxData[$taxKey]['amount'] += $taxAmt;
            } else {
                $subtotal += $itemAmount;
                $totalAmount += $itemAmount;
            }
        }

        $this->update([
            'subtotal' => $subtotal,
            'tax_rate' => array_values($taxData),
            'tax_amount' => $perItemTaxAmount,
            'total_amount' => $totalAmount
        ]);

        return $this;
    }
    
    public function getTaxRateAttribute($value)
    {
        if (is_string($value) && !empty($value)) {
            $decoded = json_decode($value, true);
            return (is_array($decoded) && json_last_error() === JSON_ERROR_NONE) ? $decoded : [];
        }
        return is_array($value) ? $value : [];
    }
    
    public function setTaxRateAttribute($value)
    {
        $this->attributes['tax_rate'] = is_array($value) ? json_encode($value) : $value;
    }

    public function markAsSent()
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now()
        ]);
    }

    public function markAsViewed()
    {
        if ($this->status === 'sent') {
            $this->update([
                'status' => 'viewed',
                'viewed_at' => now()
            ]);
        }
    }

    public function markAsPaid($amount = null, $paymentMethod = null, $paymentReference = null, $paymentDetails = null)
    {
        $paidAmount = $amount ?? $this->total_amount;
        $this->update([
            'status' => 'paid',
            'paid_amount' => $paidAmount,
            'paid_at' => now(),
            'payment_method' => $paymentMethod,
            'payment_reference' => $paymentReference,
            'payment_details' => $paymentDetails
        ]);
        $this->createProjectExpenseIfPaid();
        $this->createAssetsFromPaidInvoice();
    }

    public function createPaymentRecord($amount, $paymentMethod, $transactionId)
    {
        $existingPayment = Payment::where('invoice_id', $this->id)
            ->where('transaction_id', $transactionId)
            ->first();

        if (!$existingPayment) {
            $payment = Payment::create([
                'invoice_id' => $this->id,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'transaction_id' => $transactionId,
                'payment_date' => now(),
                'created_by' => $this->created_by,
                'workspace_id' => $this->workspace_id
            ]);

            $this->updatePaymentStatus();
            return true;
        }
        return false;
    }

    public function updatePaymentStatus()
    {
        $totalPaid = $this->payments()->sum('amount');
        $oldStatus = $this->status;
        
        if ($totalPaid >= $this->total_amount) {
            $this->update(['status' => 'paid', 'paid_amount' => $totalPaid, 'paid_at' => now()]);
            $this->createProjectExpenseIfPaid();
            $this->createAssetsFromPaidInvoice();
        } elseif ($totalPaid > 0) {
            $this->update(['status' => 'partial_paid', 'paid_amount' => $totalPaid]);
        } else {
            // Check if overdue
            if ($this->due_date && $this->due_date < now() && !in_array($this->status, ['paid', 'cancelled'])) {
                $this->update(['status' => 'overdue']);
            }
        }
        

        // Log status change
        if ($oldStatus !== $this->status) {
            \Log::info('Invoice status updated', [
                'invoice_id' => $this->id,
                'old_status' => $oldStatus,
                'new_status' => $this->status,
                'total_paid' => $totalPaid,
                'total_amount' => $this->total_amount
            ]);
        }
    }

    public function getPaymentUrlAttribute()
    {
        if (!$this->payment_token) {
            $this->payment_token = \Str::random(32);
            $this->save();
        }
        return route('invoices.payment', $this->payment_token);
    }

    /**
     * When invoice is paid and has a project, create a ProjectExpense so it appears in project expenses.
     */
    public function createProjectExpenseIfPaid(): ?ProjectExpense
    {
        if ($this->status !== 'paid' || !$this->project_id) {
            return null;
        }
        if (ProjectExpense::where('invoice_id', $this->id)->exists()) {
            return null;
        }
        $taskId = $this->items()->whereNotNull('task_id')->value('task_id');
        $project = $this->project;
        $currency = ($project && $project->budget && isset($project->budget->currency)) ? $project->budget->currency : 'GEL';
        return ProjectExpense::create([
            'project_id' => $this->project_id,
            'budget_category_id' => $this->budget_category_id,
            'task_id' => $taskId,
            'invoice_id' => $this->id,
            'submitted_by' => $this->created_by,
            'amount' => $this->total_amount,
            'currency' => $currency,
            'expense_date' => $this->paid_at ?? $this->invoice_date ?? now(),
            'title' => $this->title ?: __('Invoice :number', ['number' => $this->invoice_number]),
            'description' => __('From invoice :number', ['number' => $this->invoice_number]),
            'vendor' => $this->client?->name,
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $this->created_by,
            'approved_amount' => $this->total_amount,
        ]);
    }

    /**
     * When invoice is paid and approved, create Assets from items with type='asset'.
     */
    public function createAssetsFromPaidInvoice(): array
    {
        if ($this->status !== 'paid' || !$this->approved_at) {
            return [];
        }
        if (!$this->workspace_id) {
            return [];
        }
        $assetItems = $this->items()->where('type', 'asset')->get();
        if ($assetItems->isEmpty()) {
            return [];
        }
        $existingCount = Asset::where('invoice_id', $this->id)->count();
        if ($existingCount >= $assetItems->count()) {
            return [];
        }
        $created = [];
        foreach ($assetItems as $item) {
            $name = $item->asset_name ?: $item->description;
            if (empty(trim($name))) {
                continue;
            }
            $location = null;
            if ($this->project_id) {
                $project = $this->project;
                $location = $project?->address;
            }
            $asset = Asset::create([
                'workspace_id' => $this->workspace_id,
                'project_id' => $this->project_id,
                'invoice_id' => $this->id,
                'asset_category_id' => $item->asset_category_id,
                'name' => $name,
                'value' => $item->amount,
                'location' => $location,
                'purchase_date' => $this->invoice_date,
                'status' => 'active',
                'notes' => __('From invoice :number', ['number' => $this->invoice_number]),
            ]);
            $created[] = $asset;
        }
        return $created;
    }

    protected static function booted()
    {
        static::creating(function ($invoice) {
            if (!$invoice->invoice_number) {
                $invoice->invoice_number = $invoice->generateInvoiceNumber();
            }
            if (!$invoice->payment_token) {
                $invoice->payment_token = \Str::random(32);
            }
        });

        static::deleting(function ($invoice) {
            $invoice->items()->delete();
        });
    }

    protected function getActivityDescription(string $action): string
    {
        return match($action) {
            'created' => "Invoice '{$this->invoice_number}' was created for {$this->formatted_total}",
            'updated' => "Invoice '{$this->invoice_number}' was updated",
            'deleted' => "Invoice '{$this->invoice_number}' was deleted",
            default => parent::getActivityDescription($action)
        };
    }
}