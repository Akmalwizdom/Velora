<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\OrganizationSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    public function __construct(
        protected AttendanceAuditService $auditService
    ) {}

    /**
     * Check in a user with optional tracking signals.
     * Timestamps are server-authoritative - never trust client time.
     */
    public function checkIn(
        User $user,
        ?string $cluster = null,
        string $deviceType = 'web',
        ?array $locationSignal = null
    ): Attendance {
        $workMode = 'office'; // Default to office for simplicity
        // Check if already checked in today
        $existing = $user->todayAttendance;

        if ($existing?->isActive()) {
            throw new \RuntimeException('Already checked in. Please check out first.');
        }


        $schedule = $user->currentWorkSchedule();
        $now = now();

        if ($schedule) {
            $status = $schedule->isLate($now) ? 'late' : 'on_time';
        } else {
            // Fallback to legacy default if no schedule found (failsafe)
            $scheduledStart = Carbon::today()->setHour(8);
            $status = $now->gt($scheduledStart->addMinutes(15)) ? 'late' : 'on_time';
        }

        // Prepare location signal (only if organization allows)
        $locationData = $this->prepareLocationSignal($locationSignal);

        // Prepare device type (only if organization allows)
        $capturedDeviceType = OrganizationSetting::isDeviceTypeCaptureEnabled()
            ? $deviceType
            : null;

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'checked_in_at' => $now, // Server-authoritative
            'work_mode' => $workMode,
            'cluster' => $cluster ?? $this->generateCluster(),
            'status' => $status,
            'device_type' => $capturedDeviceType,
            'location_lat' => $locationData['lat'],
            'location_lng' => $locationData['lng'],
            'location_accuracy' => $locationData['accuracy'],
        ]);

        // Generate audit trail
        $this->auditService->logCreation($attendance, $user, $deviceType);

        return $attendance;
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

        $previousValues = $attendance->toArray();

        $attendance->update([
            'checked_out_at' => now(), // Server-authoritative
            'note' => $note,
        ]);

        // Generate audit trail for check-out
        $this->auditService->logUpdate(
            $attendance,
            $previousValues,
            $user,
            'user'
        );

        return $attendance->fresh();
    }

    /**
     * Prepare location signal respecting organization settings.
     * Returns null values if location capture is disabled.
     */
    private function prepareLocationSignal(?array $locationSignal): array
    {
        // Check if organization allows location capture
        if (!OrganizationSetting::isLocationCaptureEnabled()) {
            return ['lat' => null, 'lng' => null, 'accuracy' => null];
        }

        if (!$locationSignal) {
            return ['lat' => null, 'lng' => null, 'accuracy' => null];
        }

        return [
            'lat' => $locationSignal['lat'] ?? null,
            'lng' => $locationSignal['lng'] ?? null,
            'accuracy' => $locationSignal['accuracy'] ?? 'unknown',
        ];
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
        $schedule = $user->currentWorkSchedule();

        return [
            'status' => $attendance?->status ?? 'not_checked_in',
            'checkedInAt' => $attendance?->checked_in_at?->toIso8601String(),
            'schedule' => $schedule 
                ? "{$schedule->formatted_start_time} - {$schedule->formatted_end_time}"
                : '08:00 - 16:30',
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
     * Get active team members, scoped by user's teams.
     */
    public function getActiveTeamMembers(User $user): array
    {
        $query = User::whereHas('attendances', function ($query) {
            $query->today()->active();
        })->with('role');

        // Scope to user's teams to prevent cross-team data leaks
        $teamIds = $user->teams->pluck('id');
        $query->whereHas('teams', function ($q) use ($teamIds) {
            $q->whereIn('teams.id', $teamIds);
        });

        $activeUsers = $query->limit(5)->get();

        $members = $activeUsers->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => 'https://i.pravatar.cc/150?u='.$user->id,
        ])->toArray();

        $totalActive = Attendance::today()
            ->active()
            ->whereHas('user.teams', function ($q) use ($teamIds) {
                $q->whereIn('teams.id', $teamIds);
            })
            ->count();

        $remainingCount = max(0, $totalActive - count($members));

        return [
            'members' => $members,
            'remainingCount' => $remainingCount,
            'totalActive' => $totalActive,
        ];
    }

    /**
     * Get attendance metrics for the current month.
     */
    public function getAttendanceMetrics(User $user): array
    {
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();
        
        // Count unique days with attendance this month
        $daysPresent = Attendance::where('user_id', $user->id)
            ->whereBetween('checked_in_at', [$startOfMonth, $endOfMonth])
            ->select(DB::raw('DATE(checked_in_at) as date'))
            ->groupBy('date')
            ->get()
            ->count();

        // Calculate total working days so far (simplified: Mon-Fri)
        $limit = now()->isBefore($endOfMonth) ? now()->endOfDay() : $endOfMonth;
        $workingDays = $startOfMonth->diffInDaysFiltered(function ($date) {
            return $date->isWeekday();
        }, $limit) + ($startOfMonth->isWeekday() ? 1 : 0);

        $totalAttendances = Attendance::where('user_id', $user->id)
            ->whereBetween('checked_in_at', [$startOfMonth, $endOfMonth])
            ->count();

        $onTimeAttendances = Attendance::where('user_id', $user->id)
            ->whereBetween('checked_in_at', [$startOfMonth, $endOfMonth])
            ->where('status', 'on_time')
            ->count();

        $lateCount = Attendance::where('user_id', $user->id)
            ->whereBetween('checked_in_at', [$startOfMonth, $endOfMonth])
            ->where('status', 'late')
            ->count();

        $punctualityRate = $totalAttendances > 0 
            ? round(($onTimeAttendances / $totalAttendances) * 100) 
            : 100;

        return [
            'presence' => [
                'current' => $daysPresent,
                'target' => $workingDays,
                'percentage' => $workingDays > 0 ? round(($daysPresent / $workingDays) * 100) : 0,
            ],
            'punctuality' => [
                'rate' => $punctualityRate,
            ],
            'lateness' => [
                'count' => $lateCount,
            ]
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
