<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\TaskStage;
use App\Models\ProjectExpense;
use App\Models\Asset;
use App\Models\Equipment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendDailyReport extends Command
{
    protected $signature = 'report:daily';

    protected $description = 'Send daily report by email at 21:00';

    public function handle(): int
    {
        $email = env('DAILY_REPORT_EMAIL');

        if (!$email) {
            $this->warn('DAILY_REPORT_EMAIL not configured. Skipping.');
            return 0;
        }

        $today = Carbon::today();

        $doneStageIds = TaskStage::where(function ($q) {
            $q->where('name', 'like', '%done%')
                ->orWhere('name', 'like', '%completed%')
                ->orWhere('name', 'like', '%finished%');
        })->pluck('id');

        $completedTasks = Task::whereIn('task_stage_id', $doneStageIds)
            ->whereDate('updated_at', $today)
            ->with(['project', 'assignedTo'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $newTasks = Task::whereDate('created_at', $today)
            ->with(['project', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->get();

        $newAssets = Asset::whereDate('created_at', $today)
            ->with(['project'])
            ->get();

        $newEquipment = Equipment::whereDate('created_at', $today)
            ->with(['project', 'equipmentType'])
            ->get();

        $expenses = ProjectExpense::whereDate('expense_date', $today)
            ->with(['project', 'budgetCategory', 'submitter'])
            ->orderBy('expense_date', 'desc')
            ->get();

        $totalSpent = $expenses->sum('amount');

        $data = [
            'date' => $today->format('d.m.Y'),
            'completedTasks' => $completedTasks,
            'newTasks' => $newTasks,
            'newAssets' => $newAssets,
            'newEquipment' => $newEquipment,
            'expenses' => $expenses,
            'totalSpent' => $totalSpent,
        ];

        try {
            Mail::send('emails.daily-report', $data, function ($message) use ($email) {
                $message->to($email)
                    ->subject(config('app.name') . ' - ყოველდღიური რეპორტი ' . Carbon::today()->format('d.m.Y'));
            });
            $this->info('Daily report sent to ' . $email);
        } catch (\Exception $e) {
            $this->error('Failed to send report: ' . $e->getMessage());
            \Log::error('Daily report failed: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
