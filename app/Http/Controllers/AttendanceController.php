<?php

namespace App\Http\Controllers;

use App\Models\OrganizationSetting;
use App\Services\AttendanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService
    ) {}

    /**
     * Display the attendance hub.
     */
    public function hub(): Response
    {
        $user = auth()->user();

        // The instruction implies assigning attendanceMetrics to a variable first
        $metrics = $this->attendanceService->getAttendanceMetrics($user);

        return Inertia::render('attendance-hub', [
            'sessionActive' => $this->attendanceService->isSessionActive($user),
            'todayStatus' => $this->attendanceService->getTodayStatus($user),
            'weeklyProgress' => $this->attendanceService->getWeeklyProgress($user),
            'activeTeamMembers' => $this->attendanceService->getActiveTeamMembers($user),
            'performanceData' => $this->attendanceService->getPerformanceData($user),
            'attendanceMetrics' => $metrics,
            'qrMode' => OrganizationSetting::getQrMode(),
            'qrTtl' => OrganizationSetting::getQrTtlSeconds(),
        ]);
    }

    /**
     * Check in the current user.
     * Captures device type for audit purposes.
     * Location signal is optional and organization-configurable.
     */
    public function checkIn(Request $request): RedirectResponse
    {
        $request->validate([
            // Location signals removed for QR-centric simplification
        ]);

        // Device detection (lightweight, for audit support only)
        $deviceType = $this->detectDeviceType($request);

        try {
            $this->attendanceService->checkIn(
                $request->user(),
                null, // stationName
                $deviceType
            );

            return back()->with('success', 'Successfully checked in!');
        } catch (\RuntimeException $e) {
            return back()->withErrors(['check_in' => $e->getMessage()]);
        }
    }

    /**
     * Detect device type from user agent.
     * Lightweight signal - not exposed prominently in UI.
     */
    private function detectDeviceType(Request $request): string
    {
        $userAgent = $request->userAgent() ?? '';
        if (preg_match('/Mobile|Android|iPhone|iPad/i', $userAgent)) {
            return 'mobile';
        }
        return 'web';
    }

    /**
     * Check out the current user.
     */
    public function checkOut(Request $request): RedirectResponse
    {
        $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        try {
            $this->attendanceService->checkOut(
                $request->user(),
                $request->input('note')
            );

            return back()->with('success', 'Successfully checked out!');
        } catch (\RuntimeException $e) {
            return back()->withErrors(['check_out' => $e->getMessage()]);
        }
    }
}
