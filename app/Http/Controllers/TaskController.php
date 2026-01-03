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

        // 4. Sorting (Logika Baru Disini)
        if ($request->filled('sort')) {
            switch ($request->sort) {
                case 'deadline-desc': // Paling lama deadlinenya
                    $query->orderBy('deadline', 'desc');
                    break;
                case 'title-asc': // Abjad A-Z
                    $query->orderBy('title', 'asc');
                    break;
                case 'title-desc': // Abjad Z-A
                    $query->orderBy('title', 'desc');
                    break;
                case 'created-desc': // Paling baru dibuat
                    $query->orderBy('created_at', 'desc');
                    break;
                default: // deadline-asc (Default: Paling mepet)
                    $query->orderBy('deadline', 'asc');
                    break;
            }
        } else {
            // Kalau gak milih apa-apa, defaultnya deadline terdekat
            $query->orderBy('deadline', 'asc');
        }
        $tasks = $query->get();

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
