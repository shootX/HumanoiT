<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('equipment_type_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('qr_token', 64)->unique()->nullable();
            $table->date('installation_date')->nullable();
            $table->date('last_service_date')->nullable();
            $table->enum('health_status', ['green', 'yellow', 'red'])->default('green');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['workspace_id']);
            $table->index(['project_id']);
            $table->index(['equipment_type_id']);
            $table->index(['qr_token']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
