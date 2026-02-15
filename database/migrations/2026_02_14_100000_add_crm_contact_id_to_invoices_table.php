<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->unsignedBigInteger('crm_contact_id')->nullable()->after('client_id');
            $table->foreign('crm_contact_id')->references('id')->on('crm_contacts')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['crm_contact_id']);
            $table->dropColumn('crm_contact_id');
        });
    }
};
