<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('assets') && !Schema::hasColumn('assets', 'asset_category_id')) {
            Schema::table('assets', function (Blueprint $table) {
                $table->foreignId('asset_category_id')->nullable()->after('workspace_id')->constrained('asset_categories')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('assets') && Schema::hasColumn('assets', 'asset_category_id')) {
            Schema::table('assets', function (Blueprint $table) {
                $table->dropForeign(['asset_category_id']);
            });
        }
    }
};
