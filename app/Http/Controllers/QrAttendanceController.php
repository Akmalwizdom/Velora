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
    public function display(Request $request): Response
    {
        $type = $request->query('type', $this->inferCurrentType());
        
        return Inertia::render('qr-display', [
            'initialSession' => $this->qrService->generateToken(auth()->user(), $type),
        ]);
    }

    /**
     * Generate a new QR session (API endpoint for silent refresh).
     */
    public function generate(Request $request): JsonResponse
    {
        $type = $request->query('type', $this->inferCurrentType());
        $sessionData = $this->qrService->generateToken($request->user(), $type);

        return response()->json($sessionData);
    }

    /**
     * Infer the most likely session type based on current time.
     */
    protected function inferCurrentType(): string
    {
        $hour = now()->hour;
        // Simple heuristic: before 1 PM is check-in, after is check-out
        return $hour < 13 ? \App\Models\QrSession::TYPE_CHECK_IN : \App\Models\QrSession::TYPE_CHECK_OUT;
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
            $result = $this->qrService->validateAndProcess(
                token: $request->input('token'),
                user: $request->user(),
                deviceType: 'mobile'
            );

            $message = $result['type'] === 'check_in' 
                ? 'Welcome! Attendance validated successfully.' 
                : 'Goodbye! Check-out validated successfully.';

            return response()->json([
                'success' => true,
                'message' => $message,
                'type' => $result['type'],
                'attendance' => $result['attendance'],
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
