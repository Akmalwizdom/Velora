<?php

namespace App\Http\Controllers;

use App\Services\QrAttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QrAttendanceController extends Controller
{
    public function __construct(
        protected QrAttendanceService $qrService
    ) {}

    /**
     * Display the QR generation page for admins/managers.
     * Optimized for wall-mounted displays.
     */
    public function display(): Response
    {
        return Inertia::render('qr-display', [
            'initialSession' => $this->qrService->generateToken(auth()->user()),
        ]);
    }

    /**
     * Generate a new QR session (API endpoint for silent refresh).
     */
    public function generate(Request $request): JsonResponse
    {
        $sessionData = $this->qrService->generateToken($request->user());

        return response()->json($sessionData);
    }

    /**
     * Validate a QR token and check in instantly.
     * Success result is final — no further user action required.
     */
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        try {
            $attendance = $this->qrService->validateAndCheckIn(
                token: $request->input('token'),
                user: $request->user(),
                deviceType: 'mobile' // QR scans primarily happen from mobile
            );

            return response()->json([
                'success' => true,
                'message' => 'Attendance validated successfully!',
                'attendance' => $attendance,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Emergency revoke of all active QR sessions.
     */
    public function revoke(Request $request): JsonResponse
    {
        $count = $this->qrService->revokeAllActiveSessions($request->user());

        return response()->json([
            'success' => true,
            'message' => "Revoked {$count} active QR sessions.",
        ]);
    }
}
