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
        $attendance->update([
            'checked_in_at' => $correction->proposed_time,
            'status' => 'on_time', // Correction implies it was valid
        ]);

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
}
