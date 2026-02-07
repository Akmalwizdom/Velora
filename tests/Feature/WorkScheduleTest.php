<?php

use App\Models\Role;
use App\Models\User;
use App\Models\Team;
use App\Models\WorkSchedule;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin'], ['name' => 'admin', 'display_name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'employee'], ['name' => 'employee', 'display_name' => 'Employee']);
});

test('admin can access work schedules management', function () {
    $admin = User::factory()->create([
        'role_id' => Role::where('name', 'admin')->first()->id,
        'status' => User::STATUS_ACTIVE,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.work-schedules.index'));
    $response->assertOk();
});

test('employee cannot access work schedules management', function () {
    $employee = User::factory()->create([
        'role_id' => Role::where('name', 'employee')->first()->id,
        'status' => User::STATUS_ACTIVE,
    ]);

    $response = $this->actingAs($employee)->get(route('admin.work-schedules.index'));
    $response->assertForbidden();
});

test('admin can create a work schedule', function () {
    $admin = User::factory()->create([
        'role_id' => Role::where('name', 'admin')->first()->id,
        'status' => User::STATUS_ACTIVE,
    ]);

    $response = $this->actingAs($admin)->post(route('admin.work-schedules.store'), [
        'name' => 'Night Shift',
        'code' => 'NIGHT-1',
        'start_time' => '22:00',
        'end_time' => '06:00',
        'break_duration_minutes' => 60,
        'work_days' => ['monday', 'tuesday'],
        'late_tolerance_minutes' => 15,
        'is_default' => false,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('work_schedules', ['code' => 'NIGHT-1']);
});

test('schedule resolution hierarchy works correctly', function () {
    // 1. Create Default Schedule
    $default = WorkSchedule::create([
        'name' => 'Default',
        'code' => 'DEF',
        'start_time' => '09:00',
        'end_time' => '17:00',
        'work_days' => ['monday'],
        'is_default' => true,
    ]);

    // 2. Create Team Schedule
    $teamSchedule = WorkSchedule::create([
        'name' => 'Team Schedule',
        'code' => 'TEAM-SCH',
        'start_time' => '08:00',
        'end_time' => '16:00',
        'work_days' => ['monday'],
    ]);

    // 3. Create Individual Override
    $overrideSchedule = WorkSchedule::create([
        'name' => 'Override',
        'code' => 'OVR',
        'start_time' => '10:00',
        'end_time' => '19:00',
        'work_days' => ['monday'],
    ]);

    $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    $team = Team::create(['name' => 'Engineers']);
    $user->teams()->attach($team);

    // Initial state: should resolve to default
    expect($user->currentWorkSchedule()->code)->toBe('DEF');

    // Attach to team: should resolve to team schedule
    $team->workSchedules()->attach($teamSchedule, ['effective_from' => today()]);
    // Refresh user to load teams
    $user->load('teams.workSchedules');
    expect($user->currentWorkSchedule()->code)->toBe('TEAM-SCH');

    // Attach individual override: should resolve to override
    $user->workSchedules()->attach($overrideSchedule, [
        'effective_from' => today(),
        'is_override' => true
    ]);
    expect($user->currentWorkSchedule()->code)->toBe('OVR');
});

test('lateness detection uses assigned schedule', function () {
    // 08:00 start with 15m tolerance
    $schedule = WorkSchedule::create([
        'name' => 'Early Shift',
        'code' => 'EARLY',
        'start_time' => '08:00',
        'end_time' => '16:00',
        'work_days' => ['monday'],
        'late_tolerance_minutes' => 15,
        'is_default' => true,
    ]);

    $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    
    // Check-in at 08:10 (On Time)
    Carbon::setTestNow(today()->setHour(8)->setMinute(10));
    $attendanceService = app(\App\Services\AttendanceService::class);
    $attendance = $attendanceService->checkIn($user);
    expect($attendance->status)->toBe('on_time');

    $attendance->delete(); // cleanup for next test in same run if needed

    // Check-in at 08:20 (Late)
    Carbon::setTestNow(today()->setHour(8)->setMinute(20));
    $attendance2 = $attendanceService->checkIn($user);
    expect($attendance2->status)->toBe('late');
});
