<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Detect serverless environment (Vercel or non-writable local storage)
$isServerless = isset($_SERVER['VERCEL']) || isset($_ENV['VERCEL']) || getenv('VERCEL') || !is_writable(dirname(__DIR__) . '/storage/framework/views');

if ($isServerless) {
    $storagePath = '/tmp/storage';
    foreach ([
        $storagePath,
        $storagePath . '/framework',
        $storagePath . '/framework/views',
        $storagePath . '/framework/sessions',
        $storagePath . '/framework/cache',
        $storagePath . '/framework/cache/data',
        $storagePath . '/logs',
    ] as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }
}

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global Security Headers (Anti-Clickjacking, Anti-MIME sniffing, CSP, Anti-Reconnaissance)
        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeadersMiddleware::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Strict CSRF Defense: Only exempt verified external payment webhooks
        $middleware->validateCsrfTokens(except: [
            'api/midtrans/notification',
            '/api/midtrans/notification',
        ]);

        $middleware->trustProxies(at: '*');

        // Route Middleware Aliases
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handled cleanly by Laravel & Inertia
    })->create();

if ($isServerless) {
    $app->useStoragePath('/tmp/storage');
}

return $app;
