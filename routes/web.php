<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('team-analytics', function () {
        return Inertia::render('team-analytics');
    })->name('team-analytics');

    Route::get('attendance-hub', function () {
        return Inertia::render('attendance-hub');
    })->name('attendance-hub');

    Route::get('log-management', function () {
        return Inertia::render('log-management');
    })->name('log-management');

    Route::get('performance', function () {
        return Inertia::render('performance-dashboard');
    })->name('performance');
});

require __DIR__.'/settings.php';
