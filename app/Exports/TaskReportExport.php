<?php

namespace App\Exports;

use App\Models\Task;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Illuminate\Support\Collection;

class TaskReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithEvents
{
    protected int $workspaceId;
    protected array $filters;
    protected array $rowMeta = [];

    public function __construct(int $workspaceId, array $filters = [])
    {
        $this->workspaceId = $workspaceId;
        $this->filters = $filters;
    }

    public function collection(): Collection
    {
        $query = Task::whereHas('project', fn($q) => $q->where('workspace_id', $this->workspaceId))
            ->with(['taskStage', 'members', 'milestone', 'assignedUser', 'project']);

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%");
            });
        }
        if (!empty($this->filters['project_id']) && $this->filters['project_id'] !== 'all') {
            $query->where('project_id', $this->filters['project_id']);
        }
        if (!empty($this->filters['user_id']) && $this->filters['user_id'] !== 'all') {
            $userId = $this->filters['user_id'];
            $query->where(function ($q) use ($userId) {
                $q->where('assigned_to', $userId)
                    ->orWhereHas('members', fn($m) => $m->where('user_id', $userId));
            });
        }
        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->whereHas('taskStage', fn($q) => $q->where('name', $this->filters['status']));
        }
        if (!empty($this->filters['priority']) && $this->filters['priority'] !== 'all') {
            $query->where('priority', $this->filters['priority']);
        }

        $tasks = $query->orderBy('created_at', 'desc')->get();
        $this->rowMeta = $tasks->map(function ($task) {
            $dueDate = $task->end_date ?? $task->due_date;
            $isOverdue = $dueDate && Carbon::parse($dueDate)->isPast() && ($task->progress ?? 0) < 100;
            return ['overdue' => $isOverdue, 'status' => $task->taskStage?->name ?? 'To Do'];
        })->values()->all();

        return $tasks;
    }

    public function headings(): array
    {
        return [
            '№',
            'დავალება',
            'ფილიალი',
            'აღწერა',
            'დაწყების თარიღი',
            'ვადა',
            'პასუხისმგებელი',
            'სტატუსი',
        ];
    }

    public function map($task): array
    {
        $assignedUsers = collect();
        if ($task->assignedUser) $assignedUsers->push($task->assignedUser);
        if ($task->members?->count() > 0) $assignedUsers = $assignedUsers->merge($task->members);
        $assignedUsers = $assignedUsers->unique('id');
        $assignees = $assignedUsers->pluck('name')->join(', ') ?: '-';

        return [
            $task->id,
            $task->title,
            $task->project?->title ?? '-',
            $task->description ?? '',
            $task->start_date ? Carbon::parse($task->start_date)->format('Y-m-d') : '-',
            ($task->end_date ?? $task->due_date) ? Carbon::parse($task->end_date ?? $task->due_date)->format('Y-m-d') : '-',
            $assignees,
            $task->taskStage?->name ?? 'To Do',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 18]],
            'A:H' => ['font' => ['size' => 14]],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $sheet->getRowDimension(1)->setRowHeight(28);
                $highestRow = $sheet->getHighestRow();

                for ($row = 2; $row <= $highestRow; $row++) {
                    $metaIndex = $row - 2;
                    if (isset($this->rowMeta[$metaIndex])) {
                        $meta = $this->rowMeta[$metaIndex];

                        if ($meta['overdue']) {
                            $sheet->getStyle('F' . $row)->getFont()->getColor()->setARGB('FFDC2626');
                        }

                        $statusColor = $this->getStatusColor($meta['status']);
                        if ($statusColor) {
                            $sheet->getStyle('H' . $row)->applyFromArray([
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => ['argb' => $statusColor],
                                ],
                                'font' => ['color' => ['argb' => 'FF000000']],
                            ]);
                        }
                    }
                }
            },
        ];
    }

    private function getStatusColor(string $status): ?string
    {
        $statusLower = strtolower($status);
        $colors = [
            'done' => 'FFDCFCE7',
            'completed' => 'FFDCFCE7',
            'in progress' => 'FFDBEAFE',
            'inprogress' => 'FFDBEAFE',
            'review' => 'FFF3E8FF',
            'blocked' => 'FFFEE2E2',
            'to do' => 'FFF3F4F6',
            'todo' => 'FFF3F4F6',
            'on hold' => 'FFFEF9C3',
            'onhold' => 'FFFEF9C3',
        ];
        return $colors[$statusLower] ?? 'FFF3F4F6';
    }
}
