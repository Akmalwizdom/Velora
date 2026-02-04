<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $teams = [
            'Engineering',
            'Design',
            'Product',
            'Marketing',
            'Operations',
        ];

        foreach ($teams as $name) {
            Team::firstOrCreate(['name' => $name]);
        }
    }
}
