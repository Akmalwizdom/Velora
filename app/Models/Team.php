<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    // Relationships

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Schedules assigned to this team.
     */
    public function workSchedules(): BelongsToMany
    {
        return $this->belongsToMany(WorkSchedule::class, 'team_work_schedules')
            ->withPivot(['effective_from', 'effective_until'])
            ->withTimestamps();
    }

    // Helpers

    public function getMemberCount(): int
    {
        return $this->members()->count();
    }
}
