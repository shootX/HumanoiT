<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('invoice_item_task')) {
            Schema::create('invoice_item_task', function (Blueprint $table) {
                $table->id();
                $table->foreignId('invoice_item_id')->constrained('invoice_items')->onDelete('cascade');
                $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
                $table->decimal('quantity', 15, 4)->default(1);
                $table->timestamps();
                $table->unique(['invoice_item_id', 'task_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_item_task');
    }
};
