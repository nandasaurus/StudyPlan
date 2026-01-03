import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from '@inertiajs/react';

export default function TaskStatistics({ completed, pending }) {
    // State buat filter Periode (Simulasi UI dulu)
    const [period, setPeriod] = useState('mingguan');

    // Data untuk Grafik
    const data = [
        { name: 'Selesai', jumlah: completed },
        { name: 'Belum', jumlah: pending },
    ];

    return (
        <div className="max-w-sm mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            
            {/* 1. DROPDOWN PERIODE */}
            <div className="mb-4">
                <select 
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full bg-gray-200 border-none rounded text-gray-700 text-sm focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200"
                >
                    <option value="harian">Periode: Harian</option>
                    <option value="mingguan">Periode: Mingguan</option>
                    <option value="bulanan">Periode: Bulanan</option>
                </select>
            </div>

            {/* 2. KOTAK GRAFIK KEMAJUAN */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4 flex flex-col items-center justify-center dark:bg-gray-900 dark:border-gray-600">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Grafik Kemajuan</h3>
                
                {/* Area Grafik */}
                <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="jumlah" radius={[4, 4, 0, 0]} barSize={40}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#fbbf24'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. DUA KOTAK STATISTIK (Selesai & Belum) */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Kotak Kiri */}
                <div className="bg-gray-200 dark:bg-gray-700 rounded p-3 text-center flex flex-col items-center justify-center h-24">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase">Jumlah Tugas</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase">Selesai</span>
                    <span className="text-2xl font-bold text-green-600 mt-1">{completed}</span>
                </div>

                {/* Kotak Kanan */}
                <div className="bg-gray-200 dark:bg-gray-700 rounded p-3 text-center flex flex-col items-center justify-center h-24">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase">Jumlah Tugas</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase">Belum Selesai</span>
                    <span className="text-2xl font-bold text-yellow-600 mt-1">{pending}</span>
                </div>
            </div>

            {/* 4. TOMBOL KEMBALI */}
            <Link 
                href={route('tasks.index')} // Arahkan ke list tugas
                className="block w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded text-center transition dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
                Kembali
            </Link>

        </div>
    );
}