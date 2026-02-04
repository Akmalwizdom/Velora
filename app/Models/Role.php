<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
    ];

    // Relationships

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    // Constants for role names

    public const EMPLOYEE = 'employee';
    public const MANAGER = 'manager';
    public const ADMIN = 'admin';

    // Helpers

    public static function getEmployeeId(): ?int
    {
        return static::where('name', self::EMPLOYEE)->value('id');
    }

    public static function getAdminId(): ?int
    {
        return static::where('name', self::ADMIN)->value('id');
    }
}
