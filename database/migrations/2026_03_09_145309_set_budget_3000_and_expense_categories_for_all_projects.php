<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const TOTAL_BUDGET = 3000;

    private array $categories = [
        ['name' => 'რემონტი', 'color' => '#3B82F6', 'sort_order' => 1],
        ['name' => 'დამ.საშუალების შეძენა', 'color' => '#8B5CF6', 'sort_order' => 2],
        ['name' => 'ავეჯი', 'color' => '#10B981', 'sort_order' => 3],
        ['name' => 'დეკორაცია', 'color' => '#F59E0B', 'sort_order' => 4],
    ];

    public function up(): void
    {
        $allocatedPerCategory = 0;
        $workspaces = DB::table('workspaces')->pluck('owner_id', 'id');

        $projects = DB::table('projects')
            ->leftJoin('project_budgets', 'projects.id', '=', 'project_budgets.project_id')
            ->select('projects.id as project_id', 'projects.workspace_id', 'project_budgets.id as budget_id')
            ->get();

        foreach ($projects as $project) {
            $budgetId = $project->budget_id;

            if (!$budgetId) {
                $createdBy = $workspaces[$project->workspace_id] ?? 1;
                $budgetId = DB::table('project_budgets')->insertGetId([
                    'project_id' => $project->project_id,
                    'workspace_id' => $project->workspace_id,
                    'total_budget' => self::TOTAL_BUDGET,
                    'period_type' => 'project',
                    'start_date' => now()->toDateString(),
                    'end_date' => null,
                    'description' => null,
                    'status' => 'active',
                    'created_by' => $createdBy,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('project_budgets')->where('id', $budgetId)->update([
                    'total_budget' => self::TOTAL_BUDGET,
                    'updated_at' => now(),
                ]);
            }

            DB::table('budget_categories')->where('project_budget_id', $budgetId)->delete();

            foreach ($this->categories as $cat) {
                DB::table('budget_categories')->insert([
                    'project_budget_id' => $budgetId,
                    'name' => $cat['name'],
                    'allocated_amount' => $allocatedPerCategory,
                    'color' => $cat['color'],
                    'sort_order' => $cat['sort_order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // Cannot safely revert - would need to restore previous state
    }
};
