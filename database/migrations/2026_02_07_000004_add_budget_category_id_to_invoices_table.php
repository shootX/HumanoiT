<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->unsignedBigInteger('budget_category_id')->nullable()->after('project_id');
            $table->foreign('budget_category_id')->references('id')->on('budget_categories')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['budget_category_id']);
            $table->dropColumn('budget_category_id');
        });
    }
};
