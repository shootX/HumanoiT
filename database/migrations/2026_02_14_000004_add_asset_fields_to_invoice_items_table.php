<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('invoice_items')) {
            Schema::table('invoice_items', function (Blueprint $table) {
                if (!Schema::hasColumn('invoice_items', 'asset_category_id')) {
                    $table->unsignedBigInteger('asset_category_id')->nullable()->after('timesheet_entry_id');
                    $table->foreign('asset_category_id')->references('id')->on('asset_categories')->onDelete('set null');
                }
                if (!Schema::hasColumn('invoice_items', 'asset_name')) {
                    $table->string('asset_name')->nullable()->after('asset_category_id');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('invoice_items')) {
            Schema::table('invoice_items', function (Blueprint $table) {
                if (Schema::hasColumn('invoice_items', 'asset_category_id')) {
                    $table->dropForeign(['asset_category_id']);
                    $table->dropColumn('asset_category_id');
                }
                if (Schema::hasColumn('invoice_items', 'asset_name')) {
                    $table->dropColumn('asset_name');
                }
            });
        }
    }
};
