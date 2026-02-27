<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->where('lang', 'ru')->update(['lang' => 'en']);
    }

    public function down(): void
    {
        // No rollback - Russian was intentionally removed
    }
};
