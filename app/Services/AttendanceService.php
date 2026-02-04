<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    /**
     * Check in a user.
     */
    public function checkIn(User $user, string $workMode = 'office', ?string $cluster = null): Attendance
    {
        // Check if already checked in today
        $existing = $user->todayAttendance;

        if ($existing?->isActive()) {
            throw new \RuntimeException('Already checked in. Please check out first.');
        }

        $scheduledStart = Carbon::today()->setHour(9); // 09:00
        $now = now();

        $status = $now->gt($scheduledStart->addMinutes(15))
            ? 'late'
            : 'on_time';

        return Attendance::create([
            'user_id' => $user->id,
            'checked_in_at' => $now,
            'work_mode' => $workMode,
            'cluster' => $cluster ?? $this->generateCluster(),
            'status' => $status,
        ]);
    }

    /**
     * Check out a user.
     */
    public function checkOut(User $user, ?string $note = null): Attendance
    {
        $attendance = $user->todayAttendance;

        if (! $attendance || ! $attendance->isActive()) {
            throw new \RuntimeException('No active session found. Please check in first.');
        }

        $attendance->update([
            'checked_out_at' => now(),
            'note' => $note,
        ]);

        return $attendance->fresh();
    }

    /**
     * Check if user has an active session.
     */
    public function isSessionActive(User $user): bool
    {
        return $user->todayAttendance?->isActive() ?? false;
    }

    /**
     * Get today's status for a user.
     */
    public function getTodayStatus(User $user): array
    {
        $attendance = $user->todayAttendance;

        return [
            'status' => $attendance?->status ?? 'not_checked_in',
            'checkedInAt' => $attendance?->checked_in_at?->format('H:i'),
            'schedule' => '09:00 - 18:00',
            'cluster' => $attendance?->cluster ?? 'N/A',
            'workMode' => $attendance?->work_mode ?? 'office',
        ];
    }

    /**
     * Get weekly progress for a user.
     */
    public function getWeeklyProgress(User $user): array
    {
        $targetHours = 40;
        $hoursWorked = $user->getWeeklyHours();
        $percentage = min(100, round(($hoursWorked / $targetHours) * 100));

        return [
            'hoursWorked' => round($hoursWorked, 1),
            'targetHours' => $targetHours,
            'percentage' => $percentage,
        ];
    }

    /**
     * Get performance data for a user.
     */
    public function getPerformanceData(User $user): array
    {
        // Get last 7 days of attendance for the bar chart
        $weeklyBars = [];
        $startOfWeek = now()->startOfWeek();

        for ($i = 0; $i < 7; $i++) {
            $day = $startOfWeek->copy()->addDays($i);
            $attendance = Attendance::forUser($user->id)
                ->whereDate('checked_in_at', $day)
                ->first();

            $hours = $attendance?->getDurationInHours() ?? 0;
            $weeklyBars[] = min(100, round(($hours / 8) * 100)); // 8h = 100%
        }

        // Calculate trend (simplified)
        $thisWeekHours = $user->getWeeklyHours();
        $trend = $thisWeekHours > 0 ? round(($thisWeekHours / 40) * 12.4, 1) : 0;

        return [
            'trend' => $trend,
            'weeklyBars' => $weeklyBars,
        ];
    }

    /**
     * Get active team members.
     */
    public function getActiveTeamMembers(): array
    {
        $activeUsers = User::whereHas('attendances', function ($query) {
            $query->today()->active();
        })
            ->with('role')
            ->limit(5)
            ->get();

        $members = $activeUsers->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => 'https://i.pravatar.cc/150?u='.$user->id,
        ])->toArray();

        $totalActive = Attendance::today()->active()->count();
        $remainingCount = max(0, $totalActive - 4);

        return [
            'members' => $members,
            'remainingCount' => $remainingCount,
            'totalActive' => $totalActive,
        ];
    }

    /**
     * Generate a random cluster identifier.
     */
    private function generateCluster(): string
    {
        return 'Node-'.str_pad((string) random_int(1, 12), 2, '0', STR_PAD_LEFT);
    }
}
