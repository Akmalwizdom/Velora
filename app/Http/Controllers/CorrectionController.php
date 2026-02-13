<?php

namespace App\Http\Controllers;

use App\Models\AttendanceCorrection;
use App\Services\CorrectionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CorrectionController extends Controller
{
    public function __construct(
        protected CorrectionService $correctionService
    ) {}

    /**
     * Display the log management / corrections page.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $correction = $this->correctionService->getCurrentCorrection($user);
        $auditLog = $correction
            ? $this->correctionService->getAuditLog($correction['id'])
            : [];

        return Inertia::render('log-management', [
            'correction' => $correction,
            'auditLog' => $auditLog,
            'hasCorrection' => $correction !== null,
        ]);
    }

    /**
     * Approve a correction request.
     */
    public function approve(AttendanceCorrection $correction): RedirectResponse
    {
        $this->authorize('approve', $correction);

        $this->correctionService->approve($correction, auth()->user());

        return back()->with('success', 'Correction approved successfully.');
    }

    /**
     * Reject a correction request.
     */
    public function reject(AttendanceCorrection $correction): RedirectResponse
    {
        $this->authorize('approve', $correction);

        $this->correctionService->reject($correction, auth()->user());

        return back()->with('success', 'Correction rejected.');
    }

    /**
     * Store a new correction request.
     */
    public function store(\Illuminate\Http\Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'attendance_id' => 'required|exists:attendances,id',
            'type' => 'required|in:check_in,check_out',
            'proposed_time' => 'required|date_format:H:i',
            'reason' => 'required|string|max:500',
        ]);

        try {
            // Combine today's date with proposed time if it's for today,
            // or use the attendance record's date if it's for a previous day.
            $attendance = \App\Models\Attendance::findOrFail($request->attendance_id);
            $date = $attendance->checked_in_at->format('Y-m-d');
            $proposedDateTime = $date . ' ' . $request->proposed_time;

            $this->correctionService->requestCorrection(
                auth()->user(),
                $request->attendance_id,
                $request->type,
                $proposedDateTime,
                $request->reason
            );

            return back()->with('success', 'Correction request submitted successfully.');
        } catch (\RuntimeException $e) {
            return back()->withErrors(['correction' => $e->getMessage()]);
        }
    }
}
