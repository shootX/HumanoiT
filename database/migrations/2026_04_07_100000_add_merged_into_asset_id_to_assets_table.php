<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            if (!Schema::hasColumn('assets', 'merged_into_asset_id')) {
                $table->foreignId('merged_into_asset_id')
                    ->nullable()
                    ->after('workspace_id')
                    ->constrained('assets')
                    ->restrictOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            if (Schema::hasColumn('assets', 'merged_into_asset_id')) {
                $table->dropConstrainedForeignId('merged_into_asset_id');
            }
        });
    }
};
