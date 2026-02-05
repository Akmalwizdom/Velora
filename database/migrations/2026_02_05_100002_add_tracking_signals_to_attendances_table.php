<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Device awareness (lightweight audit signal, not exposed prominently in UI)
            $table->string('device_type')->nullable()->after('status'); // web, mobile

            // Lightweight location signal (check-in moment ONLY, organization-configurable)
            // Never used for continuous tracking or movement monitoring
            $table->decimal('location_lat', 10, 8)->nullable()->after('device_type');
            $table->decimal('location_lng', 11, 8)->nullable()->after('location_lat');
            $table->string('location_accuracy')->nullable()->after('location_lng'); // high, medium, low, unavailable
        });

        // Update work_mode column to support extensible modes
        // Current: office, remote
        // Adding: hybrid, business_trip
        // Design is extensible - new modes can be added without schema change
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'device_type',
                'location_lat',
                'location_lng',
                'location_accuracy',
            ]);
        });
    }
};
