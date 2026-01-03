<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Biar task nempel ke user
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('deadline'); // Tipe data tanggal + jam
            $table->enum('status', ['pending', 'completed'])->default('pending');
            $table->boolean('reminder_sent')->default(false); // Penanda notifikasi
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
