<?php

namespace App\Services;

use App\Models\Pengaturan;
use App\Models\VisitorLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramAlertService
{
    /**
     * Dapatkan Bot Token yang tersimpan di DB atau environment.
     */
    public function getBotToken(): ?string
    {
        $token = Pengaturan::get('telegram_bot_token');
        if (empty($token)) {
            $token = config('services.telegram.bot_token') ?? env('TELEGRAM_BOT_TOKEN');
        }
        return $token ? trim($token) : null;
    }

    /**
     * Dapatkan Chat ID penerima log developer.
     */
    public function getChatId(): ?string
    {
        $chatId = Pengaturan::get('telegram_chat_id');
        if (empty($chatId)) {
            $chatId = config('services.telegram.chat_id') ?? env('TELEGRAM_CHAT_ID');
        }
        return $chatId ? trim($chatId) : null;
    }

    /**
     * Periksa apakah konfigurasi bot sudah lengkap.
     */
    public function isConfigured(): bool
    {
        return !empty($this->getBotToken()) && !empty($this->getChatId());
    }

    /**
     * Simpan kredensial Telegram ke tabel pengaturan.
     */
    public function saveSettings(?string $botToken, ?string $chatId): void
    {
        Pengaturan::set('telegram_bot_token', $botToken ?? '', 'telemetry', 'string');
        Pengaturan::set('telegram_chat_id', $chatId ?? '', 'telemetry', 'string');
    }

    /**
     * Kirim notifikasi kunjungan pengunjung ke Telegram secara senyap.
     * Menggunakan anti-spam throttling agar tidak membanjiri Telegram pengembang.
     */
    public function sendVisitorAlert(VisitorLog $log): bool
    {
        try {
            $token = $this->getBotToken();
            $chatId = $this->getChatId();

            if (empty($token) || empty($chatId)) {
                return false;
            }

            // Anti-Spam: batas 1 notifikasi per 3 menit per IP address
            $throttleKey = 'tg_alert_throttle_' . md5($log->ip_address ?? 'unknown');
            if (Cache::has($throttleKey)) {
                return false;
            }

            // Set throttle 3 menit
            Cache::put($throttleKey, true, now()->addMinutes(3));

            $waktu = $log->created_at ? $log->created_at->timezone('Asia/Jakarta')->format('d M Y, H:i:s') . ' WIB' : now()->timezone('Asia/Jakarta')->format('d M Y, H:i:s') . ' WIB';
            $perangkat = $log->device_info ?: 'Tidak Teridentifikasi';
            $halaman = $log->url ?: '/';
            $user = $log->user_name ?: 'Tamu Klien';
            $ip = $log->ip_address ?: '127.0.0.1';

            $message = "🚨 *RADAR KUNJUNGAN WEBSITE*\n\n"
                     . "👤 *Pengguna:* `{$user}`\n"
                     . "📱 *Perangkat:* `{$perangkat}`\n"
                     . "📍 *Halaman:* `{$halaman}`\n"
                     . "🌐 *IP Address:* `{$ip}`\n"
                     . "⏰ *Waktu:* {$waktu}\n\n"
                     . "🔗 [Buka Monitor Internal](https://jelanghari.vercel.app/dev-monitor?key=jelanghari2026)";

            $response = Http::timeout(4)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'Markdown',
                'disable_web_page_preview' => true,
            ]);

            return $response->successful();
        } catch (\Throwable $e) {
            // Senyap agar tidak mengganggu rendering response untuk klien
            Log::debug('TelegramAlertService silent error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Kirim pesan tes langsung untuk verifikasi kredensial Bot & Chat ID.
     */
    public function sendTestMessage(?string $customToken = null, ?string $customChatId = null): array
    {
        $token = $customToken ?: $this->getBotToken();
        $chatId = $customChatId ?: $this->getChatId();

        if (empty($token) || empty($chatId)) {
            return [
                'success' => false,
                'message' => 'Bot Token atau Chat ID masih kosong. Silakan isi terlebih dahulu.',
            ];
        }

        try {
            $waktu = now()->timezone('Asia/Jakarta')->format('d M Y, H:i:s') . ' WIB';
            $text = "✅ *KONEKSI TELEGRAM BOT BERHASIL!*\n\n"
                  . "Sistem radar pelacakan kunjungan senyap Jelang Hari kini telah terhubung ke Telegram ini.\n\n"
                  . "⏰ *Waktu Uji Coba:* {$waktu}\n"
                  . "🤖 *Status:* Aktif & Siap Menerima Notifikasi";

            $response = Http::timeout(5)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'Markdown',
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Pesan uji coba berhasil terkirim ke Telegram Anda!',
                ];
            }

            $errorBody = $response->json();
            $desc = $errorBody['description'] ?? 'Gagal menghubungi Telegram API';

            return [
                'success' => false,
                'message' => 'Telegram menolak permintaan: ' . $desc,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Koneksi ke Telegram gagal / timeout: ' . $e->getMessage(),
            ];
        }
    }
}

