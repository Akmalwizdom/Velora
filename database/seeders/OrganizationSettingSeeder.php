<?php

namespace Database\Seeders;

use App\Models\OrganizationSetting;
use Illuminate\Database\Seeder;

class OrganizationSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. QR Attendance Configuration
        OrganizationSetting::set('attendance.qr_mode', 'required', 'string');
        OrganizationSetting::set('attendance.qr_ttl_seconds', 30, 'integer');

        // 2. Privacy & Tracking Configuration (Simplified)
        OrganizationSetting::set('tracking.location_capture_enabled', false, 'boolean');
        OrganizationSetting::set('tracking.device_type_capture_enabled', true, 'boolean');

        // 3. Work Modes (Keeping basic set, though Hub defaults to Office)
        OrganizationSetting::set('attendance.work_modes', ['office', 'remote'], 'json');
    }
}
