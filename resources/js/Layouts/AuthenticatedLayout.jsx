import { useState, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    useEffect(() => {
        // Minta izin notifikasi pas awal buka
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        // Fungsi pengecek ke Database (Backend)
        const checkServerForDeadline = async () => {
            try {
                const response = await fetch('/notifications/check');
                const data = await response.json();

                if (data.alert) {
                    // 1. Bunyikan Suara
                    playNotificationSound();

                    // 2. Tampilkan Popup Browser dengan pesan dari server
                    if (Notification.permission === "granted") {
                        new Notification("⚠️ Pengingat Tugas", {
                            body: data.message, // <--- Ini pesan dinamis (1 jam/30 menit/dll)
                            icon: '/favicon.ico' 
                        });
                    }
                }
            } catch (error) {
                console.error("Gagal cek notifikasi:", error);
            }
        };

        // 1. Cek sekali pas halaman baru dimuat
        checkServerForDeadline();

        // 2. Pasang Timer: Cek ulang setiap 1 Menit (60.000 ms)
        const interval = setInterval(() => {
            checkServerForDeadline();
        }, 60000); 

        return () => clearInterval(interval);
    }, []);

    const playNotificationSound = () => {
        const audio = new Audio('/audio/notification.mp3');
        audio.play().catch(e => console.log("Gagal putar audio (perlu interaksi user dulu):", e));
        
        // Munculin Notif Popup Browser juga
        if (Notification.permission === "granted") {
            new Notification("⏰ Waktunya Cek Tugas!", {
                body: "Ada tugas yang deadline sebentar lagi.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex justify-between h-16">
                        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none">
                            {/* Judul Web */}
                            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase pointer-events-auto">
                                STUDYPLAN
                            </h1>
                        </div>
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('tasks.index')} active={route().current('tasks.index')}>
                                    Tasks
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {/* LOGIC FOTO NAVBAR: Kalau ada foto, tampilkan. Kalau gak ada, pakai Inisial */}
                                                {user.avatar ? (
                                                    <img 
                                                        src={`/storage/${user.avatar}`} 
                                                        className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200"
                                                        alt="Avatar"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                )}

                                                {user.name}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-500 dark:focus:text-gray-400 transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800 dark:text-gray-200">{user.name}</div>
                            <div className="font-medium text-sm text-gray-500">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-gray-800 shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
