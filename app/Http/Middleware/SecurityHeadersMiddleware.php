<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request and enforce enterprise-grade security headers.
     * Hardened against automated pen-testing tools (Kali Linux, Nikto, Burp Suite, Nmap).
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Block Reconnaissance & Sensitive File Probing (Nikto, Dirb, Nuclei, Gobuster)
        $path = strtolower($request->path());
        $blockedPatterns = [
            '.env',
            '.git',
            '.svn',
            'composer.json',
            'composer.lock',
            'package.json',
            'phpunit.xml',
            '.sql',
            'database.sqlite',
            'phpinfo',
            'id_rsa',
            'wp-admin',
            'wp-login',
        ];

        foreach ($blockedPatterns as $pattern) {
            if (str_contains($path, $pattern)) {
                abort(403, 'Access Denied: Probing of protected resources is strictly prohibited.');
            }
        }

        // 2. Strip Server Fingerprints (prevent banner grabbing)
        if (function_exists('header_remove')) {
            header_remove('X-Powered-By');
            header_remove('Server');
        }

        /** @var Response $response */
        $response = $next($request);

        // 3. Attach Military-Grade Defensive Headers (OWASP Top 10 Compliance)
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN'); // Anti-Clickjacking
        $response->headers->set('X-Content-Type-Options', 'nosniff'); // Anti-MIME Sniffing
        $response->headers->set('X-XSS-Protection', '1; mode=block'); // Legacy XSS Filter
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin'); // Privacy / Anti-Leakage
        $response->headers->set('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=(), payment=(self)'); // Restrict Hardware APIs

        // Content Security Policy (Allows required Vite, Inertia, Midtrans, Google Fonts, PWA)
        $csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob: https://images.unsplash.com",
            "connect-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com ws: wss:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
        ];
        $response->headers->set('Content-Security-Policy', implode('; ', $csp));

        // Mask PHP version in Response
        $response->headers->remove('X-Powered-By');

        return $response;
    }
}
