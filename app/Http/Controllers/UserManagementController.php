<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Display user management page (Admin only).
     */
    public function index(): Response
    {
        $this->authorize('viewAny', User::class);

        $pendingUsers = User::where('status', User::STATUS_PENDING)
            ->with('role')
            ->latest()
            ->get();

        $activeUsers = User::where('status', User::STATUS_ACTIVE)
            ->with('role')
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('admin/users', [
            'pendingUsers' => $pendingUsers,
            'activeUsers' => $activeUsers,
        ]);
    }

    /**
     * Approve a pending user.
     */
    public function approve(User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        if (!$user->isPending()) {
            return back()->with('error', 'User is not pending approval.');
        }

        $user->update(['status' => User::STATUS_ACTIVE]);

        return back()->with('success', "User {$user->name} has been approved.");
    }

    /**
     * Reject/delete a pending user.
     */
    public function reject(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        if (!$user->isPending()) {
            return back()->with('error', 'Only pending users can be rejected.');
        }

        $user->delete();

        return back()->with('success', 'User registration has been rejected.');
    }
}
