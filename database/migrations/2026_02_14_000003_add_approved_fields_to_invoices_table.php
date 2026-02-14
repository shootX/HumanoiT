<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('invoices') && !Schema::hasColumn('invoices', 'approved_at')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->timestamp('approved_at')->nullable()->after('sent_at');
                $table->unsignedBigInteger('approved_by')->nullable()->after('approved_at');
                $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('invoices') && Schema::hasColumn('invoices', 'approved_at')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->dropForeign(['approved_by']);
                $table->dropColumn(['approved_at', 'approved_by']);
            });
        }
    }
};
