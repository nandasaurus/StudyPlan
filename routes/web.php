<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\TaskController;
use App\Http\Controllers\Auth\SocialiteController;
use Illuminate\Support\Carbon;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $userId = auth()->id();

    // Hitung-hitungan
    $stats = [
        'total' => \App\Models\Task::where('user_id', $userId)->count(),
        'pending' => \App\Models\Task::where('user_id', $userId)->where('status', 'pending')->count(),
        'completed' => \App\Models\Task::where('user_id', $userId)->where('status', 'completed')->count(),
        // Tugas pending yang deadline-nya sudah lewat
        'overdue' => \App\Models\Task::where('user_id', $userId)
            ->where('status', 'pending')
            ->where('deadline', '<', now())
            ->count(),
    ];

    return Inertia::render('Dashboard', [
        'stats' => $stats
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy']);
});

Route::get('/auth/google', [SocialiteController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [SocialiteController::class, 'callback']);
// Route buat putus koneksi Google
Route::delete('/auth/google/disconnect', [App\Http\Controllers\Auth\SocialiteController::class, 'disconnect'])
    ->name('auth.google.disconnect');

Route::get('/notifications/check', function () {
    $now = now();

    // Logika 4 Pos (24h, 12h, 1h, 30m)
    $task = \App\Models\Task::where('user_id', auth()->id())
        ->where('status', 'pending')
        ->where(function ($query) use ($now) {
            $query
                ->whereBetween('deadline', [$now->copy()->addHours(24), $now->copy()->addHours(24)->addMinutes(2)])
                ->orWhereBetween('deadline', [$now->copy()->addHours(12), $now->copy()->addHours(12)->addMinutes(2)])
                ->orWhereBetween('deadline', [$now->copy()->addHour(), $now->copy()->addHour()->addMinutes(2)])
                ->orWhereBetween('deadline', [$now->copy()->addMinutes(30), $now->copy()->addMinutes(32)]);
        })
        ->first();

    if ($task) {
        $timeRemaining = \Illuminate\Support\Carbon::parse($task->deadline)->diffForHumans();
        return response()->json([
            'alert' => true,
            'id' => $task->id, // <--- KITA TAMBAH INI (ID TUGAS)
            'message' => "⚠️ Pengingat! Tugas '{$task->title}' deadline {$timeRemaining}!"
        ]);
    }

    return response()->json(['alert' => false]);
})->middleware(['auth']);

require __DIR__ . '/auth.php';
