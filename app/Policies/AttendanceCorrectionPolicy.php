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
     */
    public function approve(User $user, AttendanceCorrection $correction): bool
    {
        // Only HR, Manager, Admin can approve corrections
        // Users cannot approve their own corrections
        return $user->canApproveCorrections() && $user->id !== $correction->requested_by;
    }
}
