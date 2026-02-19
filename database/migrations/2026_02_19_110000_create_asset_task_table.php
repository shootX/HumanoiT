<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_task', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();
            $table->unique(['task_id', 'asset_id']);
        });

        // Migrate existing task.asset_id to pivot
        if (Schema::hasColumn('tasks', 'asset_id')) {
            $tasks = DB::table('tasks')->whereNotNull('asset_id')->get(['id', 'asset_id']);
            foreach ($tasks as $t) {
                DB::table('asset_task')->insert([
                    'task_id' => $t->id,
                    'asset_id' => $t->asset_id,
                    'quantity' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_task');
    }
};
