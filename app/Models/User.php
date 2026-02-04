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

    // RBAC Helpers

    public function isEmployee(): bool
    {
        return $this->role?->name === Role::EMPLOYEE;
    }

    public function isHr(): bool
    {
        return $this->role?->name === Role::HR;
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
        return in_array($this->role?->name, [Role::HR, Role::MANAGER, Role::ADMIN]);
    }

    public function canApproveCorrections(): bool
    {
        return in_array($this->role?->name, [Role::HR, Role::MANAGER, Role::ADMIN]);
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
