<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('invoices') && !Schema::hasColumn('invoices', 'task_id')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->unsignedBigInteger('task_id')->nullable()->after('project_id');
                $table->foreign('task_id')->references('id')->on('tasks')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('invoices') && Schema::hasColumn('invoices', 'task_id')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->dropForeign(['task_id']);
            });
        }
    }
};
