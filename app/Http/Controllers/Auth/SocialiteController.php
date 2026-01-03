<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;


class SocialiteController extends Controller
{
    // 1. Lempar user ke Google
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    // 2. Tangkap balikan dari Google
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Skenario 1: User SUDAH Login (Niatnya mau Sinkronisasi/Link Akun)
            if (Auth::check()) {
                $currentUser = User::find(Auth::id());

                // Cek: Apakah akun Google ini udah dipake sama user LAIN?
                $existingUser = User::where('google_id', $googleUser->getId())
                    ->where('id', '!=', $currentUser->id)
                    ->first();

                if ($existingUser) {
                    return redirect()->route('profile.edit')
                        ->with('error', 'Akun Google ini sudah terhubung ke user lain!');
                }

                // Kalau aman, update data user yang lagi login
                $currentUser->update([
                    'google_id' => $googleUser->getId(),
                    // Opsional: update avatar juga kalo mau
                ]);

                return redirect()->route('profile.edit')
                    ->with('status', 'Akun Google berhasil dihubungkan!');
            }

            // Skenario 2: User BELUM Login (Niatnya mau Login/Register)
            else {
                // Cari user berdasarkan google_id ATAU email
                $user = User::where('google_id', $googleUser->getId())
                    ->orWhere('email', $googleUser->getEmail())
                    ->first();

                if ($user) {
                    // Kalau user ada tapi belum punya google_id (misal dulu daftar pake email biasa)
                    if (!$user->google_id) {
                        $user->update(['google_id' => $googleUser->getId()]);
                    }
                    Auth::login($user);
                } else {
                    // User bener-bener baru
                    $newUser = User::create([
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'password' => null, // Password kosong karena login via Google
                    ]);
                    Auth::login($newUser);
                }

                return to_route('dashboard');
            }
        } catch (\Exception $e) {
            // Redirect sesuai kondisi login/belum
            if (Auth::check()) {
                return redirect()->route('profile.edit')->with('error', 'Gagal menghubungkan akun.');
            }
            return redirect()->route('login')->with('error', 'Gagal login Google.');
        }
    }

    public function disconnect()
    {
        $user = User::find(Auth::id());

        // CEK KEAMANAN: Jangan bolehin putus kalau gak punya password
        if (is_null($user->password)) {
            return redirect()->route('profile.edit')
                ->with('error', 'Kamu harus set password dulu sebelum memutuskan koneksi Google!');
        }

        // Hapus google_id (Set jadi NULL)
        $user->update(['google_id' => null]);

        return redirect()->route('profile.edit')
            ->with('status', 'Koneksi Google berhasil diputuskan.');
    }
}
