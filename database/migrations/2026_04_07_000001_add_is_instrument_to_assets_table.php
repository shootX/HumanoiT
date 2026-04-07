<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            if (!Schema::hasColumn('assets', 'is_instrument')) {
                $table->boolean('is_instrument')->default(false);
                $table->index(['workspace_id', 'is_instrument']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            if (Schema::hasColumn('assets', 'is_instrument')) {
                $table->dropIndex(['workspace_id', 'is_instrument']);
                $table->dropColumn('is_instrument');
            }
        });
    }
};
