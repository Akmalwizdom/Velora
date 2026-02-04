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
            'activeTeamMembers' => $this->attendanceService->getActiveTeamMembers(),
            'performanceData' => $this->attendanceService->getPerformanceData($user),
        ]);
    }

    /**
     * Check in the current user.
     */
    public function checkIn(Request $request): RedirectResponse
    {
        $request->validate([
            'work_mode' => 'nullable|in:office,remote',
        ]);

        try {
            $this->attendanceService->checkIn(
                $request->user(),
                $request->input('work_mode', 'office')
            );

            return back()->with('success', 'Successfully checked in!');
        } catch (\RuntimeException $e) {
            return back()->withErrors(['check_in' => $e->getMessage()]);
        }
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
