<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->string('code', 32)->nullable()->after('name');
        });

        $prefix = 'EQ-';
        $rows = DB::table('equipment')->whereNull('code')->orderBy('id')->get();
        $n = 1;
        foreach ($rows as $row) {
            DB::table('equipment')->where('id', $row->id)->update(['code' => $prefix . str_pad((string) $n, 4, '0', STR_PAD_LEFT)]);
            $n++;
        }

        DB::statement('ALTER TABLE equipment MODIFY code VARCHAR(32) NOT NULL, ADD UNIQUE KEY equipment_code_unique (code)');
    }

    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};
