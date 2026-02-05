<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CorrectionController;
use App\Http\Controllers\InsightsController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\TeamAnalyticsController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Pending approval page (authenticated but not active)
Route::get('pending-approval', function () {
    return Inertia::render('auth/pending-approval');
})->middleware('auth')->name('pending-approval');

Route::middleware(['auth', 'verified', 'active'])->group(function () {
    // All authenticated users
    Route::get('attendance-hub', [AttendanceController::class, 'hub'])->name('attendance-hub');
    Route::post('attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.check-in');
    Route::post('attendance/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.check-out');
    Route::get('performance', [PerformanceController::class, 'index'])->name('performance');

    // Behavioral insights (observational, non-punitive)
    Route::prefix('insights')->name('insights.')->group(function () {
        Route::get('weekly-rhythm', [InsightsController::class, 'weeklyRhythm'])->name('weekly-rhythm');
        Route::get('behavioral-signals', [InsightsController::class, 'behavioralSignals'])->name('behavioral-signals');
        Route::post('refresh-snapshot', [InsightsController::class, 'refreshSnapshot'])->name('refresh-snapshot');
    });

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

    // Admin only: User management
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
        Route::post('users/{user}/approve', [UserManagementController::class, 'approve'])->name('users.approve');
        Route::post('users/{user}/reject', [UserManagementController::class, 'reject'])->name('users.reject');
    });
});

require __DIR__.'/settings.php';
