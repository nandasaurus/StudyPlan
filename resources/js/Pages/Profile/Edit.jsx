import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    // Helper buat form connect/disconnect Google
    const disconnectForm = useForm();
    const { props } = usePage(); // Ambil flash message kalau ada

    // Form Upload Avatar
    const { data, setData, post, processing } = useForm({
        _method: 'PATCH',
        name: auth.user.name,
        email: auth.user.email,
        avatar: null,
    });

    const [preview, setPreview] = useState(auth.user.avatar ? `/storage/${auth.user.avatar}` : null);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setData('avatar', file);
        
        // Bikin preview gambar biar user liat sebelum save
        setPreview(URL.createObjectURL(file));
    };

    const submitAvatar = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => alert('Foto profil berhasil diperbarui!'),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Profile Saya</h2>}
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* --- BAGIAN ATAS: GRID KIRI (FOTO) & KANAN (INFO) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* KOLOM 1: KARTU FOTO & GOOGLE */}
                        <div className="space-y-6">
                            
                            {/* 1. Upload Foto */}
                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg text-center">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Foto Profil</h3>
                                
                                <form onSubmit={submitAvatar}>
                                    <div className="relative w-32 h-32 mx-auto mb-4 group">
                                        {preview ? (
                                            <img 
                                                src={preview} 
                                                className="w-full h-full rounded-full object-cover border-4 border-gray-200 shadow-sm" 
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-4xl text-indigo-600 font-bold border-4 border-white shadow-sm">
                                                {auth.user.name.charAt(0)}
                                            </div>
                                        )}
                                        
                                        {/* Overlay Hover buat ganti foto */}
                                        <label htmlFor="avatarInput" className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white font-semibold">
                                            Ubah
                                        </label>
                                        <input 
                                            id="avatarInput" 
                                            type="file" 
                                            className="hidden" 
                                            onChange={handleAvatarChange}
                                            accept="image/*"
                                        />
                                    </div>

                                    {/* Tombol Simpan (Muncul cuma kalau ada perubahan) */}
                                    {data.avatar && (
                                        <button 
                                            disabled={processing}
                                            type="submit"
                                            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 transition w-full"
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan Foto Baru'}
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* 2. Koneksi Google (Kode Kemarin) */}
                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <header>
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Akun Sosial</h2>
                                </header>
                                <div className="mt-4">
                                    {auth.user.google_id ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center text-green-600 dark:text-green-400 font-semibold text-sm bg-green-50 p-2 rounded">
                                                ✅ Terhubung Google
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if(confirm('Yakin putuskan koneksi?')) disconnectForm.delete(route('auth.google.disconnect'));
                                                }}
                                                className="text-sm text-red-500 hover:text-red-700 underline text-left"
                                            >
                                                Putuskan Koneksi
                                            </button>
                                        </div>
                                    ) : (
                                        <a
                                            href={route('auth.google')}
                                            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase shadow-sm hover:bg-gray-50 transition"
                                        >
                                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 mr-2" />
                                            Hubungkan Google
                                        </a>
                                    )}
                                    {disconnectForm.errors.error && <p className="text-red-500 text-xs mt-2">{disconnectForm.errors.error}</p>}
                                </div>
                            </div>

                        </div>

                        {/* KOLOM 2 & 3: EDIT INFO & PASSWORD */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>

                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>
                        </div>

                    </div>

                    {/* --- BAGIAN BAWAH: ZONA BAHAYA --- */}
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg border-l-4 border-red-500">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}