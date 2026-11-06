<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request and enforce strict Role-Based Access Control (RBAC).
     * Defends against Privilege Escalation & BOLA / IDOR attacks.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            return redirect()->route('login');
        }

        $userRole = strtolower(trim((string)($user->role_slug ?? $user->role ?? '')));
        $allowedRoles = array_map(fn($r) => strtolower(trim($r)), $roles);

        // Owner (Superadmin) always has root access across all modules
        if ($userRole === 'owner') {
            return $next($request);
        }

        if (!in_array($userRole, $allowedRoles, true)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Forbidden',
                    'message' => 'Peran akun Anda (' . ($userRole ?: 'anonymous') . ') tidak memiliki hak akses ke modul ini.'
                ], 403);
            }
            abort(403, 'Akses Terlarang: Anda tidak memiliki wewenang untuk membuka atau memodifikasi modul ini.');
        }

        return $next($request);
    }
}
