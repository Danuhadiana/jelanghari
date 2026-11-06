<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title inertia>{{ config('app.name', 'Jelang Hari POS') }}</title>

        <!-- PWA Standalone / Fullscreen Tablet & Mobile App Settings -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#09090b">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Jelang Hari">
        <link rel="apple-touch-icon" href="/images/icon-192.png">

        <script>
            // Register PWA Service Worker
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js', { scope: '/' })
                        .then(function(reg) {
                            console.log('[PWA] Service Worker registered:', reg.scope);
                        })
                        .catch(function(err) {
                            console.warn('[PWA] Service Worker registration failed:', err);
                        });
                });
            }
        </script>

        <!-- Fonts: Plus Jakarta Sans (clean modern sans) + JetBrains Mono -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

        <script>
            (function() {
                try {
                    var theme = localStorage.getItem('jh_theme') || localStorage.getItem('theme');
                    var systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (theme === 'dark' || (!theme && systemPrefersDark)) {
                        document.documentElement.classList.add('dark');
                        document.documentElement.style.colorScheme = 'dark';
                    } else {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.style.colorScheme = 'light';
                    }
                } catch (e) {}
            })();
            window.addEventListener('error', function(e) {
                console.error('GLOBAL JS ERROR:', e);
                var errDiv = document.getElementById('jh-global-error-overlay');
                if (!errDiv) {
                    errDiv = document.createElement('div');
                    errDiv.id = 'jh-global-error-overlay';
                    errDiv.style = 'position:fixed;bottom:20px;left:20px;right:20px;background:#ef4444;color:#fff;padding:16px;border-radius:12px;z-index:999999;font-family:monospace;font-size:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);max-height:40vh;overflow:auto;';
                    if (document.body) { document.body.appendChild(errDiv); } else { document.documentElement.appendChild(errDiv); }
                }
                errDiv.innerHTML = '<strong>Javascript Error:</strong> ' + e.message + '<br><small>' + (e.filename || '') + ':' + (e.lineno || '') + '</small><pre style="margin-top:8px;font-size:10px;white-space:pre-wrap;">' + (e.error && e.error.stack ? e.error.stack : '') + '</pre>';
            });
        </script>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="h-full font-sans antialiased text-jh-black dark:text-zinc-100 bg-jh-stone dark:bg-zinc-950 selection:bg-jh-black selection:text-jh-white transition-colors duration-200">
        @inertia
    </body>
</html>
