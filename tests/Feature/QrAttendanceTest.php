<?php

use App\Models\Attendance;
use App\Models\OrganizationSetting;
use App\Models\QrSession;
use App\Models\User;
use App\Services\QrAttendanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles for User model booter
    \App\Models\Role::create(['name' => 'admin', 'display_name' => 'Admin']);
    \App\Models\Role::create(['name' => 'employee', 'display_name' => 'Employee']);
    \App\Models\Role::create(['name' => 'hr', 'display_name' => 'HR']);
    \App\Models\Role::create(['name' => 'manager', 'display_name' => 'Manager']);

    $this->admin = User::factory()->create([
        'role_id' => \App\Models\Role::getAdminId(),
        'status' => User::STATUS_ACTIVE,
    ]); // Admin
    $this->employee = User::factory()->create([
        'role_id' => \App\Models\Role::getEmployeeId(),
        'status' => User::STATUS_ACTIVE,
    ]); // Employee
    $this->qrService = app(QrAttendanceService::class);
});

test('admin can generate a secure QR token', function () {
    $session = $this->qrService->generateToken($this->admin);

    expect($session)->toHaveKeys(['token', 'expires_at', 'session_id', 'ttl']);
    expect(QrSession::count())->toBe(1);
    
    $dbSession = QrSession::first();
    expect($dbSession->token_hash)->toBe(hash('sha256', $session['token']));
    expect($dbSession->status)->toBe(QrSession::STATUS_ACTIVE);
});

test('employee can validate presence using QR token', function () {
    $sessionData = $this->qrService->generateToken($this->admin);
    
    $response = $this->actingAs($this->employee)
        ->postJson(route('qr.validate'), [
            'token' => $sessionData['token'],
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('success', true);

    expect(Attendance::count())->toBe(1);
    $attendance = Attendance::first();
    expect($attendance->user_id)->toBe($this->employee->id);
    expect($attendance->validation_method)->toBe('qr');

    $dbSession = QrSession::find($sessionData['session_id']);
    expect($dbSession->status)->toBe(QrSession::STATUS_CONSUMED);
    expect($dbSession->consumed_by)->toBe($this->employee->id);
    expect($dbSession->attendance_id)->toBe($attendance->id);
});

test('QR token cannot be replayed', function () {
    $sessionData = $this->qrService->generateToken($this->admin);
    
    // First use
    $this->actingAs($this->employee)
        ->postJson(route('qr.validate'), ['token' => $sessionData['token']]);
        
    // Second use (replay attempt)
    $response = $this->actingAs($this->employee)
        ->postJson(route('qr.validate'), ['token' => $sessionData['token']]);

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'This QR code has already been used.');
});

test('expired QR token is rejected', function () {
    // Force set TTL to 1s for test
    config(['app.key' => 'base64:uzv3Z9p3N9X8N9B9v9X8N9B9v9X8N9B9v9X8N9B9v9U=']); // Use static key for predictability in high-speed tests if needed
    
    $sessionData = $this->qrService->generateToken($this->admin);
    
    // Simulate expiration by moving time forward
    $this->travel(40)->seconds();

    $response = $this->actingAs($this->employee)
        ->postJson(route('qr.validate'), ['token' => $sessionData['token']]);

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'This QR code has expired. Please scan the latest code.');
});

test('tampered QR token is rejected', function () {
    $sessionData = $this->qrService->generateToken($this->admin);
    $tamperedToken = $sessionData['token'] . 'extra_stuff';

    $response = $this->actingAs($this->employee)
        ->postJson(route('qr.validate'), ['token' => $tamperedToken]);

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Invalid QR code. Please scan a valid code.');
});

test('validation involves rate limiting', function () {
    $sessionData = $this->qrService->generateToken($this->admin);
    
    // Hit it 6 times in a row
    for ($i = 0; $i < 5; $i++) {
        $this->actingAs($this->employee)
            ->postJson(route('qr.validate'), ['token' => 'some-junk']);
    }
    
    $response = $this->actingAs($this->employee)
        ->postJson(route('qr.validate'), ['token' => 'some-junk']);

    $response->assertStatus(429); // Too Many Requests
});
