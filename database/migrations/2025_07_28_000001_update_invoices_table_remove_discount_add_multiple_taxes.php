<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Remove discount_amount column only if it exists
            if (Schema::hasColumn('invoices', 'discount_amount')) {
                $table->dropColumn('discount_amount');
            }
            
            // Change tax_rate to json to store multiple tax rates
            $table->json('tax_rate')->change();
        });
    }

    public function down()
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Add back discount_amount column only if it doesn't exist
            if (!Schema::hasColumn('invoices', 'discount_amount')) {
                $table->decimal('discount_amount', 15, 2)->default(0);
            }
            
            // Change tax_rate back to decimal
            $table->decimal('tax_rate', 5, 2)->default(0)->change();
        });
    }
};