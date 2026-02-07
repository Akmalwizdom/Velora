<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use App\Models\WorkSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkScheduleController extends Controller
{
    /**
     * Display work schedules management page.
     */
    public function index(): Response
    {
        $schedules = WorkSchedule::with(['teams.members', 'users'])
            ->latest()
            ->get()
            ->map(function ($schedule) {
                // Add computed stats for the frontend
                $schedule->total_users = $schedule->total_assigned_users;
                $schedule->formatted_start = $schedule->formatted_start_time;
                $schedule->formatted_end = $schedule->formatted_end_time;
                $schedule->working_hours = $schedule->working_hours;
                $schedule->days_display = $schedule->work_days_display;
                return $schedule;
            });

        $teams = Team::select('id', 'name')->get();
        $users = User::select('id', 'name', 'email')
            ->where('status', User::STATUS_ACTIVE)
            ->get();

        return Inertia::render('admin/work-schedules', [
            'schedules' => $schedules,
            'teams' => $teams,
            'users' => $users,
            'stats' => [
                'total' => $schedules->count(),
                'active' => $schedules->where('is_active', true)->count(),
                'assigned' => $schedules->sum('total_users'),
            ]
        ]);
    }

    /**
     * Store a new work schedule.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|unique:work_schedules,code',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'break_duration_minutes' => 'required|integer|min:0',
            'work_days' => 'required|array|min:1',
            'work_days.*' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'late_tolerance_minutes' => 'required|integer|min:0',
            'is_default' => 'boolean',
            'description' => 'nullable|string',
        ]);

        // Auto-generate code if not provided
        if (empty($validated['code'])) {
            $baseCode = \Illuminate\Support\Str::slug($validated['name'], '-');
            $code = $baseCode;
            $counter = 1;
            while (WorkSchedule::where('code', $code)->exists()) {
                $code = $baseCode . '-' . $counter++;
            }
            $validated['code'] = strtoupper($code);
        }

        if ($validated['is_default'] ?? false) {
            WorkSchedule::where('is_default', true)->update(['is_default' => false]);
        }

        WorkSchedule::create($validated);

        return back()->with('success', 'Work schedule created successfully.');
    }

    /**
     * Update an existing work schedule.
     */
    public function update(Request $request, WorkSchedule $work_schedule): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|unique:work_schedules,code,' . $work_schedule->id,
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'break_duration_minutes' => 'required|integer|min:0',
            'work_days' => 'required|array|min:1',
            'work_days.*' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'late_tolerance_minutes' => 'required|integer|min:0',
            'is_default' => 'boolean',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Auto-generate code if not provided and name changed
        if (empty($validated['code'])) {
            $validated['code'] = $work_schedule->code; // Maintain existing if not changing
        }

        if (($validated['is_default'] ?? false) && !$work_schedule->is_default) {
            WorkSchedule::where('is_default', true)->update(['is_default' => false]);
        }

        $work_schedule->update($validated);

        return back()->with('success', 'Work schedule updated successfully.');
    }

    /**
     * Delete a work schedule.
     */
    public function destroy(WorkSchedule $work_schedule): RedirectResponse
    {
        if ($work_schedule->is_default) {
            return back()->with('error', 'Cannot delete the default work schedule.');
        }

        // Check if assigned
        if ($work_schedule->getTotalAssignedUsersAttribute() > 0) {
            return back()->with('error', 'Cannot delete schedule that is currently assigned to users or teams.');
        }

        $work_schedule->delete();

        return back()->with('success', 'Work schedule deleted successfully.');
    }

    /**
     * Assign schedule to teams or users.
     */
    public function assign(Request $request, WorkSchedule $work_schedule): RedirectResponse
    {
        $validated = $request->validate([
            'team_ids' => 'nullable|array',
            'team_ids.*' => 'exists:teams,id',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
            'effective_from' => 'required|date',
            'effective_until' => 'nullable|date|after_or_equal:effective_from',
        ]);

        // Assign to teams
        if (!empty($validated['team_ids'])) {
            foreach ($validated['team_ids'] as $teamId) {
                $work_schedule->teams()->syncWithoutDetaching([
                    $teamId => [
                        'effective_from' => $validated['effective_from'],
                        'effective_until' => $validated['effective_until'],
                    ]
                ]);
            }
        }

        // Assign to users (overrides)
        if (!empty($validated['user_ids'])) {
            foreach ($validated['user_ids'] as $userId) {
                $work_schedule->users()->syncWithoutDetaching([
                    $userId => [
                        'effective_from' => $validated['effective_from'],
                        'effective_until' => $validated['effective_until'],
                        'is_override' => true,
                    ]
                ]);
            }
        }

        return back()->with('success', 'Schedule assigned successfully.');
    }
}
