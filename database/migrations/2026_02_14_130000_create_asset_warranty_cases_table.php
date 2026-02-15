<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_warranty_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->text('damage_description')->nullable();
            $table->text('comment')->nullable();
            $table->string('status', 50)->default('repaired'); // repaired, not_repaired, not_done, not_warranty_case
            $table->timestamp('reported_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['asset_id', 'reported_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_warranty_cases');
    }
};
