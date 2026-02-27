<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'equipment_id')) {
                $table->foreignId('equipment_id')->nullable()->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('tasks', 'equipment_schedule_id')) {
                $table->foreignId('equipment_schedule_id')->nullable()->constrained()->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'equipment_id')) {
                $table->dropForeign(['equipment_id']);
            }
            if (Schema::hasColumn('tasks', 'equipment_schedule_id')) {
                $table->dropForeign(['equipment_schedule_id']);
            }
        });
    }
};
