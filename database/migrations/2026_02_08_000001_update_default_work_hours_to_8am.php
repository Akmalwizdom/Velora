<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing default work schedule to new hours (08:00 - 16:30)
        DB::table('work_schedules')
            ->where('is_default', true)
            ->update([
                'start_time' => '08:00:00',
                'end_time' => '16:30:00',
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to old default (09:00 - 18:00)
        DB::table('work_schedules')
            ->where('is_default', true)
            ->update([
                'start_time' => '09:00:00',
                'end_time' => '18:00:00',
                'updated_at' => now(),
            ]);
    }
};
