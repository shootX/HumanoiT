<?php

namespace App\Exports;

use App\Models\Project;
use App\Models\Task;
use App\Models\TimesheetEntry;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\Exportable;
use Illuminate\Support\Collection;

class ProjectTaskReportExport implements FromCollection, WithHeadings, WithMapping
{
    use Exportable;

    protected Project $project;
    protected ?array $filters;

    public function __construct(Project $project, ?array $filters = null)
    {
        $this->project = $project;
        $this->filters = $filters ?? [];
    }

    public function collection(): Collection
    {
        $query = Task::where('project_id', $this->project->id)
            ->with(['taskStage', 'members', 'milestone', 'assignedUser']);

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }
        if (!empty($this->filters['user_id']) && $this->filters['user_id'] !== 'all') {
            $query->where(function ($q) {
                $q->where('assigned_to', $this->filters['user_id'])
                    ->orWhereHas('members', fn($m) => $m->where('user_id', $this->filters['user_id']));
            });
        }
        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->whereHas('taskStage', fn($q) => $q->where('name', $this->filters['status']));
        }
        if (!empty($this->filters['priority']) && $this->filters['priority'] !== 'all') {
            $query->where('priority', $this->filters['priority']);
        }
        if (!empty($this->filters['milestone_id']) && $this->filters['milestone_id'] !== 'all') {
            $query->where('milestone_id', $this->filters['milestone_id']);
        }

        return $query->orderBy('created_at')->get();
    }

    public function headings(): array
    {
        return [
            '№',
            'დავალება',
            'მილსტოუნი',
            'აღწერა',
            'დაწყების თარიღი',
            'ვადა',
            'პასუხისმგებელი',
            'ჩაწერილი საათები',
            'პროგრესი',
            'პრიორიტეტი',
            'სტატუსი',
        ];
    }

    public function map($task): array
    {
        $loggedHours = TimesheetEntry::where('task_id', $task->id)->sum('hours');
        $assignedUsers = collect();
        if ($task->assignedUser) {
            $assignedUsers->push($task->assignedUser);
        }
        if ($task->members && $task->members->count() > 0) {
            $assignedUsers = $assignedUsers->merge($task->members);
        }
        $assignedUsers = $assignedUsers->unique('id');
        $assignees = $assignedUsers->pluck('name')->join(', ') ?: '-';

        return [
            $task->id,
            $task->title,
            $task->milestone?->title ?? '-',
            $task->description ?? '',
            $task->start_date ? \Carbon\Carbon::parse($task->start_date)->format('Y-m-d') : '-',
            ($task->end_date ?? $task->due_date) ? \Carbon\Carbon::parse($task->end_date ?? $task->due_date)->format('Y-m-d') : '-',
            $assignees,
            round($loggedHours, 2),
            ($task->progress ?? 0) . '%',
            ucfirst($task->priority ?? 'medium'),
            $task->taskStage?->name ?? 'To Do',
        ];
    }
}
