<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CorrectionController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\TeamAnalyticsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Invitation acceptance (public routes - no auth required)
Route::get('invitation/{token}', [InvitationController::class, 'showAccept'])->name('invitation.accept');
Route::post('invitation/{token}', [InvitationController::class, 'accept'])->name('invitation.accept.store');

Route::middleware(['auth', 'verified', 'active'])->group(function () {
    // All authenticated users
    Route::get('attendance-hub', [AttendanceController::class, 'hub'])->name('attendance-hub');
    Route::post('attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.check-in');
    Route::post('attendance/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.check-out');
    Route::get('performance', [PerformanceController::class, 'index'])->name('performance');

    // Manager and Admin: Team analytics & dashboard (read access)
    Route::middleware('role:manager,admin')->group(function () {
        Route::get('dashboard', [TeamAnalyticsController::class, 'index'])->name('dashboard');
        Route::get('team-analytics', [TeamAnalyticsController::class, 'index'])->name('team-analytics');
        Route::get('log-management', [CorrectionController::class, 'index'])->name('log-management');
    });

    // Manager only: Operational actions (separation of duties - Admin cannot approve)
    Route::middleware('role:manager')->group(function () {
        Route::post('corrections/{correction}/approve', [CorrectionController::class, 'approve'])->name('corrections.approve');
        Route::post('corrections/{correction}/reject', [CorrectionController::class, 'reject'])->name('corrections.reject');
    });

    // Admin only: Invitation management
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('invitations', [InvitationController::class, 'index'])->name('invitations.index');
        Route::post('invitations', [InvitationController::class, 'store'])->name('invitations.store');
        Route::post('invitations/{invitation}/resend', [InvitationController::class, 'resend'])->name('invitations.resend');
        Route::delete('invitations/{invitation}', [InvitationController::class, 'destroy'])->name('invitations.destroy');
    });
});

require __DIR__.'/settings.php';
