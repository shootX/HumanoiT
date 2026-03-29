<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->decimal('quantity', 15, 2)->default(1.00)->change();
        });

        Schema::table('asset_task', function (Blueprint $table) {
            $table->decimal('quantity', 15, 2)->default(1.00)->change();
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->unsignedInteger('quantity')->default(1)->change();
        });

        Schema::table('asset_task', function (Blueprint $table) {
            $table->unsignedInteger('quantity')->default(1)->change();
        });
    }
};
