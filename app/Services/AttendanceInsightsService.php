<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use App\Models\WeeklyRhythmSnapshot;
use Carbon\Carbon;

/**
 * Behavioral insights service for attendance patterns.
 *
 * Philosophy: Observational, not judgmental.
 * Favors glanceable visualization over dense analytics.
 * Uses neutral, supportive language throughout.
 */
class AttendanceInsightsService
{
    /**
     * Get weekly rhythm for a user.
     * Returns glanceable pattern data for visualization.
     */
    public function getWeeklyRhythm(User $user): array
    {
        $currentWeek = now()->weekOfYear;
        $currentYear = now()->year;

        // Get or compute current week snapshot
        $snapshot = $this->getOrCreateSnapshot($user, $currentYear, $currentWeek);

        return [
            'currentWeek' => [
                'onTimeDays' => $snapshot->on_time_days,
                'lateDays' => $snapshot->late_days,
                'absentDays' => $snapshot->absent_days,
                'totalHours' => $snapshot->total_hours,
                'pattern' => $snapshot->getPatternDescription(),
                'patternColor' => $snapshot->getPatternColor(),
            ],
            'dailyBreakdown' => $snapshot->daily_breakdown ?? $this->getEmptyBreakdown(),
            'trend' => $this->getRecentTrend($user),
        ];
    }

    /**
     * Get behavioral signals for a user.
     * OBSERVATIONAL ONLY - no scoring or punitive metrics.
     */
    public function getBehavioralSignals(User $user): array
    {
        $recentAttendance = Attendance::forUser($user->id)
            ->where('checked_in_at', '>=', now()->subWeeks(4))
            ->get();

        if ($recentAttendance->isEmpty()) {
            return [
                'signals' => [],
                'message' => 'Gathering pattern data...',
            ];
        }

        $signals = [];

        // Consistent presence detection
        $onTimeCount = $recentAttendance->where('status', 'on_time')->count();
        $totalDays = $recentAttendance->count();

        if ($totalDays >= 10 && ($onTimeCount / $totalDays) >= 0.8) {
            $signals[] = [
                'type' => 'positive',
                'label' => 'Consistent presence',
                'description' => 'Regular attendance pattern observed',
            ];
        }

        // Flexible schedule pattern
        $lateCount = $recentAttendance->where('status', 'late')->count();
        if ($totalDays >= 10 && ($lateCount / $totalDays) >= 0.4) {
            $signals[] = [
                'type' => 'neutral',
                'label' => 'Flexible schedule',
                'description' => 'Variable start times detected',
            ];
        }

        // Remote work pattern
        $remoteDays = $recentAttendance->whereIn('work_mode', ['remote', 'hybrid'])->count();
        if ($totalDays >= 5 && ($remoteDays / $totalDays) >= 0.5) {
            $signals[] = [
                'type' => 'neutral',
                'label' => 'Remote-forward',
                'description' => 'Primarily remote work pattern',
            ];
        }

        return [
            'signals' => $signals,
            'message' => count($signals) > 0 ? null : 'No distinct patterns detected',
        ];
    }

    /**
     * Refresh weekly rhythm snapshot for a user.
     * Called at end of week or on-demand.
     */
    public function refreshSnapshot(User $user, int $year, int $weekNumber): WeeklyRhythmSnapshot
    {
        $startOfWeek = Carbon::now()->setISODate($year, $weekNumber)->startOfWeek();
        $endOfWeek = $startOfWeek->copy()->endOfWeek();

        $attendances = Attendance::forUser($user->id)
            ->whereBetween('checked_in_at', [$startOfWeek, $endOfWeek])
            ->get();

        $dailyBreakdown = [];
        $totalHours = 0;
        $onTimeDays = 0;
        $lateDays = 0;
        $absentDays = 0;

        for ($i = 0; $i < 7; $i++) {
            $day = $startOfWeek->copy()->addDays($i);
            $dayAttendance = $attendances->first(fn ($a) => $a->checked_in_at->isSameDay($day));

            if ($dayAttendance) {
                $hours = $dayAttendance->getDurationInHours();
                $totalHours += $hours;
                $status = $dayAttendance->status;

                if ($status === 'on_time') $onTimeDays++;
                if ($status === 'late') $lateDays++;

                $dailyBreakdown[] = [
                    'day' => $day->format('D'),
                    'hours' => $hours,
                    'status' => $status,
                    'workMode' => $dayAttendance->work_mode,
                ];
            } else {
                // Only count as absent if it's a weekday and in the past
                if ($day->isWeekday() && $day->lt(now())) {
                    $absentDays++;
                }

                $dailyBreakdown[] = [
                    'day' => $day->format('D'),
                    'hours' => 0,
                    'status' => $day->isWeekend() ? 'weekend' : 'absent',
                    'workMode' => null,
                ];
            }
        }

        return WeeklyRhythmSnapshot::updateOrCreate(
            [
                'user_id' => $user->id,
                'year' => $year,
                'week_number' => $weekNumber,
            ],
            [
                'on_time_days' => $onTimeDays,
                'late_days' => $lateDays,
                'absent_days' => $absentDays,
                'total_hours' => $totalHours,
                'daily_breakdown' => $dailyBreakdown,
            ]
        );
    }

    /**
     * Get or create snapshot for a specific week.
     */
    private function getOrCreateSnapshot(User $user, int $year, int $weekNumber): WeeklyRhythmSnapshot
    {
        $snapshot = WeeklyRhythmSnapshot::forUser($user->id)
            ->forWeek($year, $weekNumber)
            ->first();

        if (!$snapshot) {
            $snapshot = $this->refreshSnapshot($user, $year, $weekNumber);
        }

        return $snapshot;
    }

    /**
     * Get recent trend summary.
     * Returns simple visual data for 4-week pattern.
     */
    private function getRecentTrend(User $user): array
    {
        $snapshots = WeeklyRhythmSnapshot::forUser($user->id)
            ->recent(4)
            ->orderBy('year', 'asc')
            ->orderBy('week_number', 'asc')
            ->get();

        return $snapshots->map(fn ($s) => [
            'week' => "W{$s->week_number}",
            'hours' => $s->total_hours,
            'pattern' => $s->getPatternColor(),
        ])->toArray();
    }

    /**
     * Empty breakdown structure for new weeks.
     */
    private function getEmptyBreakdown(): array
    {
        return [
            ['day' => 'Mon', 'hours' => 0, 'status' => 'pending', 'workMode' => null],
            ['day' => 'Tue', 'hours' => 0, 'status' => 'pending', 'workMode' => null],
            ['day' => 'Wed', 'hours' => 0, 'status' => 'pending', 'workMode' => null],
            ['day' => 'Thu', 'hours' => 0, 'status' => 'pending', 'workMode' => null],
            ['day' => 'Fri', 'hours' => 0, 'status' => 'pending', 'workMode' => null],
            ['day' => 'Sat', 'hours' => 0, 'status' => 'weekend', 'workMode' => null],
            ['day' => 'Sun', 'hours' => 0, 'status' => 'weekend', 'workMode' => null],
        ];
    }
}
