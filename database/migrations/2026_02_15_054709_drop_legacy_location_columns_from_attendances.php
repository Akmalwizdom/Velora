<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Drops legacy location tracking columns that are no longer used
     * with the QR-based attendance system.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['location_lat', 'location_lng', 'location_accuracy']);
        });

        // Remove legacy organization settings
        DB::table('organization_settings')
            ->whereIn('key', [
                'tracking.location_capture_enabled',
                'attendance.work_modes',
            ])
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->decimal('location_lat', 10, 8)->nullable()->after('device_type');
            $table->decimal('location_lng', 11, 8)->nullable()->after('location_lat');
            $table->decimal('location_accuracy', 8, 2)->nullable()->after('location_lng');
        });
    }
};
