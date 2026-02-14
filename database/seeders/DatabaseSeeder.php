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
        // 1. Core Platform Setup (Dependencies first)
        $this->call([
            RoleSeeder::class,
            TeamSeeder::class,
            WorkScheduleSeeder::class,
            OrganizationSettingSeeder::class,
        ]);

        // 2. Initial System Access
        $this->call(AdminBootstrapSeeder::class);

        // 3. Development Personas (Local/Testing only)
        if (app()->environment('local', 'testing')) {
            // Create Test Manager
            User::factory()->create([
                'name' => 'Demo Manager',
                'email' => 'manager@velora.test',
                'role_id' => Role::getManagerId(),
                'status' => User::STATUS_ACTIVE,
            ]);

            // Create Test Employee
            User::factory()->create([
                'name' => 'Demo Employee',
                'email' => 'employee@velora.test',
                'role_id' => Role::getEmployeeId(),
                'status' => User::STATUS_ACTIVE,
            ]);
        }
    }
}
