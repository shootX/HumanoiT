<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            if (!Schema::hasColumn('invoice_items', 'unit_id')) {
                $table->foreignId('unit_id')->nullable()->after('asset_category_id')->constrained('units')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            if (Schema::hasColumn('invoice_items', 'unit_id')) {
                $table->dropConstrainedForeignId('unit_id');
            }
        });
    }
};
