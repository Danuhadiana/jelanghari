<?php

// Immediate diagnostic handler to show exact error on screen
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

try {
    // Check if vendor exists
    $autoloader = dirname(__DIR__) . '/vendor/autoload.php';
    if (!file_exists($autoloader)) {
        throw new \Exception("Composer dependencies not found: {$autoloader} does not exist.");
    }

    // Prepare serverless temporary storage
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

    // Copy SQLite database to writable /tmp
    $tmpDb = '/tmp/database.sqlite';
    $sourceDb = dirname(__DIR__) . '/database/database.sqlite';
    if (!file_exists($tmpDb) && file_exists($sourceDb)) {
        @copy($sourceDb, $tmpDb);
    }

    // Force serverless environment variables into putenv, $_ENV, and $_SERVER
    $serverlessEnv = [
        'VERCEL' => '1',
        'APP_ENV' => 'production',
        'APP_DEBUG' => 'true',
        'APP_KEY' => 'base64:Dhb0DE+5YoePplvyJHOliLK++W72OxsnuCpjB620hJc=',
        'APP_CONFIG_CACHE' => '/tmp/config.php',
        'APP_EVENTS_CACHE' => '/tmp/events.php',
        'APP_PACKAGES_CACHE' => '/tmp/packages.php',
        'APP_ROUTES_CACHE' => '/tmp/routes.php',
        'APP_SERVICES_CACHE' => '/tmp/services.php',
        'DB_CONNECTION' => 'sqlite',
        'DB_DATABASE' => $tmpDb,
        'VIEW_COMPILED_PATH' => '/tmp/storage/framework/views',
        'SESSION_DRIVER' => 'cookie',
        'CACHE_STORE' => 'array',
        'LOG_CHANNEL' => 'stderr',
    ];

    foreach ($serverlessEnv as $key => $val) {
        putenv("{$key}={$val}");
        $_ENV[$key] = $val;
        $_SERVER[$key] = $val;
    }

    require dirname(__DIR__) . '/public/index.php';
} catch (\Throwable $e) {
    http_response_code(500);
    echo '<div style="font-family:system-ui,sans-serif;padding:32px;background:#09090b;color:#f4f4f5;min-height:100vh;">';
    echo '<h1 style="color:#ef4444;margin-top:0;font-size:24px;">Serverless Diagnostic Output</h1>';
    echo '<div style="background:#18181b;padding:16px;border-radius:8px;border:1px solid #27272a;margin-bottom:20px;">';
    echo '<p style="margin:0 0 8px 0;font-size:16px;"><strong>Error:</strong> <span style="color:#f87171;">' . htmlspecialchars($e->getMessage()) . '</span></p>';
    echo '<p style="margin:0;font-size:13px;color:#a1a1aa;"><strong>File:</strong> ' . htmlspecialchars($e->getFile()) . ' : ' . $e->getLine() . '</p>';
    echo '</div>';
    echo '<h3 style="color:#38bdf8;font-size:16px;">Stack Trace:</h3>';
    echo '<pre style="background:#18181b;padding:16px;border-radius:8px;overflow-x:auto;color:#7dd3fc;font-size:12px;line-height:1.5;border:1px solid #27272a;">' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
    echo '</div>';
    exit;
}
