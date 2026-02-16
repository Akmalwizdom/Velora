<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateQrSession extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-qr-session {--type= : Core session type (check_in or check_out)} {--force : Force generation regardless of schedule}';

    protected $description = 'Automatically generate QR sessions based on the work schedule';

    public function handle(\App\Services\QrAttendanceService $qrService)
    {
        $type = $this->option('type');
        $force = $this->option('force');

        // 1. Determine session type if not forced
        if (!$type) {
            $schedule = \App\Models\WorkSchedule::default()->first();
            if (!$schedule) {
                $this->error('No default work schedule found.');
                return 1;
            }

            if (!$force && !$schedule->isWorkDay(now()->format('l'))) {
                $this->info('Today is not a work day. Skipping QR generation.');
                return 0;
            }

            $now = now();
            $startTime = \Illuminate\Support\Carbon::parse($schedule->start_time);
            $endTime = \Illuminate\Support\Carbon::parse($schedule->end_time);

            // Logic: 15 mins before start/end
            if ($now->between($startTime->copy()->subMinutes(16), $startTime->copy()->addHours(2))) {
                $type = \App\Models\QrSession::TYPE_CHECK_IN;
            } elseif ($now->between($endTime->copy()->subMinutes(16), $endTime->copy()->addHours(2))) {
                $type = \App\Models\QrSession::TYPE_CHECK_OUT;
            } else {
                if (!$force) {
                    $this->info('Not within a session window. Skipping.');
                    return 0;
                }
                $type = \App\Models\QrSession::TYPE_CHECK_IN; // Default fallback for force
            }
        }

        // 2. Find a generator (Admin)
        $admin = \App\Models\User::whereHas('role', function($q) {
            $q->where('name', \App\Models\Role::ADMIN);
        })->first();

        if (!$admin) {
            $this->error('No admin user found to generate QR session.');
            return 1;
        }

        // 3. Generate Token
        $session = $qrService->generateToken($admin, $type);

        $this->info("Successfully generated {$type} QR session (ID: {$session['session_id']})");
        return 0;
    }
}
