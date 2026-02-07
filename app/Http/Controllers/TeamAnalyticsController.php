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
        $user = auth()->user();

        return Inertia::render('team-analytics', [
            'stats' => [
                'presence' => $this->teamAnalyticsService->getPresencePercentage($user),
                'activeNow' => $this->teamAnalyticsService->getActiveCount($user),
                'remote' => $this->teamAnalyticsService->getRemoteCount($user),
                'lateAbsent' => $this->teamAnalyticsService->getLateAbsentCount($user),
            ],
            'lateMembers' => $this->teamAnalyticsService->getLateMembers($user),
            'remoteMembers' => $this->teamAnalyticsService->getRemoteMembers($user),
            'activeMembers' => $this->teamAnalyticsService->getActiveMembers($user),
            'pulseFeed' => $this->teamAnalyticsService->getPulseFeed($user),
            'energyFlux' => $this->teamAnalyticsService->getEnergyFlux($user),
        ]);
    }
}
