<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CloseStaleSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:close-stale-sessions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Close all active attendance sessions from previous days';

    /**
     * Execute the console command.
     */
    public function handle(\App\Services\AttendanceService $attendanceService)
    {
        $this->info('Finding stale attendance sessions...');

        $staleAttendances = \App\Models\Attendance::active()
            ->where('checked_in_at', '<', now()->startOfDay())
            ->with('user')
            ->get();

        if ($staleAttendances->isEmpty()) {
            $this->info('No stale sessions found.');
            return 0;
        }

        $this->info("Found {$staleAttendances->count()} stale sessions. Closing...");

        foreach ($staleAttendances as $attendance) {
            $schedule = $attendance->user->currentWorkSchedule();
            
            // Set logout time to 23:59:59 of the check-in day
            $logoutTime = $attendance->checked_in_at->copy()->endOfDay();
            
            $attendanceService->forceCheckOut(
                $attendance, 
                $logoutTime, 
                'Automated system closure for forgotten check-out.',
                'system'
            );

            $this->line("Closed session for {$attendance->user->name} (Checked in: {$attendance->checked_in_at})");
        }

        $this->info('All stale sessions closed successfully.');
        return 0;
    }
}
