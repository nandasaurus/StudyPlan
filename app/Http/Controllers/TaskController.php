<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use Inertia\Inertia;

class TaskController extends Controller
{
    // Menampilkan halaman tugas
    public function index(Request $request)
    {
        // 1. Mulai query dasar (Tugas milik user login)
        $query = Task::where('user_id', auth()->id());

        // 2. Logic Pencarian (Search)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // 3. Logic Filter Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 4. Ambil data (Urutkan dari deadline terdekat)
        $tasks = $query->orderBy('deadline', 'asc')->get();

        // 5. Kirim ke React (Termasuk nilai filter saat ini biar gak ilang pas reload)
        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    // Menyimpan tugas baru
    public function store(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'deadline' => 'required|date',
            'description' => 'nullable|string',
        ]);

        // Masukin user_id otomatis
        $request->user()->tasks()->create($validated);

        // Redirect balik ke halaman tasks
        return to_route('tasks.index');
    }

    // Update status tugas (Pending <-> Completed)
    public function update(Request $request, Task $task)
    {
        // Security: Pastikan yang edit adalah pemilik tugas
        if ($request->user()->id !== $task->user_id) {
            abort(403);
        }

        $task->update([
            'status' => $task->status === 'pending' ? 'completed' : 'pending'
        ]);

        return to_route('tasks.index');
    }

    // Hapus tugas
    public function destroy(Task $task)
    {
        // Security: Pastikan yang hapus adalah pemilik tugas
        if (request()->user()->id !== $task->user_id) {
            abort(403);
        }

        $task->delete();

        return to_route('tasks.index');
    }
}
