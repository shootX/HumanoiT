<?php

namespace App\Exports;

use App\Models\Invoice;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Http\Request;

class InvoiceExport implements FromQuery, WithHeadings, WithMapping
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function query()
    {
        $query = Invoice::with(['project', 'client']);

        if ($this->request->filled('search')) {
            $search = $this->request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        if ($this->request->filled('project_id')) {
            $query->where('project_id', $this->request->project_id);
        }

        if ($this->request->filled('client_id')) {
            $query->where('client_id', $this->request->client_id);
        }

        if ($this->request->filled('status')) {
            $query->where('status', $this->request->status);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'Invoice Number',
            'Title',
            'Project',
            'Client',
            'Total Amount',
            'Status',
            'Invoice Date',
            'Due Date',
            'Created At'
        ];
    }

    public function map($invoice): array
    {
        return [
            $invoice->invoice_number,
            $invoice->title,
            $invoice->project->title ?? '',
            $invoice->client->name ?? '',
            $invoice->total_amount,
            $invoice->status,
            $invoice->invoice_date,
            $invoice->due_date,
            $invoice->created_at->format('Y-m-d H:i:s')
        ];
    }
}