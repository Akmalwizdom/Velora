<?php

namespace App\Http\Controllers;

use App\Services\TeamAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamPerformanceController extends Controller
{
    public function __construct(
        protected TeamAnalyticsService $teamAnalyticsService
    ) {}

    /**
     * Display the team performance tracking page.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        return Inertia::render('team/performance', [
            'employeeMetrics' => $this->teamAnalyticsService->getEmployeeDetailedMetrics($user),
            'teamSummary' => [
                'avgPunctuality' => round(collect($this->teamAnalyticsService->getEmployeeDetailedMetrics($user))->avg('punctuality.rate')),
                'totalEmployees' => count($this->teamAnalyticsService->getScopedUsersQuery($user)->get()),
            ]
        ]);
    }
}
