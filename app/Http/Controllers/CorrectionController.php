<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCorrectionRequest;
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
     * Display the administrative corrections list.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $corrections = $this->correctionService->getAllCorrectionsForList($user);
        $totalPending = collect($corrections)->where('status', 'pending')->count();

        return Inertia::render('log-management', [
            'corrections' => $corrections,
            'totalPending' => $totalPending,
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
    public function store(StoreCorrectionRequest $request): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // Combine today's date with proposed time if it's for today,
            // or use the attendance record's date if it's for a previous day.
            $attendance = \App\Models\Attendance::findOrFail($validated['attendance_id']);
            $date = $attendance->checked_in_at->format('Y-m-d');
            $proposedDateTime = $date . ' ' . $validated['proposed_time'];

            $this->correctionService->requestCorrection(
                auth()->user(),
                $validated['attendance_id'],
                $validated['type'],
                $proposedDateTime,
                $validated['reason']
            );

            return back()->with('success', 'Correction request submitted successfully.');
        } catch (\RuntimeException $e) {
            return back()->withErrors(['correction' => $e->getMessage()]);
        }
    }
}
