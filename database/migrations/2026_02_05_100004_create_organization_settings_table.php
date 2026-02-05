<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, integer, json
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Seed default tracking settings
        DB::table('organization_settings')->insert([
            [
                'key' => 'tracking.location_capture_enabled',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Enable optional location capture at check-in. Location is NEVER tracked continuously.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'tracking.device_type_capture_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Capture device type (web/mobile) at check-in for audit purposes.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'attendance.work_modes',
                'value' => json_encode(['office', 'remote', 'hybrid', 'business_trip']),
                'type' => 'json',
                'description' => 'Available work modes for attendance tracking. Extensible without schema changes.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_settings');
    }
};
