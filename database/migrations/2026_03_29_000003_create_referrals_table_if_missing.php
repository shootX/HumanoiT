<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('referrals')) {
            return;
        }

        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('commission_percentage', 5, 2);
            $table->decimal('amount', 10, 2);
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index(['company_id']);
            $table->index(['user_id']);
        });
    }

    public function down(): void
    {
        // no-op: safety net for conditional legacy migrations.
    }
};

