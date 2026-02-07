<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // Boot

    protected static function booted(): void
    {
        // Enforce default Employee role on creation
        static::creating(function (User $user) {
            if (!$user->role_id) {
                $user->role_id = Role::getEmployeeId();
            }
            // Default status to pending for new users
            if (!$user->status) {
                $user->status = 'pending';
            }
        });
    }

    // Constants

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_SUSPENDED = 'suspended';

    // Relationships

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function todayAttendance(): HasOne
    {
        return $this->hasOne(Attendance::class)
            ->whereDate('checked_in_at', today())
            ->latest('checked_in_at');
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class);
    }

    public function invitation(): HasOne
    {
        return $this->hasOne(Invitation::class, 'email', 'email');
    }

    /**
     * Individual schedule overrides.
     */
    public function workSchedules(): BelongsToMany
    {
        return $this->belongsToMany(WorkSchedule::class, 'user_work_schedules')
            ->withPivot(['effective_from', 'effective_until', 'is_override'])
            ->withTimestamps();
    }

    /**
     * Resolve the current work schedule based on hierarchy:
     * 1. Individual Override
     * 2. Team Schedule
     * 3. Global Default
     */
    public function currentWorkSchedule(): ?WorkSchedule
    {
        // 1. Resolve Individual Override
        $override = $this->workSchedules()
            ->where('is_override', true)
            ->where('effective_from', '<=', today())
            ->where(function ($q) {
                $q->whereNull('effective_until')
                  ->orWhere('effective_until', '>=', today());
            })
            ->first();

        if ($override) return $override;

        // 2. Resolve Team Schedule
        foreach ($this->teams as $team) {
            $teamSchedule = $team->workSchedules()
                ->where('effective_from', '<=', today())
                ->where(function ($q) {
                    $q->whereNull('effective_until')
                      ->orWhere('effective_until', '>=', today());
                })
                ->first();
            
            if ($teamSchedule) return $teamSchedule;
        }

        // 3. Resolve Global Default
        return WorkSchedule::active()->default()->first();
    }

    // Status Helpers

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isSuspended(): bool
    {
        return $this->status === self::STATUS_SUSPENDED;
    }

    public function activate(): void
    {
        $this->update(['status' => self::STATUS_ACTIVE]);
    }

    public function suspend(): void
    {
        $this->update(['status' => self::STATUS_SUSPENDED]);
    }

    // RBAC Helpers

    public function isEmployee(): bool
    {
        return $this->role?->name === Role::EMPLOYEE;
    }

    public function isManager(): bool
    {
        return $this->role?->name === Role::MANAGER;
    }

    public function isAdmin(): bool
    {
        return $this->role?->name === Role::ADMIN;
    }

    public function canViewTeamAnalytics(): bool
    {
        return in_array($this->role?->name, [Role::MANAGER, Role::ADMIN]);
    }

    /**
     * Only managers can approve corrections (not admins - separation of duties).
     */
    public function canApproveCorrections(): bool
    {
        return $this->role?->name === Role::MANAGER;
    }

    // Attendance Helpers

    public function getWeeklyHours(): float
    {
        return $this->attendances()
            ->thisWeek()
            ->get()
            ->sum(fn (Attendance $a) => $a->getDurationInHours());
    }

    public function isCheckedInToday(): bool
    {
        return $this->todayAttendance?->isActive() ?? false;
    }
}
