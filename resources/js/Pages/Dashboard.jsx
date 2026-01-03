import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import TaskStatistics from '@/Components/TaskStatistics'; // <--- IMPORT INI

export default function Dashboard({ auth, stats }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* KOLOM KIRI: STATISTIK TEXT (Yang Lama) */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <div className="text-gray-500 text-sm uppercase font-bold">Total Tugas</div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.total || 0}</div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-red-500">
                                <div className="text-red-500 text-sm uppercase font-bold">Terlambat</div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.overdue || 0}</div>
                            </div>

                             <div className="col-span-1 sm:col-span-2 bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Selamat Datang, {auth.user.name}!</h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Cek panel di sebelah kanan untuk melihat grafik kemajuan tugasmu secara visual.
                                </p>
                            </div>
                        </div>

                        {/* KOLOM KANAN: WIDGET GRAFIK (SESUAI GAMBAR REQUEST) */}
                        <div className="md:col-span-1">
                            <TaskStatistics 
                                completed={stats?.completed || 0} 
                                pending={stats?.pending || 0} 
                            />
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}