<?php

namespace App\Services;

use App\Models\AttendanceCorrection;
use App\Models\User;
use Illuminate\Support\Collection;

class CorrectionService
{
    public function __construct(
        protected AttendanceAuditService $auditService
    ) {}
    /**
     * Get pending corrections for review, scoped by user role and team.
     */
    public function getPendingCorrections(User $user): Collection
    {
        $query = AttendanceCorrection::pending()
            ->with(['attendance.user', 'requester']);

        if ($user->isAdmin()) {
            // Admin sees everything
            return $query->latest()->get();
        }

        if ($user->isManager()) {
            // Manager sees corrections from their teams
            return $query->whereHas('requester.teams', function ($q) use ($user) {
                $q->whereIn('teams.id', $user->teams->pluck('id'));
            })->latest()->get();
        }

        // Employee sees only their own
        return $query->where('requested_by', $user->id)->latest()->get();
    }

    /**
     * Get a specific correction with all related data.
     */
    public function getCorrection(int $id): ?array
    {
        $correction = AttendanceCorrection::with(['attendance.user', 'requester', 'reviewer'])
            ->find($id);

        if (! $correction) {
            return null;
        }

        return [
            'id' => $correction->id,
            'requestCode' => 'REQUEST_'.$correction->id,
            'originalTime' => $correction->original_time->format('H:i:s'),
            'proposedTime' => $correction->proposed_time->format('H:i:s'),
            'reason' => $correction->reason,
            'status' => $correction->status,
            'requester' => [
                'id' => $correction->requester->id,
                'name' => $correction->requester->name,
            ],
            'reviewer' => $correction->reviewer ? [
                'id' => $correction->reviewer->id,
                'name' => $correction->reviewer->name,
            ] : null,
            'submittedAt' => $correction->created_at->format('Y-m-d H:i'),
            'reviewedAt' => $correction->reviewed_at?->format('Y-m-d H:i'),
        ];
    }

    /**
     * Get the latest pending correction for display, scoped by user.
     */
    public function getCurrentCorrection(User $user): ?array
    {
        $query = AttendanceCorrection::pending()
            ->with(['attendance.user', 'requester'])
            ->latest();

        if (!$user->isAdmin()) {
            if ($user->isManager()) {
                $query->whereHas('requester.teams', function ($q) use ($user) {
                    $q->whereIn('teams.id', $user->teams->pluck('id'));
                });
            } else {
                $query->where('requested_by', $user->id);
            }
        }

        $correction = $query->first();

        if (! $correction) {
            return null;
        }

        return $this->getCorrection($correction->id);
    }

    /**
     * Get audit log for a correction.
     */
    public function getAuditLog(?int $correctionId = null): array
    {
        if (! $correctionId) {
            $correction = AttendanceCorrection::latest()->first();
            $correctionId = $correction?->id;
        }

        if (! $correctionId) {
            return [];
        }

        $correction = AttendanceCorrection::with('attendance')->find($correctionId);

        if (! $correction) {
            return [];
        }

        $log = [];

        // Original capture
        $log[] = [
            'time' => $correction->original_time->format('H:i'),
            'event' => 'System capture (Auto)',
            'status' => 'mismatch',
        ];

        // Correction requested
        $log[] = [
            'time' => $correction->created_at->format('H:i'),
            'event' => 'Correction requested',
            'status' => 'pending',
        ];

        // Review status
        if ($correction->reviewed_at) {
            $log[] = [
                'time' => $correction->reviewed_at->format('H:i'),
                'event' => $correction->status === 'approved'
                    ? 'Correction approved'
                    : 'Correction rejected',
                'status' => 'success',
            ];
        }

        return $log;
    }

    /**
     * Approve a correction.
     * NON-NEGOTIABLE: Creates transparent audit trail with original/new values.
     */
    public function approve(AttendanceCorrection $correction, User $reviewer): void
    {
        $correction->approve($reviewer);

        // Apply the correction to the attendance record
        $attendance = $correction->attendance;
        
        if ($correction->type === 'check_out') {
            $attendance->update([
                'checked_out_at' => $correction->proposed_time,
            ]);
        } else {
            $attendance->update([
                'checked_in_at' => $correction->proposed_time,
                'status' => 'on_time', // Correction implies it was valid
            ]);
        }

        // Generate transparent audit trail (NON-NEGOTIABLE requirement)
        $this->auditService->logCorrectionApproval($correction, $attendance, $reviewer);
    }

    /**
     * Reject a correction.
     * Creates audit trail for traceability.
     */
    public function reject(AttendanceCorrection $correction, User $reviewer): void
    {
        $correction->reject($reviewer);

        // Generate audit trail for rejection
        $this->auditService->logCorrectionRejection(
            $correction,
            $correction->attendance,
            $reviewer
        );
    }

    /**
     * Request a correction for an attendance record.
     */
    public function requestCorrection(User $user, int $attendanceId, string $type, string $proposedTime, string $reason): AttendanceCorrection
    {
        $attendance = \App\Models\Attendance::findOrFail($attendanceId);
        
        // Ensure user owns the attendance or is a manager
        if (!$user->isAdmin() && $attendance->user_id !== $user->id) {
            throw new \RuntimeException('Unauthorized to request correction for this record.');
        }

        // Check for existing pending correction
        $existing = AttendanceCorrection::where('attendance_id', $attendanceId)
            ->where('status', 'pending')
            ->first();
            
        if ($existing) {
            throw new \RuntimeException('A correction request is already pending for this record.');
        }

        $proposedDateTime = \Carbon\Carbon::parse($proposedTime);
        $originalTime = $type === 'check_out' ? $attendance->checked_out_at : $attendance->checked_in_at;

        return AttendanceCorrection::create([
            'attendance_id' => $attendanceId,
            'type' => $type,
            'requested_by' => $user->id,
            'original_time' => $originalTime ?? $attendance->checked_in_at, // Fallback to check-in if check-out is null
            'proposed_time' => $proposedDateTime,
            'reason' => $reason,
            'status' => 'pending',
        ]);
    }
    /**
     * Get all corrections for the administrative list view.
     */
    public function getAllCorrectionsForList(User $user): Collection
    {
        $query = AttendanceCorrection::with(['attendance.user', 'requester', 'reviewer'])
            ->latest();

        if ($user->isManager()) {
            $query->whereHas('requester.teams', function ($q) use ($user) {
                $q->whereIn('teams.id', $user->teams->pluck('id'));
            });
        }

        return $query->get()->map(fn ($c) => [
            'id' => $c->id,
            'requestCode' => 'REQ-' . str_pad($c->id, 5, '0', STR_PAD_LEFT),
            'originalTime' => $c->original_time?->format('H:i') ?? '--:--',
            'proposedTime' => $c->proposed_time->format('H:i'),
            'reason' => $c->reason,
            'status' => $c->status,
            'requester' => [
                'id' => $c->requester->id,
                'name' => $c->requester->name,
                'avatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=' . urlencode($c->requester->name),
            ],
            'reviewer' => $c->reviewer ? [
                'id' => $c->reviewer->id,
                'name' => $c->reviewer->name,
            ] : null,
            'submittedAt' => $c->created_at->format('d M, H:i'),
            'reviewedAt' => $c->reviewed_at?->format('d M, H:i'),
            'auditLog' => $this->getAuditLog($c->id),
        ]);
    }

    /**
     * Get corrections for a specific user's history.
     */
    public function getUserCorrections(User $user): array
    {
        return AttendanceCorrection::where('requested_by', $user->id)
            ->with('reviewer')
            ->latest()
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'type' => $c->type,
                'originalTime' => $c->original_time?->format('H:i'),
                'proposedTime' => $c->proposed_time->format('H:i'),
                'reason' => $c->reason,
                'status' => $c->status,
                'submittedAt' => $c->created_at->format('d M Y, H:i'),
                'reviewedAt' => $c->reviewed_at?->format('d M Y, H:i'),
                'reviewerName' => $c->reviewer?->name,
            ])->toArray();
    }
}
