<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'token',
        'role_id',
        'invited_by',
        'team_ids',
        'status',
        'expires_at',
        'accepted_at',
    ];

    protected $casts = [
        'team_ids' => 'array',
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    // Constants

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_EXPIRED = 'expired';

    public const EXPIRY_DAYS = 7;

    // Relationships

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    // Scopes

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeValid(Builder $query): Builder
    {
        return $query->pending()
            ->where('expires_at', '>', now());
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('expires_at', '<=', now())
            ->where('status', self::STATUS_PENDING);
    }

    // Helpers

    public function isValid(): bool
    {
        return $this->status === self::STATUS_PENDING
            && $this->expires_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function markAccepted(): void
    {
        $this->update([
            'status' => self::STATUS_ACCEPTED,
            'accepted_at' => now(),
        ]);
    }

    public function markExpired(): void
    {
        $this->update([
            'status' => self::STATUS_EXPIRED,
        ]);
    }

    /**
     * Generate a secure invitation token.
     */
    public static function generateToken(): string
    {
        return Str::random(64);
    }

    /**
     * Create a new invitation.
     */
    public static function createFor(
        string $email,
        int $roleId,
        User $inviter,
        ?array $teamIds = null
    ): self {
        return self::create([
            'email' => strtolower($email),
            'token' => self::generateToken(),
            'role_id' => $roleId,
            'invited_by' => $inviter->id,
            'team_ids' => $teamIds,
            'status' => self::STATUS_PENDING,
            'expires_at' => now()->addDays(self::EXPIRY_DAYS),
        ]);
    }

    /**
     * Find a valid invitation by token.
     */
    public static function findByToken(string $token): ?self
    {
        return self::valid()->where('token', $token)->first();
    }
}
