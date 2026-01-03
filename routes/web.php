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
    // Cek apakah ada tugas yang deadline-nya dalam 1 JAM ke depan
    // dan statusnya belum selesai
    $hasDeadline = \App\Models\Task::where('user_id', auth()->id())
        ->where('status', 'pending')
        ->whereBetween('deadline', [now(), now()->addHour()]) // Cek 60 menit ke depan
        ->exists();

    return response()->json(['alert' => $hasDeadline]);
})->middleware(['auth']);

require __DIR__ . '/auth.php';
