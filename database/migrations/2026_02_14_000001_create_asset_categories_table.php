<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('asset_categories')) {
            Schema::create('asset_categories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
                $table->string('name');
                $table->string('color')->default('#3B82F6');
                $table->integer('order')->default(0);
                $table->timestamps();

                $table->index(['workspace_id', 'order']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_categories');
    }
};
