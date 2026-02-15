<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Organization-wide settings for configurable features.
 *
 * Includes tracking policies to ensure privacy and trust
 * are maintained according to organizational preferences.
 */
class OrganizationSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = Cache::remember("org_setting:{$key}", 3600, function () use ($key) {
            return static::where('key', $key)->first();
        });

        if (!$setting) {
            return $default;
        }

        return static::castValue($setting->value, $setting->type);
    }

    /**
     * Set a setting value.
     */
    public static function set(string $key, mixed $value, string $type = 'string'): void
    {
        $stringValue = is_array($value) ? json_encode($value) : (string) $value;

        static::updateOrCreate(
            ['key' => $key],
            ['value' => $stringValue, 'type' => $type]
        );

        Cache::forget("org_setting:{$key}");
    }


    /**
     * Check if device type capture is enabled.
     */
    public static function isDeviceTypeCaptureEnabled(): bool
    {
        return static::get('tracking.device_type_capture_enabled', true);
    }


    /**
     * Get the current QR attendance mode.
     * Default is 'required' to establish attendance culture.
     */
    public static function getQrMode(): string
    {
        // 'required' | 'optional' | 'hybrid'
        return static::get('attendance.qr_mode', 'required');
    }

    /**
     * Get QR token TTL in seconds.
     * Hard-capped between 10s and 120s. Default 30s.
     */
    public static function getQrTtlSeconds(): int
    {
        return min(120, max(10, (int) static::get('attendance.qr_ttl_seconds', 30)));
    }

    /**
     * Check if QR validation is mandatory for presence.
     */
    public static function isQrRequired(): bool
    {
        return static::getQrMode() === 'required';
    }

    /**
     * Cast value based on type.
     */
    private static function castValue(string $value, string $type): mixed
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }
}
