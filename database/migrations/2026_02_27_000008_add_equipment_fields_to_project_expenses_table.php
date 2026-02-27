<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_expenses', function (Blueprint $table) {
            if (!Schema::hasColumn('project_expenses', 'equipment_id')) {
                $table->foreignId('equipment_id')->nullable()->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('project_expenses', 'service_type_id')) {
                $table->foreignId('service_type_id')->nullable()->constrained()->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('project_expenses', function (Blueprint $table) {
            if (Schema::hasColumn('project_expenses', 'equipment_id')) {
                $table->dropForeign(['equipment_id']);
            }
            if (Schema::hasColumn('project_expenses', 'service_type_id')) {
                $table->dropForeign(['service_type_id']);
            }
        });
    }
};
