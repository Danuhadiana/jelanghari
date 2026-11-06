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
if (!file_exists($tmpDb) && file_exists($sourceDb)) {
    @copy($sourceDb, $tmpDb);
}

// Force env variables into both putenv, $_ENV, and $_SERVER
$serverlessEnv = [
    'VERCEL' => '1',
    'APP_ENV' => 'production',
    'APP_DEBUG' => 'true',
    'APP_KEY' => 'base64:Dhb0DE+5YoePplvyJHOliLK++W72OxsnuCpjB620hJc=',
    'DB_CONNECTION' => 'sqlite',
    'DB_DATABASE' => $tmpDb,
    'VIEW_COMPILED_PATH' => '/tmp/storage/framework/views',
    'SESSION_DRIVER' => 'cookie',
    'CACHE_STORE' => 'array',
    'LOG_CHANNEL' => 'stderr',
];

foreach ($serverlessEnv as $key => $val) {
    if (!getenv($key)) {
        putenv("{$key}={$val}");
    }
    if (!isset($_ENV[$key])) {
        $_ENV[$key] = $val;
    }
    if (!isset($_SERVER[$key])) {
        $_SERVER[$key] = $val;
    }
}

require __DIR__ . '/../public/index.php';
