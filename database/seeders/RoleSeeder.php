<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => Role::EMPLOYEE, 'display_name' => 'Employee'],
            ['name' => Role::HR, 'display_name' => 'Human Resources'],
            ['name' => Role::MANAGER, 'display_name' => 'Manager'],
            ['name' => Role::ADMIN, 'display_name' => 'Administrator'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
