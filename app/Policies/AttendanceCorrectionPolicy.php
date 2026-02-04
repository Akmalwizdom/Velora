<?php

namespace App\Policies;

use App\Models\AttendanceCorrection;
use App\Models\User;

class AttendanceCorrectionPolicy
{
    /**
     * Determine whether the user can view any corrections.
     */
    public function viewAny(User $user): bool
    {
        return $user->canViewTeamAnalytics();
    }

    /**
     * Determine whether the user can view the correction.
     */
    public function view(User $user, AttendanceCorrection $correction): bool
    {
        // Users can view their own corrections or if they can view team analytics
        return $user->id === $correction->requested_by || $user->canViewTeamAnalytics();
    }

    /**
     * Determine whether the user can approve/reject the correction.
     * 
     * Security guardrails:
     * - Only Managers can approve (Admin excluded - separation of duties)
     * - Self-approval is prevented
     * - Cross-team isolation: Manager must share a team with the requester
     */
    public function approve(User $user, AttendanceCorrection $correction): bool
    {
        if (!$user->canApproveCorrections() || $user->id === $correction->requested_by) {
            return false;
        }

        // Manager must share at least one team with the requester
        return $user->teams()
            ->whereHas('members', function ($query) use ($correction) {
                $query->where('users.id', $correction->requested_by);
            })
            ->exists();
    }
}
