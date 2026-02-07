<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class WorkSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'start_time',
        'end_time',
        'break_duration_minutes',
        'work_days',
        'late_tolerance_minutes',
        'is_active',
        'is_default',
        'description',
    ];

    protected $casts = [
        'work_days' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    // Relationships

    /**
     * Teams assigned to this schedule.
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_work_schedules')
            ->withPivot(['effective_from', 'effective_until'])
            ->withTimestamps();
    }

    /**
     * Users with individual schedule overrides.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_work_schedules')
            ->withPivot(['effective_from', 'effective_until', 'is_override'])
            ->withTimestamps();
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    // Accessors

    /**
     * Get formatted start time (HH:mm).
     */
    public function getFormattedStartTimeAttribute(): string
    {
        return Carbon::parse($this->start_time)->format('H:i');
    }

    /**
     * Get formatted end time (HH:mm).
     */
    public function getFormattedEndTimeAttribute(): string
    {
        return Carbon::parse($this->end_time)->format('H:i');
    }

    /**
     * Calculate total working hours (excluding break).
     */
    public function getWorkingHoursAttribute(): float
    {
        $start = Carbon::parse($this->start_time);
        $end = Carbon::parse($this->end_time);
        $minutes = $start->diffInMinutes($end) - $this->break_duration_minutes;

        return round($minutes / 60, 1);
    }

    /**
     * Get localized work days for display.
     */
    public function getWorkDaysDisplayAttribute(): array
    {
        $dayNames = [
            'monday' => 'Sen',
            'tuesday' => 'Sel',
            'wednesday' => 'Rab',
            'thursday' => 'Kam',
            'friday' => 'Jum',
            'saturday' => 'Sab',
            'sunday' => 'Min',
        ];

        return array_map(
            fn($day) => $dayNames[$day] ?? ucfirst($day),
            $this->work_days ?? []
        );
    }

    /**
     * Count total users assigned (directly or via team).
     */
    public function getTotalAssignedUsersAttribute(): int
    {
        $directUsers = $this->users()->count();
        $teamUsers = $this->teams->sum(fn($team) => $team->members()->count());

        return $directUsers + $teamUsers;
    }

    // Helpers

    /**
     * Check if a given day is a work day.
     */
    public function isWorkDay(string $day): bool
    {
        return in_array(strtolower($day), $this->work_days ?? []);
    }

    /**
     * Check if a check-in time is late based on this schedule.
     */
    public function isLate(\Carbon\CarbonInterface $checkInTime): bool
    {
        if (empty($this->start_time)) return false;

        $checkInTimeStr = $checkInTime->format('H:i:s');
        
        $startTime = \Illuminate\Support\Carbon::parse($this->start_time);
        $graceEndTimeStr = $startTime->addMinutes($this->late_tolerance_minutes)->format('H:i:s');

        return $checkInTimeStr > $graceEndTimeStr;
    }

    /**
     * Calculate overtime minutes (signal only, not auto-calculated compensation).
     */
    public function getOvertimeMinutes(Carbon $checkOutTime): int
    {
        $scheduledEnd = Carbon::parse($this->end_time);

        if ($checkOutTime->format('H:i:s') <= $scheduledEnd->format('H:i:s')) {
            return 0;
        }

        return $checkOutTime->diffInMinutes($scheduledEnd);
    }
}
