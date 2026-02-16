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
     * Display the consolidated team dashboard.
     */
    public function index(): Response|\Illuminate\Http\RedirectResponse
    {
        $user = auth()->user();

        // Employees don't have access to the consolidatd team dashboard
        if ($user->role?->name === \App\Models\Role::EMPLOYEE) {
            return redirect()->route('attendance-hub');
        }

        $employeeMetrics = $this->teamAnalyticsService->getEmployeeDetailedMetrics($user);

        return Inertia::render('dashboard', [
            'stats' => [
                'presence' => $this->teamAnalyticsService->getPresencePercentage($user),
                'activeNow' => $this->teamAnalyticsService->getActiveCount($user),
                'lateAbsent' => $this->teamAnalyticsService->getLateAbsentCount($user),
            ],
            'lateMembers' => $this->teamAnalyticsService->getLateMembers($user),
            'activeMembers' => $this->teamAnalyticsService->getActiveMembers($user),
            'pulseFeed' => $this->teamAnalyticsService->getPulseFeed($user),
            'energyFlux' => $this->teamAnalyticsService->getEnergyFlux($user),
            'employeeMetrics' => $employeeMetrics,
            'teamSummary' => [
                'avgPunctuality' => count($employeeMetrics) > 0 
                    ? round(collect($employeeMetrics)->avg('punctuality.rate')) 
                    : 0,
                'totalEmployees' => count($this->teamAnalyticsService->getScopedUsersQuery($user)->get()),
            ]
        ]);
    }
}
