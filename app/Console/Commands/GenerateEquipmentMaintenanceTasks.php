<?php

namespace App\Console\Commands;

use App\Models\EquipmentSchedule;
use App\Models\Task;
use App\Models\TaskStage;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateEquipmentMaintenanceTasks extends Command
{
    protected $signature = 'equipment:generate-maintenance-tasks';

    protected $description = 'Generate maintenance tasks for equipment when advance_days before next service';

    public function handle(): int
    {
        $today = Carbon::today();
        $schedules = EquipmentSchedule::with(['equipment.project', 'serviceType'])
            ->get();

        $created = 0;
        foreach ($schedules as $schedule) {
            $taskDue = $schedule->task_due_date;
            if (!$taskDue || $taskDue->isFuture()) {
                continue;
            }

            $equipment = $schedule->equipment;
            if (!$equipment || !$equipment->project_id) {
                continue;
            }

            $existingTask = Task::where('equipment_schedule_id', $schedule->id)
                ->where('progress', '<', 100)
                ->exists();
            if ($existingTask) {
                continue;
            }

            $firstStage = TaskStage::forWorkspace($equipment->workspace_id)
                ->ordered()
                ->first();
            if (!$firstStage) {
                continue;
            }

            Task::create([
                'project_id' => $equipment->project_id,
                'task_stage_id' => $firstStage->id,
                'equipment_id' => $equipment->id,
                'equipment_schedule_id' => $schedule->id,
                'title' => __('Service: :equipment - :service', [
                    'equipment' => $equipment->name,
                    'service' => $schedule->serviceType->name,
                ]),
                'description' => __('Scheduled maintenance for :equipment. Next service due: :date', [
                    'equipment' => $equipment->name,
                    'date' => $schedule->next_service_date?->format('Y-m-d'),
                ]),
                'priority' => 'medium',
                'due_date' => $schedule->next_service_date,
                'end_date' => $schedule->next_service_date,
                'progress' => 0,
                'created_by' => $equipment->workspace->owner_id ?? 1,
            ]);
            $created++;
        }

        $this->info("Created {$created} maintenance task(s).");
        return 0;
    }
}
