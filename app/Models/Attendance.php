<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'checked_in_at',
        'checked_out_at',
        'work_mode',
        'cluster',
        'note',
        'status',
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
    ];

    // Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function corrections(): HasMany
    {
        return $this->hasMany(AttendanceCorrection::class);
    }

    // Scopes

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('checked_in_at', today());
    }

    public function scopeThisWeek(Builder $query): Builder
    {
        return $query->whereBetween('checked_in_at', [
            now()->startOfWeek(),
            now()->endOfWeek(),
        ]);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotNull('checked_in_at')
            ->whereNull('checked_out_at');
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    // Helpers

    public function isActive(): bool
    {
        return $this->checked_in_at !== null && $this->checked_out_at === null;
    }

    public function getDurationInMinutes(): int
    {
        $end = $this->checked_out_at ?? now();

        return (int) $this->checked_in_at->diffInMinutes($end);
    }

    public function getDurationInHours(): float
    {
        return round($this->getDurationInMinutes() / 60, 2);
    }
}
