<?php

namespace App\Http\Controllers;

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

        return Inertia::render('attendance-hub', [
            'sessionActive' => $this->attendanceService->isSessionActive($user),
            'todayStatus' => $this->attendanceService->getTodayStatus($user),
            'weeklyProgress' => $this->attendanceService->getWeeklyProgress($user),
            'activeTeamMembers' => $this->attendanceService->getActiveTeamMembers($user),
            'performanceData' => $this->attendanceService->getPerformanceData($user),
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
            'location_lat' => 'nullable|numeric|between:-90,90',
            'location_lng' => 'nullable|numeric|between:-180,180',
            'location_accuracy' => 'nullable|string|max:20',
        ]);

        // Device detection (lightweight, for audit support only)
        $deviceType = $this->detectDeviceType($request);

        // Optional location signal (check-in moment ONLY, respects org settings)
        $locationSignal = null;
        if ($request->has('location_lat') && $request->has('location_lng')) {
            $locationSignal = [
                'lat' => $request->input('location_lat'),
                'lng' => $request->input('location_lng'),
                'accuracy' => $request->input('location_accuracy', 'unknown'),
            ];
        }

        try {
            $this->attendanceService->checkIn(
                $request->user(),
                null, // cluster
                $deviceType,
                $locationSignal
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
