<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'google_sheet_sync_key')) {
                $table->string('google_sheet_sync_key', 512)->nullable()->after('google_calendar_event_id');
                $table->index('google_sheet_sync_key');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['google_sheet_sync_key']);
            $table->dropColumn('google_sheet_sync_key');
        });
    }
};
