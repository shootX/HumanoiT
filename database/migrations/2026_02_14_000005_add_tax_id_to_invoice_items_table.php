<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('invoice_items') && !Schema::hasColumn('invoice_items', 'tax_id')) {
            Schema::table('invoice_items', function (Blueprint $table) {
                $table->unsignedBigInteger('tax_id')->nullable()->after('amount');
                $table->foreign('tax_id')->references('id')->on('taxes')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('invoice_items') && Schema::hasColumn('invoice_items', 'tax_id')) {
            Schema::table('invoice_items', function (Blueprint $table) {
                $table->dropForeign(['tax_id']);
            });
        }
    }
};
