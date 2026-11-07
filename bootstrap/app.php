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
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            http_response_code(500);
            header('Content-Type: text/html; charset=utf-8');
            echo '<div style="font-family:system-ui,sans-serif;padding:32px;background:#09090b;color:#f4f4f5;min-height:100vh;">';
            echo '<h1 style="color:#ef4444;margin-top:0;">Root Exception Captured:</h1>';
            echo '<div style="background:#18181b;padding:16px;border-radius:8px;border:1px solid #27272a;margin-bottom:20px;">';
            echo '<p style="margin:0 0 8px 0;font-size:16px;"><strong>Class:</strong> <span style="color:#fbbf24;">' . get_class($e) . '</span></p>';
            echo '<p style="margin:0 0 8px 0;font-size:16px;"><strong>Message:</strong> <span style="color:#f87171;">' . htmlspecialchars($e->getMessage()) . '</span></p>';
            echo '<p style="margin:0;font-size:13px;color:#a1a1aa;"><strong>Location:</strong> ' . htmlspecialchars($e->getFile()) . ' : ' . $e->getLine() . '</p>';
            echo '</div>';
            echo '<h3 style="color:#38bdf8;">Stack Trace:</h3>';
            echo '<pre style="background:#18181b;padding:16px;border-radius:8px;overflow-x:auto;color:#7dd3fc;font-size:12px;line-height:1.5;border:1px solid #27272a;">' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
            echo '</div>';
            exit;
        });
    })->create();

if ($isServerless) {
    $app->useStoragePath('/tmp/storage');
}

return $app;
