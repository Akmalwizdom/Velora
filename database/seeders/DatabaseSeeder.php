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
        // Seed roles and teams first (required dependencies)
        $this->call([
            RoleSeeder::class,
            TeamSeeder::class,
        ]);

        // Bootstrap the initial system administrator
        // This only runs once - subsequent runs are skipped
        $this->call(AdminBootstrapSeeder::class);

        // Create test employee user (for development only)
        if (app()->environment('local', 'testing')) {
            $employeeRole = Role::where('name', Role::EMPLOYEE)->first();

            User::factory()->create([
                'name' => 'Test Employee',
                'email' => 'employee@velora.test',
                'role_id' => $employeeRole?->id,
                'status' => User::STATUS_ACTIVE,
            ]);
        }
    }
}
