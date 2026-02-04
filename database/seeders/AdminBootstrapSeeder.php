<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminBootstrapSeeder extends Seeder
{
    /**
     * Seed the initial system administrator.
     * 
     * SECURITY: This seeder runs ONLY ONCE and creates the initial admin
     * using environment variables. After the first admin is created,
     * subsequent runs are skipped.
     */
    public function run(): void
    {
        // Guard: Skip if any admin already exists
        $adminExists = User::whereHas('role', function ($query) {
            $query->where('name', Role::ADMIN);
        })->exists();

        if ($adminExists) {
            $this->command->warn('⚠️  Admin already exists. Skipping bootstrap to prevent duplicate.');
            return;
        }

        // Get credentials from environment
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');
        $name = env('ADMIN_NAME', 'System Administrator');

        // Validate required environment variables
        if (!$email || !$password) {
            $this->command->error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env for bootstrap.');
            $this->command->info('   Add these to your .env file:');
            $this->command->info('   ADMIN_EMAIL=your-admin@example.com');
            $this->command->info('   ADMIN_PASSWORD=your-secure-password');
            return;
        }

        // Get admin role
        $adminRoleId = Role::getAdminId();

        if (!$adminRoleId) {
            $this->command->error('❌ Admin role not found. Run RoleSeeder first.');
            return;
        }

        // Create the system administrator
        $admin = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role_id' => $adminRoleId,
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);

        $this->command->info("✅ System Administrator created successfully!");
        $this->command->info("   Email: {$email}");
        $this->command->warn('⚠️  Please change the password after first login.');
        $this->command->warn('⚠️  Remove ADMIN_PASSWORD from .env after setup.');
    }
}
