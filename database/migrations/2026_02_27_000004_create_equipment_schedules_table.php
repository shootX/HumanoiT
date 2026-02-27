<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_type_id')->constrained()->onDelete('cascade');
            $table->integer('interval_days');
            $table->integer('advance_days')->default(5);
            $table->date('last_service_date')->nullable();
            $table->timestamps();

            $table->unique(['equipment_id', 'service_type_id']);
            $table->index(['equipment_id']);
            $table->index(['service_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_schedules');
    }
};
