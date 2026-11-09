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
     * Dapatkan provider WhatsApp yang dipilih ('callmebot' atau 'fonnte').
     */
    public function getProvider(): string
    {
        return Pengaturan::get('wa_provider', 'callmebot');
    }

    /**
     * Dapatkan nomor WhatsApp tujuan (format 628xxx).
     */
    public function getPhone(): ?string
    {
        $phone = Pengaturan::get('wa_phone') ?: env('WA_PHONE');
        if ($phone) {
            $phone = preg_replace('/[^0-9]/', '', $phone);
            // Normalisasi 08xxx menjadi 628xxx
            if (str_starts_with($phone, '0')) {
                $phone = '62' . substr($phone, 1);
            }
        }
        return $phone ?: null;
    }

    /**
     * Dapatkan API Key / Token.
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
        if (str_starts_with($cleanPhone, '0')) {
            $cleanPhone = '62' . substr($cleanPhone, 1);
        }

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

            $message = "🚨 *RADAR KUNJUNGAN WEBSITE*\n\n"
                     . "👤 *Pengguna:* {$user}\n"
                     . "📱 *Perangkat:* {$perangkat}\n"
                     . "📍 *Halaman:* {$halaman}\n"
                     . "🌐 *IP Address:* {$ip}\n"
                     . "⏰ *Waktu:* {$waktu}\n\n"
                     . "🔗 Monitor: https://jelanghari.vercel.app/dev-monitor?key=jelanghari2026";

            return $this->dispatchMessage($this->getProvider(), $this->getPhone(), $this->getApiKey(), $message);
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
        if ($phone && str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }
        $apiKey = $customApiKey ? trim($customApiKey) : $this->getApiKey();

        if (empty($phone) || empty($apiKey)) {
            return [
                'success' => false,
                'message' => 'Nomor WhatsApp atau API Key masih kosong. Silakan lengkapi terlebih dahulu.',
            ];
        }

        $waktu = now()->timezone('Asia/Jakarta')->format('d M Y, H:i:s') . ' WIB';
        $text = "✅ *KONEKSI WHATSAPP RADAR BERHASIL!*\n\n"
              . "Halo! Sistem pelacakan kunjungan senyap Jelang Hari kini resmi terhubung ke nomor WhatsApp ini.\n\n"
              . "⏰ *Waktu Uji:* {$waktu}\n"
              . "🤖 *Status:* Aktif & Siap Menerima Alert Real-time.";

        try {
            $ok = $this->dispatchMessage($provider, $phone, $apiKey, $text);
            if ($ok) {
                return [
                    'success' => true,
                    'message' => "Pesan tes berhasil dikirim ke nomor WhatsApp {$phone}! Silakan cek pesan masuk di WhatsApp Anda.",
                ];
            }

            return [
                'success' => false,
                'message' => 'Gagal mengirim pesan ke WhatsApp. Pastikan Nomor WA dan API Key sudah benar.',
            ];
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
    private function dispatchMessage(string $provider, string $phone, string $apiKey, string $message): bool
    {
        if ($provider === 'fonnte') {
            // Fonnte API Gateway (Indonesia)
            $response = Http::timeout(5)
                ->withHeaders(['Authorization' => $apiKey])
                ->post('https://api.fonnte.com/send', [
                    'target' => $phone,
                    'message' => $message,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return ($data['status'] ?? false) == true;
            }
            return false;
        }

        // Default: CallMeBot (100% Free Personal WhatsApp API)
        $url = "https://api.callmebot.com/whatsapp.php?phone=" . urlencode($phone) . "&text=" . urlencode($message) . "&apikey=" . urlencode($apiKey);
        $response = Http::timeout(6)->get($url);

        return $response->successful() || stripos($response->body(), 'Message queued') !== false || stripos($response->body(), 'Message sent') !== false;
    }
}
