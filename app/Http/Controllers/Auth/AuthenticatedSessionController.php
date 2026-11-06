<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();
        $request->session()->forget('url.intended');

        $user = Auth::user();

        // Masuk ke dashboard/laman sendiri untuk masing-masing peran pengguna
        $role = strtolower(trim((string)($user->role_slug ?? $user->role ?? 'owner')));

        // Owner & Manager WAJIB selalu masuk ke Dashboard Utama Toko (/dashboard)
        if (in_array($role, ['owner', 'manager'])) {
            return redirect()->route('dashboard');
        }

        if ($role === 'pelanggan') {
            return redirect()->route('user.dashboard');
        }

        if (in_array($role, ['barista', 'kitchen', 'dapur'])) {
            return redirect()->route('kds.index');
        }

        if ($role === 'kasir') {
            return redirect()->route('kasir.index');
        }

        return redirect()->route('dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
