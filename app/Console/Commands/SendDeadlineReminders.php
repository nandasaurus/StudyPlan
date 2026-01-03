<?php

namespace App\Console\Commands;

use App\Mail\TaskDeadlineNotification;
use App\Models\Task;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendDeadlineReminders extends Command
{
    protected $signature = 'app:send-deadline-reminders';
    protected $description = 'Kirim notifikasi tugas deadline H-1';

    public function handle()
    {
        $this->info('🚀 Memulai pengecekan tugas...');

        // Ambil waktu sekarang & 24 jam ke depan
        $now = now();
        $next24Hours = now()->addDay();

        $this->info("🕒 Waktu Server: " . $now->toDateTimeString());

        // Cari tugas yang:
        // 1. Pending (Belum selesai)
        // 2. Deadline antara SEKARANG s/d BESOK
        // 3. Belum pernah dikirim notifikasi
        $tasks = Task::where('status', 'pending')
            ->where('reminder_sent', false)
            ->whereBetween('deadline', [$now, $next24Hours])
            ->with('user') // Eager load user biar hemat query
            ->get();

        $count = $tasks->count();
        $this->info("🔍 Ditemukan {$count} tugas yang mendekati deadline.");

        foreach ($tasks as $task) {
            try {
                // Kirim Email
                Mail::to($task->user->email)->send(new TaskDeadlineNotification($task));

                // Update status biar gak dikirim lagi
                $task->update(['reminder_sent' => true]);

                $this->info("✅ Email terkirim ke: {$task->user->email} | Tugas: {$task->title}");
                Log::info("Notifikasi deadline terkirim untuk Task ID: {$task->id}");
            } catch (\Exception $e) {
                $this->error("❌ Gagal kirim ke {$task->user->email}: " . $e->getMessage());
            }
        }

        $this->info('🏁 Pengecekan selesai.');
    }
}
