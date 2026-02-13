<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('token_hash', 64)->unique(); // SHA-256 hash of signed token
            $table->string('nonce', 32)->unique(); // Cryptographic nonce for replay prevention
            $table->foreignId('generated_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('expires_at');
            $table->foreignId('consumed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('consumed_at')->nullable();
            $table->foreignId('attendance_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('active'); // active, consumed, expired, revoked
            $table->json('metadata')->nullable(); // Optional context (location hint, device info)
            $table->timestamps();

            $table->index(['status', 'expires_at']); // Cleanup queries
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_sessions');
    }
};
