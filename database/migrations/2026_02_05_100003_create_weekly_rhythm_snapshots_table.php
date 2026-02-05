<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_rhythm_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->integer('week_number');
            $table->integer('on_time_days')->default(0);
            $table->integer('late_days')->default(0);
            $table->integer('absent_days')->default(0);
            $table->decimal('total_hours', 5, 2)->default(0);
            $table->json('daily_breakdown')->nullable(); // Mon-Sun pattern for glanceable viz
            $table->timestamps();

            $table->unique(['user_id', 'year', 'week_number']);
            $table->index(['user_id', 'year', 'week_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_rhythm_snapshots');
    }
};
