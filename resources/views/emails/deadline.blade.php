<x-mail::message>
# Halo, {{ $task->user->name }}!

Ini pengingat otomatis. Tugas kamu **{{ $task->title }}** akan segera berakhir.

**Deadline:** {{ \Carbon\Carbon::parse($task->deadline)->translatedFormat('l, d F Y H:i') }}

Segera selesaikan ya!

<x-mail::button :url="route('tasks.index')">
Cek Tugas
</x-mail::button>

Semangat,<br>
{{ config('app.name') }}
</x-mail::message>