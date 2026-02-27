<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipment_service_photos', function (Blueprint $table) {
            $table->foreignId('media_item_id')->nullable()->after('task_id')->constrained()->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('equipment_service_photos', function (Blueprint $table) {
            $table->dropForeign(['media_item_id']);
        });
    }
};
