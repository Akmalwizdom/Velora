<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // created, updated, correction_approved, correction_rejected
            $table->json('previous_values')->nullable();
            $table->json('new_values');
            $table->string('source')->default('system'); // system, user, correction
            $table->string('device_type')->nullable(); // web, mobile
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['attendance_id', 'occurred_at']);
            $table->index(['actor_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_audit_logs');
    }
};
