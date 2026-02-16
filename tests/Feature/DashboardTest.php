<?php

use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    // Ensure roles exist
    Role::firstOrCreate(['name' => 'admin'], ['name' => 'admin', 'display_name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'employee'], ['name' => 'employee', 'display_name' => 'Employee']);
});

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated admin users can access the dashboard', function () {
    // Dashboard requires manager or admin role with active status
    $role = Role::where('name', 'admin')->first();
    $user = User::factory()->create([
        'role_id' => $role->id,
        'status' => User::STATUS_ACTIVE,
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));
    // Should not be 403 (forbidden) or 302 (redirect to login)
    expect($response->status())->not->toBe(403);
    expect($response->status())->not->toBe(302);
});

test('authenticated users without proper role cannot visit the dashboard', function () {
    // Regular employee cannot access dashboard (team analytics)
    $role = Role::where('name', 'employee')->first();
    $user = User::factory()->create([
        'role_id' => $role->id,
        'status' => User::STATUS_ACTIVE,
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));
    $response->assertRedirect(route('attendance-hub'));
});

test('pending users are blocked from accessing protected routes', function () {
    $role = Role::where('name', 'admin')->first();
    $user = User::factory()->create([
        'role_id' => $role->id,
        'status' => User::STATUS_PENDING,
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));
    // Pending users should be redirected to approval waiting page
    $response->assertRedirect(route('pending-approval'));
});