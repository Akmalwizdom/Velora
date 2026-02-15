<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Services\AttendanceService;
use Inertia\Inertia;
use Inertia\Response;

class PerformanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService
    ) {}

    /**
     * Display the performance dashboard.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $todayAttendance = $user->todayAttendance;

        // Get attendance state
        $attendanceState = 'Not Checked In';
        $attendanceStatus = 'pending';

        if ($todayAttendance) {
            $attendanceState = $todayAttendance->isActive() ? 'Checked In' : 'Checked Out';
            $attendanceStatus = $todayAttendance->status;
        }

        // Get active hours today
        $activeHours = $todayAttendance?->getDurationInHours() ?? 0;

        return Inertia::render('performance-dashboard', [
            'attendanceState' => $attendanceState,
            'attendanceStatus' => ucfirst(str_replace('_', ' ', $attendanceStatus)),
            'activeHours' => round($activeHours, 1),
            'recentActivity' => $recentActivity,
            'weeklyPattern' => $weeklyPattern,
        ]);
    }

    /**
     * Get recent activity items.
     */
    private function getRecentActivity($user): array
    {
        $activity = [];

        // Get today's attendance
        $today = $user->todayAttendance;

        if ($today) {
            $activity[] = [
                'time' => $today->checked_in_at->format('H:i'),
                'title' => 'Check-in automated',
                'desc' => 'Session started for '.now()->format('l'),
                'status' => 'success',
                'icon' => 'clock',
            ];

            if ($today->checked_out_at) {
                $activity[] = [
                    'time' => $today->checked_out_at->format('H:i'),
                    'title' => 'Check-out detected',
                    'desc' => 'Shift transition detected.',
                    'status' => 'success',
                    'icon' => 'zap',
                ];
            }
        }

        // Get recent corrections
        $corrections = $user->attendances()
            ->has('corrections')
            ->with('corrections')
            ->limit(2)
            ->get()
            ->flatMap(fn ($a) => $a->corrections)
            ->map(fn ($c) => [
                'time' => $c->created_at->format('H:i'),
                'title' => 'Manual Pulse Adjustment',
                'desc' => 'Correction requested: '.$c->reason,
                'status' => 'alert',
                'icon' => 'message',
            ]);

        return array_merge($activity, $corrections->toArray());
    }
}
