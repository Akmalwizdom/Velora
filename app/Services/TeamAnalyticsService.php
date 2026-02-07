<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Support\Collection;

class TeamAnalyticsService
{
    /**
     * Get presence percentage for today, scoped by user.
     */
    public function getPresencePercentage(User $user): float
    {
        $usersQuery = $this->getScopedUsersQuery($user);
        $totalUsers = $usersQuery->count();

        if ($totalUsers === 0) {
            return 0;
        }

        $checkedIn = $this->getScopedAttendanceQuery($user)
            ->today()
            ->distinct('user_id')
            ->count('user_id');

        return round(($checkedIn / $totalUsers) * 100);
    }

    /**
     * Get count of currently active users, scoped by user.
     */
    public function getActiveCount(User $user): int
    {
        return $this->getScopedAttendanceQuery($user)
            ->today()
            ->active()
            ->count();
    }

    /**
     * Get count of remote workers today, scoped by user.
     */
    public function getRemoteCount(User $user): int
    {
        return $this->getScopedAttendanceQuery($user)
            ->today()
            ->where('work_mode', 'remote')
            ->count();
    }

    /**
     * Get count of late/absent users today, scoped by user.
     */
    public function getLateAbsentCount(User $user): int
    {
        $lateCount = $this->getScopedAttendanceQuery($user)
            ->today()
            ->where('status', 'late')
            ->count();

        // Users who haven't checked in by now (after 9:15 AM) are considered absent
        $totalUsers = $this->getScopedUsersQuery($user)->count();
        $checkedIn = $this->getScopedAttendanceQuery($user)
            ->today()
            ->distinct('user_id')
            ->count('user_id');
        
        $absentCount = max(0, $totalUsers - $checkedIn);

        // Only count absences after work hours start
        if (now()->format('H:i') < '09:15') {
            $absentCount = 0;
        }

        return $lateCount + $absentCount;
    }

    /**
     * Get late members for today, scoped by user.
     */
    public function getLateMembers(User $user): Collection
    {
        return $this->getScopedAttendanceQuery($user)
            ->today()
            ->where('status', 'late')
            ->with('user')
            ->get()
            ->map(fn (Attendance $a) => [
                'id' => $a->user->id,
                'name' => $this->getShortName($a->user->name),
                'time' => $a->checked_in_at->diffForHumans(now()->setHour(9)->setMinute(0), [
                    'parts' => 1,
                    'short' => true,
                ]).' Late',
                'avatar' => 'https://i.pravatar.cc/150?u='.$a->user->id,
                'status' => 'late',
            ]);
    }

    /**
     * Get remote members for today, scoped by user.
     */
    public function getRemoteMembers(User $user): Collection
    {
        return $this->getScopedAttendanceQuery($user)
            ->today()
            ->where('work_mode', 'remote')
            ->with('user')
            ->limit(5)
            ->get()
            ->map(fn (Attendance $a) => [
                'id' => $a->user->id,
                'name' => $this->getShortName($a->user->name),
                'time' => $a->cluster ?? 'Remote',
                'avatar' => 'https://i.pravatar.cc/150?u='.$a->user->id,
                'status' => 'remote',
                'lat' => $a->location_lat,
                'lng' => $a->location_lng,
            ]);
    }

    /**
     * Get all active members with their locations.
     */
    public function getActiveMembers(User $user): Collection
    {
        return $this->getScopedAttendanceQuery($user)
            ->today()
            ->active()
            ->with('user')
            ->get()
            ->map(fn (Attendance $a) => [
                'id' => $a->user->id,
                'name' => $this->getShortName($a->user->name),
                'avatar' => 'https://i.pravatar.cc/150?u='.$a->user->id,
                'status' => $a->work_mode === 'remote' ? 'remote' : 'active',
                'lat' => $a->location_lat,
                'lng' => $a->location_lng,
                'check_in' => $a->checked_in_at->format('H:i'),
            ]);
    }

    /**
     * Get pulse feed items, scoped by user.
     */
    public function getPulseFeed(User $user): array
    {
        $items = [];

        // Check for collaboration dip (simplified logic)
        $remoteCount = $this->getRemoteCount($user);
        $activeCount = $this->getActiveCount($user);
        $remotePercentage = $activeCount > 0 ? ($remoteCount / $activeCount * 100) : 0;
        
        if ($remotePercentage > 50) {
            $items[] = [
                'type' => 'warning',
                'title' => 'Collaboration Dip',
                'desc' => 'Cross-team sync is '.round(100 - $remotePercentage).'% lower than normal. Focus blocks might be overlapping.',
                'action' => 'View Heatmap',
            ];
        }

        // Peak productivity (if many users active)
        $presencePercentage = $this->getPresencePercentage($user);
        if ($presencePercentage >= 80) {
            $items[] = [
                'type' => 'peak',
                'title' => 'Peak Productivity',
                'desc' => "The team just entered 'Hyperfocus' window. {$presencePercentage}% active presence detected.",
                'members' => ['A', 'B', "+{$activeCount}"],
            ];
        }

        // Recent handoffs (simplified)
        $recentCheckouts = $this->getScopedAttendanceQuery($user)
            ->today()
            ->whereNotNull('checked_out_at')
            ->count();

        if ($recentCheckouts > 0) {
            $items[] = [
                'type' => 'success',
                'title' => 'Shift Transitions',
                'desc' => "{$recentCheckouts} team members have completed their sessions today.",
            ];
        }

        return $items;
    }

    /**
     * Get energy flux data (hourly distribution).
     */
    public function getEnergyFlux(User $user): array
    {
        $flux = [];
        $query = $this->getScopedAttendanceQuery($user)->today();

        // Get count of check-ins per 1.5 hour slot (approximate)
        for ($h = 8; $h <= 20; $h += 1.5) {
            $startHour = (int) $h;
            $endHour = (int) ($h + 1.5);
            
            $count = (clone $query)
                ->whereRaw('EXTRACT(HOUR FROM checked_in_at) >= ? AND EXTRACT(HOUR FROM checked_in_at) < ?', [$startHour, $endHour])
                ->count();
            
            // Normalize for visual: 20 -> 100%
            $flux[] = min(100, $count * 5); 
        }

        // If no real data yet, provide a slight "morning peak" baseline instead of empty
        if (array_sum($flux) === 0) {
            return [20, 45, 80, 70, 40, 30, 15, 10];
        }

        return $flux;
    }

    /**
     * Helper to get scoped user query.
     */
    private function getScopedUsersQuery(User $user)
    {
        if ($user->isAdmin()) {
            return User::query();
        }

        return User::whereHas('teams', function ($query) use ($user) {
            $query->whereIn('teams.id', $user->teams->pluck('id'));
        });
    }

    /**
     * Helper to get scoped attendance query.
     */
    private function getScopedAttendanceQuery(User $user)
    {
        if ($user->isAdmin()) {
            return Attendance::query();
        }

        return Attendance::whereHas('user.teams', function ($query) use ($user) {
            $query->whereIn('teams.id', $user->teams->pluck('id'));
        });
    }

    /**
     * Get shortened name (First + Initial).
     */
    private function getShortName(string $fullName): string
    {
        $parts = explode(' ', trim($fullName));

        if (count($parts) === 1) {
            return $fullName;
        }

        return $parts[0].' '.strtoupper(substr($parts[1], 0, 1)).'.';
    }
}
