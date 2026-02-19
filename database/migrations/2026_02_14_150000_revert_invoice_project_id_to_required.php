<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        $nulls = DB::table('invoices')->whereNull('project_id')->get();
        foreach ($nulls as $inv) {
            $projectId = DB::table('projects')->where('workspace_id', $inv->workspace_id)->value('id');
            if ($projectId) {
                DB::table('invoices')->where('id', $inv->id)->update(['project_id' => $projectId]);
            }
        }

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->unsignedBigInteger('project_id')->nullable(false)->change();
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->unsignedBigInteger('project_id')->nullable()->change();
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
        });
    }
};
