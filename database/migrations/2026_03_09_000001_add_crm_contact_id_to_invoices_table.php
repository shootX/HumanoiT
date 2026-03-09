<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('invoices') && !Schema::hasColumn('invoices', 'crm_contact_id')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->foreignId('crm_contact_id')->nullable()->after('client_id')
                    ->constrained('crm_contacts')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('invoices') && Schema::hasColumn('invoices', 'crm_contact_id')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->dropForeign(['crm_contact_id']);
            });
        }
    }
};
