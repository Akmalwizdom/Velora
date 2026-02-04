<?php

namespace App\Http\Controllers;

use App\Services\TeamAnalyticsService;
use Inertia\Inertia;
use Inertia\Response;

class TeamAnalyticsController extends Controller
{
    public function __construct(
        protected TeamAnalyticsService $teamAnalyticsService
    ) {}

    /**
     * Display the team analytics dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('team-analytics', [
            'stats' => [
                'presence' => $this->teamAnalyticsService->getPresencePercentage(),
                'activeNow' => $this->teamAnalyticsService->getActiveCount(),
                'remote' => $this->teamAnalyticsService->getRemoteCount(),
                'lateAbsent' => $this->teamAnalyticsService->getLateAbsentCount(),
            ],
            'lateMembers' => $this->teamAnalyticsService->getLateMembers(),
            'remoteMembers' => $this->teamAnalyticsService->getRemoteMembers(),
            'pulseFeed' => $this->teamAnalyticsService->getPulseFeed(),
            'energyFlux' => $this->teamAnalyticsService->getEnergyFlux(),
        ]);
    }
}
