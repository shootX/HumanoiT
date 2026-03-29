<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('assets')) {
            Schema::create('assets', function (Blueprint $table) {
                $table->id();
                $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
                $table->foreignId('project_id')->nullable()->constrained()->onDelete('set null');
                $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
                $table->string('name');
                $table->string('asset_code')->nullable();
                $table->string('type')->nullable();
                $table->string('location')->nullable();
                $table->date('purchase_date')->nullable();
                $table->date('warranty_until')->nullable();
                $table->enum('status', ['active', 'maintenance', 'retired'])->default('active');
                $table->decimal('value', 15, 2)->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index(['workspace_id', 'status']);
                $table->index(['project_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
