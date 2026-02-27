<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment_consumable_limits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_type_id')->constrained()->onDelete('cascade');
            $table->string('consumable_type'); // freon, fuel, etc.
            $table->decimal('max_quantity', 12, 4);
            $table->string('unit', 20)->default('kg');
            $table->timestamps();

            $table->unique(['equipment_type_id', 'consumable_type'], 'eq_consumable_type_unique');
            $table->index(['equipment_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_consumable_limits');
    }
};
