<?php

namespace Database\Seeders;

use App\Models\WorkSchedule;
use Illuminate\Database\Seeder;

class WorkScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Regular Office Hours (Default)
        WorkSchedule::create([
            'name' => 'Regular Office Hours',
            'code' => 'REG-OFFICE',
            'start_time' => '08:00',
            'end_time' => '16:30',
            'break_duration_minutes' => 60,
            'work_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'late_tolerance_minutes' => 15,
            'is_active' => true,
            'is_default' => true,
            'description' => 'Standard working hours for corporate operations.',
        ]);

        // 2. Morning Shift
        WorkSchedule::create([
            'name' => 'Morning Shift',
            'code' => 'SHIFT-MORNING',
            'start_time' => '06:00',
            'end_time' => '14:00',
            'break_duration_minutes' => 30,
            'work_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            'late_tolerance_minutes' => 10,
            'is_active' => true,
            'is_default' => false,
            'description' => 'Early morning operational shift.',
        ]);

        // 3. Evening Shift
        WorkSchedule::create([
            'name' => 'Evening Shift',
            'code' => 'SHIFT-EVENING',
            'start_time' => '14:00',
            'end_time' => '22:00',
            'break_duration_minutes' => 30,
            'work_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            'late_tolerance_minutes' => 10,
            'is_active' => true,
            'is_default' => false,
            'description' => 'Late afternoon and evening shift.',
        ]);

        // 4. Flexible Schedule
        WorkSchedule::create([
            'name' => 'Flexible Hours',
            'code' => 'FLEX-TIME',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'break_duration_minutes' => 60,
            'work_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'late_tolerance_minutes' => 60,
            'is_active' => true,
            'is_default' => false,
            'description' => 'Flexible schedule with higher late tolerance for remote teams.',
        ]);
    }
}
