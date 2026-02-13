<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_expenses', function (Blueprint $table) {
            $table->unsignedBigInteger('invoice_id')->nullable()->after('task_id');
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('set null');
            $table->unique('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::table('project_expenses', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
            $table->dropUnique(['invoice_id']);
            $table->dropColumn('invoice_id');
        });
    }
};
