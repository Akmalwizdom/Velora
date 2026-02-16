<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\OrganizationSetting;
use App\Models\QrSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Presence validation service using dynamic QR tokens.
 *
 * Security properties:
 * - HMAC-SHA256 signed tokens (unforgeable without app key)
 * - SHA-256 hashed storage (raw token never persisted)
 * - Unique nonce per session (replay prevention)
 * - Short TTL with server-authoritative expiration
 * - Single-use consumption with DB transaction
 *
 * Architecture is validation-method agnostic — QR is one input
 * to the same AttendanceService that handles all check-ins.
 */
class QrAttendanceService
{
    public function __construct(
        protected AttendanceService $attendanceService
    ) {}

    /**
     * Generate a new QR session with a signed token.
     *
     * @return array{token: string, expires_at: string, session_id: int}
     */
    public function generateToken(User $generator, string $type = QrSession::TYPE_CHECK_IN): array
    {
        // Revoke any active sessions of the same type from this generator
        QrSession::active()
            ->where('generated_by', $generator->id)
            ->where('type', $type)
            ->update(['status' => QrSession::STATUS_REVOKED]);

        $nonce = bin2hex(random_bytes(16));
        $ttl = OrganizationSetting::getQrTtlSeconds();
        $expiresAt = now()->addSeconds($ttl);

        // Build payload
        $payload = [
            'nonce' => $nonce,
            'generated_by' => $generator->id,
            'expires_at' => $expiresAt->timestamp,
            'version' => 1, // For future payload format changes
        ];

        $payloadJson = json_encode($payload);
        $signature = hash_hmac('sha256', $payloadJson, config('app.key'));
        $token = base64_encode($payloadJson) . '.' . $signature;

        // Store session with hashed token (never raw)
        $session = QrSession::create([
            'token_hash' => hash('sha256', $token),
            'nonce' => $nonce,
            'type' => $type,
            'generated_by' => $generator->id,
            'expires_at' => $expiresAt,
            'status' => QrSession::STATUS_ACTIVE,
        ]);

        return [
            'token' => $token,
            'expires_at' => $expiresAt->toIso8601String(),
            'session_id' => $session->id,
            'ttl' => $ttl,
        ];
    }

    /**
     * Validate a QR token and process either check-in or check-out.
     * Instant — no post-validation steps required.
     *
     * @throws \RuntimeException on validation failure
     */
    public function validateAndProcess(
        string $token,
        User $user,
        string $deviceType = 'mobile'
    ): array {
        return DB::transaction(function () use ($token, $user, $deviceType) {
            // 1. Verify HMAC signature
            $parts = explode('.', $token, 2);
            if (count($parts) !== 2) {
                Log::warning('QR validation: malformed token', ['user_id' => $user->id]);
                throw new \RuntimeException('Invalid QR code. Please scan a valid code.');
            }

            [$encodedPayload, $signature] = $parts;
            $payloadJson = base64_decode($encodedPayload, true);

            if ($payloadJson === false) {
                Log::warning('QR validation: invalid encoding', ['user_id' => $user->id]);
                throw new \RuntimeException('Invalid QR code. Please scan a valid code.');
            }

            $expectedSignature = hash_hmac('sha256', $payloadJson, config('app.key'));

            if (!hash_equals($expectedSignature, $signature)) {
                Log::warning('QR validation: HMAC mismatch', ['user_id' => $user->id]);
                throw new \RuntimeException('Invalid QR code. Please scan a valid code.');
            }

            // 2. Extract payload and validate structure
            $payload = json_decode($payloadJson, true);

            if (!$payload || !isset($payload['nonce'], $payload['expires_at'])) {
                Log::warning('QR validation: invalid payload structure', ['user_id' => $user->id]);
                throw new \RuntimeException('Invalid QR code. Please scan a valid code.');
            }

            // 3. Look up session by nonce (with row lock for concurrency)
            $session = QrSession::forNonce($payload['nonce'])->lockForUpdate()->first();

            if (!$session) {
                Log::warning('QR validation: unknown nonce', ['user_id' => $user->id]);
                throw new \RuntimeException('Invalid QR code. Please scan a valid code.');
            }

            // 4. Check expiration (server-authoritative)
            if ($session->isExpired()) {
                $session->update(['status' => QrSession::STATUS_EXPIRED]);
                throw new \RuntimeException('This QR code has expired. Please scan the latest code.');
            }

            // 5. Check if already consumed (replay prevention)
            if ($session->isConsumed()) {
                Log::warning('QR validation: replay attempt', [
                    'user_id' => $user->id,
                    'session_id' => $session->id,
                ]);
                throw new \RuntimeException('This QR code has already been used.');
            }

            // 6. Check if revoked
            if ($session->status === QrSession::STATUS_REVOKED) {
                throw new \RuntimeException('This QR code is no longer valid. Please scan the latest code.');
            }

            // 7. Sessional Logic: Check In vs Check Out based on QR Type
            $activeAttendance = Attendance::where('user_id', $user->id)->active()->latest()->first();
            $sessionType = $session->type;
            $type = 'check_in';

            if ($sessionType === QrSession::TYPE_CHECK_OUT) {
                if (!$activeAttendance || !$activeAttendance->isActive()) {
                    throw new \RuntimeException('No active session found. Please check in first before scanning for check-out.');
                }

                // Already in -> Check them OUT
                $attendance = $this->attendanceService->forceCheckOut(
                    $activeAttendance, 
                    now(), 
                    'QR Station Departure', 
                    'user'
                );
                $type = 'check_out';
            } else {
                // TYPE_CHECK_IN logic
                if ($activeAttendance && $activeAttendance->isActive()) {
                    // Prevent double check-in during check-in session
                    $time = $activeAttendance->checked_in_at->format('H:i');
                    throw new \RuntimeException("You are already checked in at {$time}. Ready for work!");
                }

                // Not in -> Check them IN
                $attendance = $this->attendanceService->checkIn(
                    user: $user,
                    stationName: null, // Station inherited from QR context later
                    deviceType: $deviceType,
                    validationMethod: 'qr'
                );
            }

            // 8. Mark session as consumed
            $session->consume($user, $attendance);

            return [
                'attendance' => $attendance,
                'type' => $type
            ];
        });
    }

    /**
     * Get the current active QR session for a generator.
     */
    public function getCurrentSession(User $generator): ?QrSession
    {
        return QrSession::active()
            ->where('generated_by', $generator->id)
            ->latest()
            ->first();
    }

    /**
     * Revoke all active QR sessions (emergency control).
     */
    public function revokeAllActiveSessions(?User $generator = null): int
    {
        $query = QrSession::active();

        if ($generator) {
            $query->where('generated_by', $generator->id);
        }

        return $query->update(['status' => QrSession::STATUS_REVOKED]);
    }

    /**
     * Purge expired unclaimed sessions.
     * Called via scheduled command for cleanup.
     */
    public function purgeExpiredSessions(): int
    {
        return QrSession::expiredUnclaimed()
            ->update(['status' => QrSession::STATUS_EXPIRED]);
    }
}
