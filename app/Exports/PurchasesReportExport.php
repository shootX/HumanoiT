<?php

namespace App\Exports;

use App\Models\InvoiceItem;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Support\Collection;

class PurchasesReportExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $workspaceId;
    protected array $filters;

    public function __construct(int $workspaceId, array $filters = [])
    {
        $this->workspaceId = $workspaceId;
        $this->filters = $filters ?? [];
    }

    public function collection(): Collection
    {
        $query = InvoiceItem::with(['invoice.project', 'task.project'])
            ->where('type', 'asset')
            ->whereHas('invoice', fn($q) => $q->forWorkspace($this->workspaceId));

        if (!empty($this->filters['project_id']) && $this->filters['project_id'] !== 'all') {
            $projectId = $this->filters['project_id'];
            $query->where(function ($q) use ($projectId) {
                $q->whereHas('invoice', fn($i) => $i->where('project_id', $projectId))
                    ->orWhereHas('task', fn($t) => $t->where('project_id', $projectId));
            });
        }

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where('description', 'like', "%{$search}%");
        }

        if (!empty($this->filters['start_date'])) {
            $startDate = Carbon::parse($this->filters['start_date'])->startOfDay();
            $query->whereHas('invoice', fn($q) => $q->where('invoice_date', '>=', $startDate));
        }
        if (!empty($this->filters['end_date'])) {
            $endDate = Carbon::parse($this->filters['end_date'])->endOfDay();
            $query->whereHas('invoice', fn($q) => $q->where('invoice_date', '<=', $endDate));
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'ნივთის დასახელება',
            'ერთეულის რაოდენობა',
            'ერთეულის ფასი',
            'სრული ფასი',
            'დავალება',
            'პროექტი',
        ];
    }

    public function map($item): array
    {
        $project = $item->task?->project ?? $item->invoice?->project;

        return [
            $item->description,
            $item->quantity ?: 1,
            $item->rate,
            $item->amount,
            $item->task?->title ?? '-',
            $project?->title ?? '-',
        ];
    }
}
