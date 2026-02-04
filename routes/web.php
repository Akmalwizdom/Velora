<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CorrectionController;
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

Route::middleware(['auth', 'verified'])->group(function () {
    // All authenticated users
    Route::get('attendance-hub', [AttendanceController::class, 'hub'])->name('attendance-hub');
    Route::post('attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.check-in');
    Route::post('attendance/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.check-out');
    Route::get('performance', [PerformanceController::class, 'index'])->name('performance');

    // HR, Manager, Admin only
    Route::middleware('role:hr,manager,admin')->group(function () {
        Route::get('dashboard', [TeamAnalyticsController::class, 'index'])->name('dashboard');
        Route::get('team-analytics', [TeamAnalyticsController::class, 'index'])->name('team-analytics');
        Route::get('log-management', [CorrectionController::class, 'index'])->name('log-management');
        Route::post('corrections/{correction}/approve', [CorrectionController::class, 'approve'])->name('corrections.approve');
        Route::post('corrections/{correction}/reject', [CorrectionController::class, 'reject'])->name('corrections.reject');
    });
});

require __DIR__.'/settings.php';

