<?php

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
if (file_exists($sourceDb)) {
    if (!file_exists($tmpDb) || filemtime($sourceDb) > filemtime($tmpDb) || filesize($tmpDb) < filesize($sourceDb)) {
        @copy($sourceDb, $tmpDb);
    }
}

// Force serverless environment variables into putenv, $_ENV, and $_SERVER
$serverlessEnv = [
    'VERCEL' => '1',
    'APP_ENV' => 'production',
    'APP_DEBUG' => 'false',
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
