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

    public function up(): void
    {
        $budgetIds = DB::table('project_budgets')->pluck('id');

        foreach ($budgetIds as $projectBudgetId) {
            $existingNames = DB::table('budget_categories')
                ->where('project_budget_id', $projectBudgetId)
                ->pluck('name')
                ->toArray();

            foreach ($this->categories as $cat) {
                if (in_array($cat['name'], $existingNames, true)) {
                    continue;
                }
                DB::table('budget_categories')->insert([
                    'project_budget_id' => $projectBudgetId,
                    'name' => $cat['name'],
                    'allocated_amount' => 0,
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
        $names = array_column($this->categories, 'name');
        DB::table('budget_categories')->whereIn('name', $names)->delete();
    }
};
