<?php

// Ensure serverless temporary storage is ready for Vercel
$storagePath = '/tmp/storage';
if (!is_dir($storagePath)) {
    @mkdir($storagePath, 0755, true);
    @mkdir($storagePath . '/framework', 0755, true);
    @mkdir($storagePath . '/framework/views', 0755, true);
    @mkdir($storagePath . '/framework/sessions', 0755, true);
    @mkdir($storagePath . '/framework/cache', 0755, true);
    @mkdir($storagePath . '/framework/cache/data', 0755, true);
    @mkdir($storagePath . '/logs', 0755, true);
}

// Fallbacks for serverless execution
if (!getenv('APP_KEY')) {
    putenv('APP_KEY=base64:Dhb0DE+5YoePplvyJHOliLK++W72OxsnuCpjB620hJc=');
}
putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
putenv('SESSION_DRIVER=cookie');
putenv('CACHE_STORE=array');
putenv('LOG_CHANNEL=stderr');

require __DIR__ . '/../public/index.php';
