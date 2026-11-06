Set-NetConnectionProfile -Name "AKSARA_ALGI" -NetworkCategory Private -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "Laravel Dev 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
netsh advfirewall firewall add rule name="Laravel Dev 8000" dir=in action=allow protocol=TCP localport=8000
