<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }

    protected function schedule(Schedule $schedule): void
    {
        // Jalan setiap menit
        $schedule->command('app:send-deadline-reminders')
            ->everyMinute()
            ->appendOutputTo(storage_path('logs/scheduler.log')); // Simpan log output biar kebaca
    }
}
