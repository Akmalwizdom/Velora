<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Weekly rhythm snapshot for glanceable behavioral insights.
 *
 * Favors visual patterns over dense tables.
 * Observational only - no scoring or punitive language.
 */
class WeeklyRhythmSnapshot extends Model
{
    protected $fillable = [
        'user_id',
        'year',
        'week_number',
        'on_time_days',
        'late_days',
        'absent_days',
        'total_hours',
        'daily_breakdown',
    ];

    protected $casts = [
        'daily_breakdown' => 'array',
        'total_hours' => 'decimal:2',
    ];

    // Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForWeek($query, int $year, int $weekNumber)
    {
        return $query->where('year', $year)->where('week_number', $weekNumber);
    }

    public function scopeRecent($query, int $weeks = 4)
    {
        $currentWeek = now()->weekOfYear;
        $currentYear = now()->year;

        return $query->where(function ($q) use ($currentYear, $currentWeek, $weeks) {
            $q->where('year', $currentYear)
              ->where('week_number', '>=', $currentWeek - $weeks);
        })->orWhere(function ($q) use ($currentYear) {
            // Handle year boundary
            $q->where('year', $currentYear - 1)
              ->where('week_number', '>=', 48);
        });
    }

    // Helpers

    /**
     * Get a simple pattern description for glanceable display.
     * Uses neutral, observational language.
     */
    public function getPatternDescription(): string
    {
        if ($this->on_time_days >= 4) {
            return 'Consistent presence';
        }

        if ($this->late_days >= 3) {
            return 'Flexible schedule pattern';
        }

        if ($this->absent_days >= 2) {
            return 'Variable week';
        }

        return 'Mixed pattern';
    }

    /**
     * Get pattern color for visualization.
     * Colors are neutral - green for presence, muted for others.
     */
    public function getPatternColor(): string
    {
        if ($this->on_time_days >= 4) {
            return 'primary'; // Velora cyan
        }

        return 'muted';
    }
}
