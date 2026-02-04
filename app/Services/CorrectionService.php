<?php

namespace App\Services;

use App\Models\AttendanceCorrection;
use App\Models\User;
use Illuminate\Support\Collection;

class CorrectionService
{
    /**
     * Get pending corrections for review.
     */
    public function getPendingCorrections(): Collection
    {
        return AttendanceCorrection::pending()
            ->with(['attendance.user', 'requester'])
            ->latest()
            ->get();
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
     * Get the latest pending correction for display.
     */
    public function getCurrentCorrection(): ?array
    {
        $correction = AttendanceCorrection::pending()
            ->with(['attendance.user', 'requester'])
            ->latest()
            ->first();

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
    }

    /**
     * Reject a correction.
     */
    public function reject(AttendanceCorrection $correction, User $reviewer): void
    {
        $correction->reject($reviewer);
    }
}
