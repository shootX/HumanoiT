<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('asset_warranty_cases')) {
            Schema::create('asset_warranty_cases', function (Blueprint $table) {
                $table->id();
                $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
                $table->foreignId('asset_id')->constrained()->onDelete('cascade');
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('status')->default('open');
                $table->date('opened_at')->nullable();
                $table->date('closed_at')->nullable();
                $table->timestamps();

                $table->index(['workspace_id', 'asset_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_warranty_cases');
    }
};
