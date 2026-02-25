<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('asset_attachments')) {
            Schema::create('asset_attachments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
                $table->foreignId('asset_id')->constrained()->onDelete('cascade');
                $table->foreignId('media_item_id')->constrained()->onDelete('cascade');
                $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
                $table->timestamps();

                $table->index(['workspace_id', 'asset_id', 'created_at']);
                $table->index(['asset_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_attachments');
    }
};
