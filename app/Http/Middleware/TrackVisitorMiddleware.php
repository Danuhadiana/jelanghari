<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\VisitorLog;

class TrackVisitorMiddleware
{
    /**
     * Handle an incoming request and silently track page visits for developer analysis.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Hanya catat request HTML / Page Navigation utama (abaikan aset statis & ajax internal)
        try {
            $path = $request->path();
            
            // Skip rute statis, asset, icon, atau log viewer itu sendiri
            $ignoredPatterns = [
                'build/*',
                'images/*',
                'favicon.ico',
                'robots.txt',
                '_debugbar*',
                'api/check*',
                'dev-telemetry*',
                'dev-monitor*',
            ];

            foreach ($ignoredPatterns as $pattern) {
                if ($request->is($pattern)) {
                    return $response;
                }
            }

            // Hanya log permintaan GET atau POST form utama
            if (in_array($request->method(), ['GET', 'POST'])) {
                $userAgent = $request->userAgent() ?? '';
                $deviceInfo = $this->parseDeviceInfo($userAgent);
                
                $user = auth()->user();
                $userName = $user ? ($user->name ?? $user->nama ?? 'User #' . $user->id) : 'Tamu / Klien (Belum Login)';
                $userRole = $user ? ($user->role ?? $user->role_slug ?? 'Member') : 'Guest';

                // Ambil client IP yang sebenarnya (termasuk di balik Vercel Reverse Proxy)
                $ip = $request->header('x-forwarded-for') 
                    ? trim(explode(',', $request->header('x-forwarded-for'))[0])
                    : $request->ip();

                // Simpan log kunjungan secara silent
                $log = VisitorLog::create([
                    'ip_address' => $ip,
                    'url' => '/' . ltrim($path, '/'),
                    'method' => $request->method(),
                    'user_id' => $user?->id,
                    'user_name' => $userName,
                    'user_role' => $userRole,
                    'device_info' => $deviceInfo,
                    'user_agent' => substr($userAgent, 0, 500),
                    'referrer' => substr($request->headers->get('referer') ?? '', 0, 255),
                ]);

                // Kirim notifikasi bot WhatsApp secara senyap (Solusi 2)
                app(\App\Services\WhatsAppAlertService::class)->sendVisitorAlert($log);
            }
        } catch (\Throwable $e) {
            // Silence exception so user experience is NEVER affected
        }

        return $response;
    }

    /**
     * Deteksi nama perangkat sederhana dari User-Agent
     */
    private function parseDeviceInfo(string $ua): string
    {
        if (empty($ua)) return 'Unknown Device';

        $os = 'Unknown OS';
        if (stripos($ua, 'Android') !== false) {
            $os = 'Android';
            if (stripos($ua, 'RMX') !== false || stripos($ua, 'Realme') !== false) {
                $os = 'Realme Phone (Android)';
            } elseif (stripos($ua, 'Samsung') !== false || stripos($ua, 'SM-') !== false) {
                $os = 'Samsung (Android)';
            } elseif (stripos($ua, 'Xiaomi') !== false || stripos($ua, 'Redmi') !== false) {
                $os = 'Xiaomi/Redmi (Android)';
            } elseif (stripos($ua, 'OPPO') !== false || stripos($ua, 'CPH') !== false) {
                $os = 'Oppo (Android)';
            } elseif (stripos($ua, 'vivo') !== false || stripos($ua, 'V2') !== false) {
                $os = 'Vivo (Android)';
            }
        } elseif (stripos($ua, 'iPhone') !== false) {
            $os = 'Apple iPhone (iOS)';
        } elseif (stripos($ua, 'iPad') !== false) {
            $os = 'Apple iPad';
        } elseif (stripos($ua, 'Windows NT 10.0') !== false) {
            $os = 'Windows 10/11 PC';
        } elseif (stripos($ua, 'Macintosh') !== false) {
            $os = 'MacBook / MacOS';
        } elseif (stripos($ua, 'Linux') !== false) {
            $os = 'Linux Device';
        }

        $browser = 'Browser';
        if (stripos($ua, 'Edg') !== false) {
            $browser = 'Microsoft Edge';
        } elseif (stripos($ua, 'Chrome') !== false) {
            $browser = 'Google Chrome';
        } elseif (stripos($ua, 'Safari') !== false) {
            $browser = 'Apple Safari';
        } elseif (stripos($ua, 'Firefox') !== false) {
            $browser = 'Mozilla Firefox';
        }

        return "{$os} • {$browser}";
    }
}

