<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Represents a dynamic QR token session for presence validation.
 *
 * Each session is single-use: generated → active → consumed/expired/revoked.
 * Tokens are never stored raw — only SHA-256 hashes.
 * Nonces prevent replay attacks.
 */
class QrSession extends Model
{
    protected $fillable = [
        'token_hash',
        'nonce',
        'generated_by',
        'expires_at',
        'consumed_by',
        'consumed_at',
        'attendance_id',
        'status',
        'metadata',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'consumed_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Status constants
    public const STATUS_ACTIVE = 'active';
    public const STATUS_CONSUMED = 'consumed';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_REVOKED = 'revoked';

    // Enforce immutability after consumption
    protected static function boot(): void
    {
        parent::boot();

        static::updating(function (self $model) {
            if ($model->getOriginal('status') === self::STATUS_CONSUMED) {
                throw new \RuntimeException('Consumed QR sessions are immutable.');
            }
        });
    }

    // Relationships

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function consumer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'consumed_by');
    }

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    // Scopes

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('expires_at', '>', now());
    }

    public function scopeExpiredUnclaimed(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('expires_at', '<=', now());
    }

    public function scopeForNonce(Builder $query, string $nonce): Builder
    {
        return $query->where('nonce', $nonce);
    }

    // Helpers

    public function isValid(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->expires_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isConsumed(): bool
    {
        return $this->status === self::STATUS_CONSUMED;
    }

    /**
     * Consume this token for a given user and attendance record.
     * This is a one-way state transition.
     */
    public function consume(User $user, Attendance $attendance): void
    {
        $this->update([
            'status' => self::STATUS_CONSUMED,
            'consumed_by' => $user->id,
            'consumed_at' => now(),
            'attendance_id' => $attendance->id,
        ]);
    }

    /**
     * Revoke this session (emergency invalidation).
     */
    public function revoke(): void
    {
        if ($this->status !== self::STATUS_ACTIVE) {
            return;
        }

        $this->update(['status' => self::STATUS_REVOKED]);
    }
}
