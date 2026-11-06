@echo off
echo ===================================================
echo Memperbaiki Koneksi Jaringan & Port 8000 untuk HP
echo ===================================================

netsh advfirewall firewall delete rule name="Laravel Dev 8000" >nul 2>&1
netsh advfirewall firewall add rule name="Laravel Dev 8000" dir=in action=allow protocol=TCP localport=8000

powershell -Command "Set-NetConnectionProfile -Name 'AKSARA_ALGI' -NetworkCategory Private -ErrorAction SilentlyContinue"

echo.
echo SUKSES! Port 8000 sudah dibuka dan Wi-Fi diset ke Private.
echo Silakan buka di HP: http://192.168.1.6:8000
echo.
pause
