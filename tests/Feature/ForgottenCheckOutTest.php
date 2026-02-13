<?php

use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin'], ['name' => 'admin', 'display_name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'manager'], ['name' => 'manager', 'display_name' => 'Manager']);
    Role::firstOrCreate(['name' => 'employee'], ['name' => 'employee', 'display_name' => 'Employee']);
});

test('auto-closure command closes sessions from previous days', function () {
    $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    
    // Create a stale session from yesterday
    $yesterday = now()->subDay()->setHour(9)->setMinute(0);
    $attendance = Attendance::create([
        'user_id' => $user->id,
        'checked_in_at' => $yesterday,
        'work_mode' => 'office',
        'status' => 'on_time',
        'cluster' => 'Node-01'
    ]);

    $this->artisan('attendance:close-stale-sessions')
        ->expectsOutput('Finding stale attendance sessions...')
        ->assertExitCode(0);

    $attendance->refresh();
    dd(\Illuminate\Support\Facades\DB::table('attendances')->where('id', $attendance->id)->first());
    expect($attendance->checked_out_at)->not->toBeNull();
    expect($attendance->checked_out_at->toDateTimeString())->toBe($yesterday->copy()->endOfDay()->toDateTimeString());
});

test('check-in is blocked by stale session with descriptive message', function () {
    $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    
    // Create a stale session from yesterday
    $yesterday = now()->subDay()->setHour(9)->setMinute(0);
    Attendance::create([
        'user_id' => $user->id,
        'checked_in_at' => $yesterday,
        'work_mode' => 'office',
        'status' => 'on_time',
        'cluster' => 'Node-01'
    ]);

    $response = $this->actingAs($user)->post(route('attendance.check-in'));
    
    $response->assertSessionHasErrors('check_in');
    $error = session('errors')->get('check_in')[0];
    expect($error)->toContain('active session from ' . $yesterday->format('M d, Y'));
});

test('user can request check-out correction', function () {
    $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    $attendance = Attendance::create([
        'user_id' => $user->id,
        'checked_in_at' => now(),
        'checked_out_at' => now()->addHours(8),
        'work_mode' => 'office',
        'status' => 'on_time',
        'cluster' => 'Node-01'
    ]);

    $response = $this->actingAs($user)
        ->post(route('corrections.store'), [
        'attendance_id' => $attendance->id,
        'type' => 'check_out',
        'proposed_time' => '17:30',
        'reason' => 'Forgot to check out on time',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success');
    $this->assertDatabaseHas('attendance_corrections', [
        'attendance_id' => $attendance->id,
        'type' => 'check_out',
        'requested_by' => $user->id,
        'reason' => 'Forgot to check out on time',
    ]);
});

test('manager can approve check-out correction', function () {
    $managerRole = Role::where('name', 'manager')->first();
    $manager = User::factory()->create(['role_id' => $managerRole->id, 'status' => User::STATUS_ACTIVE]);
    $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    
    // Create a team and add both to it to satisfy policy
    $team = \App\Models\Team::create(['name' => 'Engineering']);
    $manager->teams()->attach($team);
    $user->teams()->attach($team);
    
    $attendance = Attendance::create([
        'user_id' => $user->id,
        'checked_in_at' => now()->subDay()->setHour(9)->setMinute(0),
        'checked_out_at' => now()->subDay()->setHour(23)->setMinute(59), // auto-closed
        'work_mode' => 'office',
        'status' => 'on_time',
        'cluster' => 'Node-01'
    ]);

    $proposedTime = now()->subDay()->setHour(17)->setMinute(30)->startOfMinute();
    
    $correction = AttendanceCorrection::create([
        'attendance_id' => $attendance->id,
        'type' => 'check_out',
        'requested_by' => $user->id,
        'original_time' => $attendance->checked_out_at,
        'proposed_time' => $proposedTime,
        'reason' => 'Actually left at 17:30',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($manager)->post(route('corrections.approve', $correction));

    $response->assertSessionHas('success');
    $attendance->refresh();
    expect($attendance->checked_out_at->format('H:i'))->toBe('17:30');
    expect($correction->fresh()->status)->toBe('approved');
});
