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
}
