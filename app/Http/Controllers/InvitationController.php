<?php

namespace App\Http\Controllers;

use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    /**
     * Display invitation management page (Admin only).
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Invitation::class);

        $invitations = Invitation::with(['role', 'inviter'])
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/invitations', [
            'invitations' => $invitations,
            'roles' => Role::all(),
            'teams' => Team::all(),
        ]);
    }

    /**
     * Send a new invitation (Admin only).
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Invitation::class);

        $validated = $request->validate([
            'email' => ['required', 'email', 'unique:users,email', 'unique:invitations,email'],
            'role_id' => ['required', 'exists:roles,id'],
            'team_ids' => ['nullable', 'array'],
            'team_ids.*' => ['exists:teams,id'],
        ]);

        $invitation = Invitation::createFor(
            email: $validated['email'],
            roleId: $validated['role_id'],
            inviter: $request->user(),
            teamIds: $validated['team_ids'] ?? null
        );

        // Send invitation email
        Mail::to($validated['email'])->send(new InvitationMail($invitation));

        return back()->with('success', 'Invitation sent successfully.');
    }

    /**
     * Show the invitation acceptance form.
     */
    public function showAccept(string $token): Response|RedirectResponse
    {
        $invitation = Invitation::findByToken($token);

        if (!$invitation) {
            return redirect()->route('login')
                ->with('error', 'Invalid or expired invitation link.');
        }

        return Inertia::render('auth/accept-invitation', [
            'invitation' => [
                'email' => $invitation->email,
                'role' => $invitation->role->display_name,
                'inviter' => $invitation->inviter->name,
                'expires_at' => $invitation->expires_at->format('M d, Y'),
            ],
            'token' => $token,
        ]);
    }

    /**
     * Accept an invitation and create user account.
     */
    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = Invitation::findByToken($token);

        if (!$invitation) {
            return redirect()->route('login')
                ->with('error', 'Invalid or expired invitation link.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // Create user with pre-assigned role and active status
        $user = User::create([
            'name' => $validated['name'],
            'email' => $invitation->email,
            'password' => Hash::make($validated['password']),
            'role_id' => $invitation->role_id,
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(), // Invitation implies verified email
        ]);

        // Attach to teams if specified
        if ($invitation->team_ids) {
            $user->teams()->attach($invitation->team_ids);
        }

        // Mark invitation as accepted
        $invitation->markAccepted();

        // Log in the user
        auth()->login($user);

        return redirect()->route('dashboard')
            ->with('success', 'Welcome to Velora! Your account has been activated.');
    }

    /**
     * Resend an invitation.
     */
    public function resend(Invitation $invitation): RedirectResponse
    {
        $this->authorize('update', $invitation);

        if ($invitation->status !== Invitation::STATUS_PENDING) {
            return back()->with('error', 'Cannot resend a non-pending invitation.');
        }

        // Extend expiry
        $invitation->update([
            'token' => Invitation::generateToken(),
            'expires_at' => now()->addDays(Invitation::EXPIRY_DAYS),
        ]);

        // Resend invitation email
        Mail::to($invitation->email)->send(new InvitationMail($invitation));

        return back()->with('success', 'Invitation resent successfully.');
    }

    /**
     * Cancel an invitation.
     */
    public function destroy(Invitation $invitation): RedirectResponse
    {
        $this->authorize('delete', $invitation);

        if ($invitation->status === Invitation::STATUS_ACCEPTED) {
            return back()->with('error', 'Cannot delete an accepted invitation.');
        }

        $invitation->delete();

        return back()->with('success', 'Invitation cancelled.');
    }
}
