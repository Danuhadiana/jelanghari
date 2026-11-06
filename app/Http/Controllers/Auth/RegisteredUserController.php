<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'telepon'  => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'telepon'  => $request->telepon,
            'password' => Hash::make($request->password),
            'role'     => 'pelanggan',   // Pendaftaran publik → role pelanggan
        ]);

        // Berikan bonus 25 poin selamat datang untuk member baru
        \App\Models\Customer::firstOrCreate(
            ['email' => $user->email],
            [
                'nama' => $user->name,
                'telepon' => $user->telepon,
                'poin' => 25,
                'total_transaksi' => 0,
                'kunjungan_count' => 0,
            ]
        );

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('user.dashboard')->with('success', 'Selamat datang di Jelang Hari! Akun member Anda berhasil aktif dengan 25 poin perdana.');
    }
}
