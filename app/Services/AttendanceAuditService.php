<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceAuditLog;
use App\Models\AttendanceCorrection;
use App\Models\User;

/**
 * Centralized audit trail service for attendance modifications.
 *
 * Every attendance modification flows through this service to ensure
 * transparent, tamper-resistant records. Trust requires traceability.
 */
class AttendanceAuditService
{
    /**
     * Log attendance creation (check-in).
     */
    public function logCreation(Attendance $attendance, ?User $actor, string $deviceType = 'web'): AttendanceAuditLog
    {
        return AttendanceAuditLog::create([
            'attendance_id' => $attendance->id,
            'actor_id' => $actor?->id,
            'action' => 'created',
            'previous_values' => null,
            'new_values' => $this->sanitizeValues($attendance->toArray()),
            'source' => 'user',
            'device_type' => $deviceType,
            'occurred_at' => now(),
        ]);
    }

    /**
     * Log attendance update (check-out, note addition, etc.).
     */
    public function logUpdate(
        Attendance $attendance,
        array $previousValues,
        ?User $actor,
        string $source = 'user',
        ?string $deviceType = null
    ): AttendanceAuditLog {
        return AttendanceAuditLog::create([
            'attendance_id' => $attendance->id,
            'actor_id' => $actor?->id,
            'action' => 'updated',
            'previous_values' => $this->sanitizeValues($previousValues),
            'new_values' => $this->sanitizeValues($attendance->fresh()->toArray()),
            'source' => $source,
            'device_type' => $deviceType,
            'occurred_at' => now(),
        ]);
    }

    /**
     * Log correction approval with complete audit trail.
     *
     * NON-NEGOTIABLE: Every approval must show original value,
     * updated value, requester, approver, and timestamps.
     */
    public function logCorrectionApproval(
        AttendanceCorrection $correction,
        Attendance $attendance,
        User $reviewer
    ): AttendanceAuditLog {
        return AttendanceAuditLog::create([
            'attendance_id' => $attendance->id,
            'actor_id' => $reviewer->id,
            'action' => 'correction_approved',
            'previous_values' => [
                'checked_in_at' => $correction->original_time->toIso8601String(),
                'status' => $attendance->getOriginal('status'),
            ],
            'new_values' => [
                'checked_in_at' => $correction->proposed_time->toIso8601String(),
                'status' => 'on_time',
                'correction_id' => $correction->id,
                'requester_id' => $correction->requested_by,
                'reason' => $correction->reason,
            ],
            'source' => 'correction',
            'occurred_at' => now(),
        ]);
    }

    /**
     * Log correction rejection.
     */
    public function logCorrectionRejection(
        AttendanceCorrection $correction,
        Attendance $attendance,
        User $reviewer
    ): AttendanceAuditLog {
        return AttendanceAuditLog::create([
            'attendance_id' => $attendance->id,
            'actor_id' => $reviewer->id,
            'action' => 'correction_rejected',
            'previous_values' => null,
            'new_values' => [
                'correction_id' => $correction->id,
                'requester_id' => $correction->requested_by,
                'reason' => $correction->reason,
                'rejection_reason' => 'Rejected by reviewer',
            ],
            'source' => 'correction',
            'occurred_at' => now(),
        ]);
    }

    /**
     * Get full audit trail for an attendance record.
     */
    public function getAuditTrail(Attendance $attendance): array
    {
        return AttendanceAuditLog::forAttendance($attendance->id)
            ->orderBy('occurred_at', 'asc')
            ->with('actor')
            ->get()
            ->map(fn (AttendanceAuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'actor' => $log->actor?->name ?? 'System',
                'previousValues' => $log->previous_values,
                'newValues' => $log->new_values,
                'source' => $log->source,
                'deviceType' => $log->device_type,
                'occurredAt' => $log->occurred_at->toIso8601String(),
            ])
            ->toArray();
    }

    /**
     * Sanitize values for audit log storage.
     * Removes sensitive or unnecessary fields.
     */
    private function sanitizeValues(array $values): array
    {
        // Remove Laravel timestamps and relationships
        unset($values['created_at'], $values['updated_at']);

        return $values;
    }
}
