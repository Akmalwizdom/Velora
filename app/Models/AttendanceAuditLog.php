<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Immutable audit log for attendance modifications.
 *
 * Trust requires traceability. This model enforces immutability
 * to ensure audit logs cannot be tampered with after creation.
 */
class AttendanceAuditLog extends Model
{
    protected $fillable = [
        'attendance_id',
        'actor_id',
        'action',
        'previous_values',
        'new_values',
        'source',
        'device_type',
        'occurred_at',
    ];

    protected $casts = [
        'previous_values' => 'array',
        'new_values' => 'array',
        'occurred_at' => 'datetime',
    ];

    /**
     * Enforce immutability - audit logs cannot be modified.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::updating(function ($model) {
            throw new \RuntimeException('Audit logs are immutable and cannot be modified.');
        });

        static::deleting(function ($model) {
            throw new \RuntimeException('Audit logs are immutable and cannot be deleted.');
        });
    }

    // Relationships

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    // Scopes

    public function scopeForAttendance($query, int $attendanceId)
    {
        return $query->where('attendance_id', $attendanceId);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    // Helpers

    public function isCreation(): bool
    {
        return $this->action === 'created';
    }

    public function isCorrection(): bool
    {
        return in_array($this->action, ['correction_approved', 'correction_rejected']);
    }
}
