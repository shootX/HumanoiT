<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $categories = [
        ['name' => 'რემონტი', 'color' => '#3B82F6', 'sort_order' => 1],
        ['name' => 'მივლინება', 'color' => '#10B981', 'sort_order' => 2],
        ['name' => 'განთავსება', 'color' => '#F59E0B', 'sort_order' => 3],
        ['name' => 'საწვავი', 'color' => '#EF4444', 'sort_order' => 4],
        ['name' => 'დამ.საშუალებების შეძენა', 'color' => '#8B5CF6', 'sort_order' => 5],
    ];

    private const TOTAL_BUDGET = 3000;
    private const ALLOCATED_PER_CATEGORY = 600; // 3000 / 5

    public function up(): void
    {
        $projectsWithoutBudget = DB::table('projects')
            ->leftJoin('project_budgets', 'projects.id', '=', 'project_budgets.project_id')
            ->whereNull('project_budgets.id')
            ->select('projects.id as project_id', 'projects.workspace_id')
            ->get();

        $workspaces = DB::table('workspaces')->pluck('owner_id', 'id');

        foreach ($projectsWithoutBudget as $project) {
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

            foreach ($this->categories as $cat) {
                DB::table('budget_categories')->insert([
                    'project_budget_id' => $budgetId,
                    'name' => $cat['name'],
                    'allocated_amount' => self::ALLOCATED_PER_CATEGORY,
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
        $projectIds = DB::table('projects')
            ->leftJoin('project_budgets', 'projects.id', '=', 'project_budgets.project_id')
            ->where('project_budgets.total_budget', self::TOTAL_BUDGET)
            ->pluck('projects.id');

        $budgetIds = DB::table('project_budgets')
            ->whereIn('project_id', $projectIds)
            ->where('total_budget', self::TOTAL_BUDGET)
            ->pluck('id');

        DB::table('budget_categories')->whereIn('project_budget_id', $budgetIds)->delete();
        DB::table('project_budgets')->whereIn('id', $budgetIds)->delete();
    }
};
