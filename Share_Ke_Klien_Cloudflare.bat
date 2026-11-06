@echo off
title Cloudflare Tunnel - Jelang Hari POS
echo ========================================================
echo Membuka Akses Online Publik (HTTPS) untuk Klien...
echo ========================================================
echo.
echo Pastikan 'php artisan serve' tetap berjalan di terminal lain!
echo.
echo Tunggu beberapa detik, cari baris bertuliskan:
echo   https://xxxx.trycloudflare.com
echo.
echo Salin dan kirimkan link https tersebut ke klien Anda.
echo ========================================================
echo.
npx -y cloudflared tunnel --url http://127.0.0.1:8000
pause
