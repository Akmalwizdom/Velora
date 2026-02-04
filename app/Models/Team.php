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

    // Helpers

    public function getMemberCount(): int
    {
        return $this->members()->count();
    }
}
