<?php

namespace App\Http\Controllers;

use App\Services\AttendanceInsightsService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller for behavioral insights and weekly rhythm data.
 *
 * All insights are OBSERVATIONAL, not punitive.
 * Favors glanceable visualization over dense analytics.
 */
class InsightsController extends Controller
{
    public function __construct(
        protected AttendanceInsightsService $insightsService
    ) {}

    /**
     * Get weekly rhythm data for the current user.
     * Returns glanceable pattern visualization.
     */
    public function weeklyRhythm(): JsonResponse
    {
        $user = auth()->user();
        $rhythm = $this->insightsService->getWeeklyRhythm($user);

        return response()->json([
            'success' => true,
            'data' => $rhythm,
        ]);
    }

    /**
     * Get behavioral signals for the current user.
     * Observational only - no scoring or ranking.
     */
    public function behavioralSignals(): JsonResponse
    {
        $user = auth()->user();
        $signals = $this->insightsService->getBehavioralSignals($user);

        return response()->json([
            'success' => true,
            'data' => $signals,
        ]);
    }

    /**
     * Refresh weekly rhythm snapshot (admin/scheduled task).
     */
    public function refreshSnapshot(): JsonResponse
    {
        $user = auth()->user();
        $year = now()->year;
        $weekNumber = now()->weekOfYear;

        $snapshot = $this->insightsService->refreshSnapshot($user, $year, $weekNumber);

        return response()->json([
            'success' => true,
            'message' => 'Snapshot refreshed',
            'data' => $snapshot->toArray(),
        ]);
    }
}
