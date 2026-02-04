<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Support\Collection;

class TeamAnalyticsService
{
    /**
     * Get presence percentage for today.
     */
    public function getPresencePercentage(): float
    {
        $totalUsers = User::count();

        if ($totalUsers === 0) {
            return 0;
        }

        $checkedIn = Attendance::today()->distinct('user_id')->count('user_id');

        return round(($checkedIn / $totalUsers) * 100);
    }

    /**
     * Get count of currently active users.
     */
    public function getActiveCount(): int
    {
        return Attendance::today()->active()->count();
    }

    /**
     * Get count of remote workers today.
     */
    public function getRemoteCount(): int
    {
        return Attendance::today()
            ->where('work_mode', 'remote')
            ->count();
    }

    /**
     * Get count of late/absent users today.
     */
    public function getLateAbsentCount(): int
    {
        $lateCount = Attendance::today()
            ->where('status', 'late')
            ->count();

        // Users who haven't checked in by now (after 9:15 AM) are considered absent
        $totalUsers = User::count();
        $checkedIn = Attendance::today()->distinct('user_id')->count('user_id');
        $absentCount = max(0, $totalUsers - $checkedIn);

        // Only count absences after work hours start
        if (now()->format('H:i') < '09:15') {
            $absentCount = 0;
        }

        return $lateCount + $absentCount;
    }

    /**
     * Get late members for today.
     */
    public function getLateMembers(): Collection
    {
        return Attendance::today()
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
     * Get remote members for today.
     */
    public function getRemoteMembers(): Collection
    {
        return Attendance::today()
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
            ]);
    }

    /**
     * Get pulse feed items.
     */
    public function getPulseFeed(): array
    {
        $items = [];

        // Check for collaboration dip (simplified logic)
        $remotePercentage = $this->getRemoteCount() / max(1, $this->getActiveCount()) * 100;
        if ($remotePercentage > 50) {
            $items[] = [
                'type' => 'warning',
                'title' => 'Collaboration Dip',
                'desc' => 'Cross-team sync is '.round(100 - $remotePercentage).'% lower than normal. Focus blocks might be overlapping.',
                'action' => 'View Heatmap',
            ];
        }

        // Peak productivity (if many users active)
        $activeCount = $this->getActiveCount();
        $presencePercentage = $this->getPresencePercentage();
        if ($presencePercentage >= 80) {
            $items[] = [
                'type' => 'peak',
                'title' => 'Peak Productivity',
                'desc' => "The team just entered 'Hyperfocus' window. {$presencePercentage}% active presence detected.",
                'members' => ['A', 'B', "+{$activeCount}"],
            ];
        }

        // Recent handoffs (simplified)
        $recentCheckouts = Attendance::today()
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
    public function getEnergyFlux(): array
    {
        // Simplified: return mock pattern based on time of day
        $currentHour = (int) now()->format('H');
        $flux = [];

        for ($h = 8; $h <= 20; $h += 1.5) {
            $hour = (int) $h;
            // Peak around 10-11 AM and 2-3 PM
            $isPeak = in_array($hour, [10, 11, 14, 15]);
            $base = $isPeak ? random_int(70, 90) : random_int(20, 60);
            $flux[] = $base;
        }

        return array_slice($flux, 0, 8);
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
