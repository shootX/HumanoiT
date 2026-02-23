<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('invoice_project')) {
            Schema::create('invoice_project', function (Blueprint $table) {
                $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
                $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
                $table->primary(['invoice_id', 'project_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_project');
    }
};
