import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { useState } from 'react';

export default function TaskIndex({ auth, tasks, filters }) {
    // Setup form helper dari Inertia
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        deadline: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('tasks.store'), { onSuccess: () => reset() });
    };

    const [queryParams, setQueryParams] = useState({
        search: filters.search || '',
        status: filters.status || ''
    });

    const handleSearchFilter = (field, value) => {
        const newParams = { ...queryParams, [field]: value };
        setQueryParams(newParams);

        // Kirim ke Laravel (GET request)
        router.get(route('tasks.index'), newParams, {
            preserveState: true, // Biar gak refresh halaman total
            replace: true,       // Biar gak menuhin history browser
        });
    };

    const [selectedTask, setSelectedTask] = useState(null); // Data tugas yg diklik
    const [showDetailModal, setShowDetailModal] = useState(false); // Status buka/tutup

    const openModal = (task) => {
        setSelectedTask(task);
        setShowDetailModal(true);
    };

    const closeModal = () => {
        setShowDetailModal(false);
        setTimeout(() => setSelectedTask(null), 200); // Biar animasi nutup mulus
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar Tugas</h2>}
        >
            <Head title="Tasks" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* FORM INPUT TUGAS */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* BARIS 1 KIRI: Judul Tugas */}
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Judul Tugas</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-300"
                                        placeholder="Contoh: Ngerjain Laporan"
                                    />
                                    <span className="text-red-500 text-xs">{errors.title}</span>
                                </div>

                                {/* BARIS 1 KANAN: Deadline */}
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Deadline</label>
                                    <input
                                        type="datetime-local"
                                        value={data.deadline}
                                        onChange={e => setData('deadline', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-300"
                                    />
                                </div>

                                {/* BARIS 2 FULL: Deskripsi */}
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Deskripsi (Opsional)</label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-300"
                                        placeholder="Catatan tambahan..."
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>

                            {/* TOMBOL (Pojok Kanan Bawah) */}
                            <div className="flex justify-end mt-4">
                                <button 
                                    disabled={processing}
                                    type="submit" 
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition shadow flex items-center gap-2"
                                >
                                    <span>+ Tambah</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* FORM PENCARIAN & FILTER (Taruh di ANTARA Form Input & Daftar Tugas) */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                        
                        {/* Input Pencarian */}
                        <div className="w-full md:w-1/2">
                            <input
                                type="text"
                                placeholder="🔍 Cari tugas..."
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200"
                                value={queryParams.search}
                                onChange={(e) => handleSearchFilter('search', e.target.value)}
                            />
                        </div>

                        {/* Dropdown Filter Status */}
                        <div className="w-full md:w-1/4">
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200"
                                value={queryParams.status}
                                onChange={(e) => handleSearchFilter('status', e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">⏳ Belum Selesai</option>
                                <option value="completed">✅ Selesai</option>
                            </select>
                        </div>
                    </div>

                    {/* DAFTAR TUGAS */}
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex justify-between items-center transition hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    {/* Tombol Checklist (Toggle Status) */}
                                    <button
                                        onClick={() => router.patch(route('tasks.update', task.id))}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            task.status === 'completed' 
                                            ? 'bg-green-500 border-green-500 text-white' 
                                            : 'border-gray-400 hover:border-green-500'
                                        }`}
                                    >
                                        {task.status === 'completed' && '✓'}
                                    </button>

                                    <div>
                                        {/* Judul dicoret kalau completed */}
                                        <h3 className={`text-lg font-bold ${
                                            task.status === 'completed' 
                                            ? 'text-gray-400 line-through' 
                                            : 'text-gray-800 dark:text-gray-200'
                                        }`}>
                                            {task.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Deadline: {new Date(task.deadline).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/*tombol view */}
                                <button 
                                    onClick={() => openModal(task)}
                                    className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 rounded text-sm transition mr-3"
                                >
                                    Lihat
                                </button>

                                {/* Tombol Hapus */}
                                <button
                                    onClick={() => {
                                        if(confirm('Yakin mau hapus tugas ini?')) {
                                            router.delete(route('tasks.destroy', task.id));
                                        }
                                    }}
                                    className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                >
                                    Hapus
                                </button>
                            </div>
                        ))}
                        
                        {tasks.length === 0 && (
                            <p className="text-center text-gray-500">Belum ada tugas. Santai dulu bro!</p>
                        )}
                    </div>

                </div>
            </div>

            {/* --- MODAL DETAIL TUGAS --- */}
            <Modal show={showDetailModal} onClose={closeModal}>
                <div className="p-6 bg-white dark:bg-gray-800">
                    {selectedTask && (
                        <>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {selectedTask.title}
                            </h2>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
                                    <p className="text-sm dark:text-gray-300">
                                        {selectedTask.status === 'completed' ? '✅ Selesai' : '⏳ Pending'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Deadline</span>
                                    <p className="text-sm dark:text-gray-300">
                                        {new Date(selectedTask.deadline).toLocaleString('id-ID')}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Deskripsi</span>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap border p-3 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                                        {selectedTask.description || '- Tidak ada deskripsi -'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <SecondaryButton onClick={closeModal}>
                                    Tutup
                                </SecondaryButton>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}