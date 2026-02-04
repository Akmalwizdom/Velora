<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and teams first
        $this->call([
            RoleSeeder::class,
            TeamSeeder::class,
        ]);

        // Create test user with admin role
        $adminRole = Role::where('name', Role::ADMIN)->first();

        User::factory()->create([
            'name' => 'wizdom',
            'email' => 'faiqihya@gmail.com',
            'role_id' => $adminRole?->id,
        ]);

        // Create a regular employee user
        $employeeRole = Role::where('name', Role::EMPLOYEE)->first();

        User::factory()->create([
            'name' => 'Employee',
            'email' => 'employee@gmail.com',
            'role_id' => $employeeRole?->id,
        ]);
    }
}
