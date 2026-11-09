<?php

namespace App\Services;

use App\Models\Pengaturan;
use App\Models\VisitorLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppAlertService
{
    /**
     * Dapatkan provider WhatsApp yang dipilih ('fonnte' atau 'callmebot').
     * Default adalah 'fonnte' karena resmi, stabil di Indonesia & gratis 1000 pesan/bulan.
     */
    public function getProvider(): string
    {
        return Pengaturan::get('wa_provider', 'fonnte');
    }

    /**
     * Dapatkan nomor WhatsApp tujuan.
     */
    public function getPhone(): ?string
    {
        $phone = Pengaturan::get('wa_phone') ?: env('WA_PHONE');
        if ($phone) {
            $phone = preg_replace('/[^0-9]/', '', $phone);
        }
        return $phone ?: null;
    }

    /**
     * Dapatkan API Key / Token Fonnte.
     */
    public function getApiKey(): ?string
    {
        $key = Pengaturan::get('wa_api_key') ?: env('WA_API_KEY');
        return $key ? trim($key) : null;
    }

    /**
     * Periksa apakah konfigurasi WhatsApp sudah terisi lengkap.
     */
    public function isConfigured(): bool
    {
        return !empty($this->getPhone()) && !empty($this->getApiKey());
    }

    /**
     * Simpan konfigurasi WhatsApp ke tabel pengaturan.
     */
    public function saveSettings(string $provider, ?string $phone, ?string $apiKey): void
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone ?? '');

        Pengaturan::set('wa_provider', $provider, 'telemetry', 'string');
        Pengaturan::set('wa_phone', $cleanPhone, 'telemetry', 'string');
        Pengaturan::set('wa_api_key', trim($apiKey ?? ''), 'telemetry', 'string');
    }

    /**
     * Kirim notifikasi kunjungan website ke WhatsApp pengembang secara senyap.
     * Menggunakan anti-spam throttling 3 menit per IP pengunjung.
     */
    public function sendVisitorAlert(VisitorLog $log): bool
    {
        try {
            if (!$this->isConfigured()) {
                return false;
            }

            // Anti-Spam: batas 1 notifikasi per 3 menit per IP address
            $throttleKey = 'wa_alert_throttle_' . md5($log->ip_address ?? 'unknown');
            if (Cache::has($throttleKey)) {
                return false;
            }

            // Set throttle 3 menit
            Cache::put($throttleKey, true, now()->addMinutes(3));

            $waktu = $log->created_at 
                ? $log->created_at->timezone('Asia/Jakarta')->format('d M Y, H:i:s') . ' WIB' 
                : now()->timezone('Asia/Jakarta')->format('d M Y, H:i:s') . ' WIB';
            $perangkat = $log->device_info ?: 'Tidak Teridentifikasi';
            $halaman = $log->url ?: '/';
            $user = $log->user_name ?: 'Tamu Klien';
            $ip = $log->ip_address ?: '127.0.0.1';

            $message = "🚨 *RADAR KUNJUNGAN WEBSITE - JELANG HARI*\n\n"
                     . "👤 *Pengguna:* {$user}\n"
                     . "📱 *Perangkat:* {$perangkat}\n"
                     . "📍 *Halaman:* {$halaman}\n"
                     . "🌐 *IP Address:* {$ip}\n"
                     . "⏰ *Waktu:* {$waktu}\n\n"
                     . "🔗 Monitor: https://jelanghari.vercel.app/dev-monitor?key=jelanghari2026";

            $res = $this->dispatchMessage($this->getProvider(), $this->getPhone(), $this->getApiKey(), $message);
            return $res['success'] ?? false;
        } catch (\Throwable $e) {
            Log::debug('WhatsAppAlertService silent error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Kirim pesan uji coba ke WhatsApp.
     */
    public function sendTestMessage(?string $customProvider = null, ?string $customPhone = null, ?string $customApiKey = null): array
    {
        $provider = $customProvider ?: $this->getProvider();
        $phone = $customPhone ? preg_replace('/[^0-9]/', '', $customPhone) : $this->getPhone();
        $apiKey = $customApiKey ? trim($customApiKey) : $this->getApiKey();

        if (empty($phone) || empty($apiKey)) {
            return [
                'success' => false,
                'message' => 'Nomor WhatsApp atau Token masih kosong. Silakan lengkapi terlebih dahulu.',
            ];
        }

        $waktu = now()->timezone('Asia/Jakarta')->format('d M Y, H:i:s') . ' WIB';
        $text = "✅ *KONEKSI WHATSAPP RADAR JELANG HARI BERHASIL!*\n\n"
              . "Halo! Sistem pelacakan senyap kini resmi terhubung ke WhatsApp ini.\n\n"
              . "⏰ *Waktu:* {$waktu}\n"
              . "🤖 *Status:* Aktif & Siap Menerima Notifikasi Kunjungan Klien.";

        try {
            return $this->dispatchMessage($provider, $phone, $apiKey, $text);
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan koneksi WhatsApp: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Kirim pesan melalui provider yang didukung.
     */
    private function dispatchMessage(string $provider, string $phone, string $apiKey, string $message): array
    {
        if ($provider === 'callmebot') {
            // CallMeBot (Alternative personal bot)
            $cleanPhone = $phone;
            if (str_starts_with($cleanPhone, '0')) {
                $cleanPhone = '62' . substr($cleanPhone, 1);
            }
            $url = "https://api.callmebot.com/whatsapp.php?phone=" . urlencode($cleanPhone) . "&text=" . urlencode($message) . "&apikey=" . urlencode($apiKey);
            $response = Http::timeout(6)->get($url);
            $body = $response->body();
            $success = $response->successful() || stripos($body, 'Message queued') !== false || stripos($body, 'Message sent') !== false;

            return [
                'success' => $success,
                'message' => $success 
                    ? "Pesan tes berhasil dikirim ke nomor WhatsApp {$cleanPhone}!" 
                    : "CallMeBot gagal merespons: " . substr(strip_tags($body), 0, 120),
            ];
        }

        // Provider Rekomendasi Utama: Fonnte (Gateway WhatsApp Indonesia)
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        $response = Http::timeout(7)
            ->withHeaders(['Authorization' => $apiKey])
            ->post('https://api.fonnte.com/send', [
                'target' => $cleanPhone,
                'message' => $message,
                'countryCode' => '62',
            ]);

        if ($response->successful()) {
            $data = $response->json();
            if (($data['status'] ?? false) === true) {
                return [
                    'success' => true,
                    'message' => "Pesan tes berhasil terkirim ke WhatsApp {$cleanPhone} via Fonnte!",
                ];
            }
            $reason = $data['reason'] ?? 'Token salah atau perangkat WhatsApp belum terkoneksi di Fonnte.';
            return [
                'success' => false,
                'message' => 'Fonnte menolak: ' . $reason,
            ];
        }

        return [
            'success' => false,
            'message' => 'Gagal menghubungi server Fonnte (HTTP ' . $response->status() . '). Pastikan Token Fonnte benar.',
        ];
    }
}
