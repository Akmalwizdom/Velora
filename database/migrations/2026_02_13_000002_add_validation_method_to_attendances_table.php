<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // How the attendance was validated: 'manual', 'qr', 'api'
            // Extensible for future methods: 'nfc', 'ble', 'proximity'
            $table->string('validation_method')->default('manual')->after('location_accuracy');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn('validation_method');
        });
    }
};
