<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view the list of users.
     * Only admins can access the user management page.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view a specific user.
     */
    public function view(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the user (approve/change status).
     * Admins can approve pending users.
     */
    public function update(User $user, User $model): bool
    {
        // Only admins can update users
        // Cannot update yourself
        return $user->isAdmin() && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can delete the user (reject registration).
     * Admins can reject pending users.
     */
    public function delete(User $user, User $model): bool
    {
        // Only admins can delete users
        // Cannot delete yourself
        // Can only delete pending users
        return $user->isAdmin() && $user->id !== $model->id && $model->isPending();
    }
}
