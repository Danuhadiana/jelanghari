<?php

namespace App\Services;

use App\Models\Pengaturan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    /**
     * Dapatkan API Key Gemini dari DB Pengaturan atau file .env
     */
    public function getApiKey(): ?string
    {
        $dbKey = Pengaturan::get('gemini_api_key');
        if (!empty($dbKey)) {
            return trim($dbKey);
        }

        $envKey = config('services.gemini.api_key') ?: env('GEMINI_API_KEY');
        return !empty($envKey) ? trim($envKey) : null;
    }

    /**
     * Dapatkan Model Gemini
     */
    public function getModel(): string
    {
        $dbModel = Pengaturan::get('gemini_model');
        if (!empty($dbModel)) {
            return trim($dbModel);
        }

        return config('services.gemini.model') ?: env('GEMINI_MODEL', 'gemini-flash-lite-latest');
    }

    /**
     * Kirim prompt ke Google Gemini API
     */
    public function ask(string $prompt, array $context): ?string
    {
        $apiKey = $this->getApiKey();
        if (empty($apiKey)) {
            return null;
        }

        $preferredModel = $this->getModel();
        $modelsToTry = array_unique([$preferredModel, 'gemini-flash-lite-latest', 'gemini-flash-latest']);

        $systemPrompt = $this->buildSystemInstruction($context);

        $payload = [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemPrompt]
                ]
            ],
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.4,
                'maxOutputTokens' => 800,
            ]
        ];

        foreach ($modelsToTry as $model) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

            try {
                $response = Http::timeout(8)->post($url, $payload);

                if ($response->successful()) {
                    $data = $response->json();
                    $replyText = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                    if (!empty($replyText)) {
                        return $this->stripEmojis($replyText);
                    }
                } else {
                    Log::warning("Gemini API Error with model {$model}: " . $response->status() . ' - ' . substr($response->body(), 0, 150));
                }
            } catch (\Throwable $e) {
                Log::warning("Gemini exception with model {$model}: " . $e->getMessage());
            }
        }

        return null;
    }

    /**
     * Susun instruksi sistem dengan konteks toko terkini
     */
    private function buildSystemInstruction(array $context): string
    {
        $omset = $context['salesToday'] ?? 'Rp 0';
        $transaksi = $context['countToday'] ?? 0;
        $aov = $context['aov'] ?? 'Rp 0';
        $shift = $context['shiftStatus'] ?? 'Belum ada shift';
        $kds = $context['kdsPending'] ?? 0;
        $meja = $context['mejaInfo'] ?? '-';
        $stok = $context['lowMaterials'] ?? 'Aman';
        $top = $context['topLeader'] ?? '-';
        $vouchers = $context['vouchers'] ?? 'Tidak ada';
        $suppliers = $context['suppliers'] ?? '-';

        return "Anda adalah 'Jelang Hari Copilot', asisten AI operasional dan analis bisnis kafe cerdas untuk sistem POS & Coffee Shop 'Jelang Hari'.

PERATURAN MUTLAK:
1. DILARANG KERAS MENGGUNAKAN EMOJI APAPUN dalam seluruh respon Anda. Gunakan bullet point tanda hubung (-) atau bulat (•) dan penomoran standar.
2. Jawab to the point, padat, rapi, terstruktur, ramah dan profesional. Hindari basa-basi panjang.
3. Anda memiliki akses ke data operasional real-time toko saat ini:
   - Omset Penjualan Hari Ini: {$omset} ({$transaksi} transaksi, AOV {$aov})
   - Status Shift Kasir: {$shift}
   - Antrean Pesanan KDS (Dapur & Bar): {$kds} tiket aktif
   - Okupansi Meja: {$meja}
   - Status Bahan Baku Kritis: {$stok}
   - Produk Terlaris: {$top}
   - Voucher / Diskon Aktif: {$vouchers}
   - Supplier Terdaftar: {$suppliers}
4. Jika ditanya istilah bisnis kafe (HPP, AOV, BOM, Void, Stock Opname, Petty Cash, Laba Kotor, SLA), jelaskan definisi praktisnya dan hubungkan dengan sistem Jelang Hari.
5. Jika ditanya tutorial sistem (kasir POS, KDS dapur, absensi staf, resep BOM, kelola pengguna/PIN), berikan langkah-langkah praktis dan akurat.
6. Jika ada pelanggan komplain, gunakan metode L.A.S.T (Listen, Apologize, Solve, Thank).
7. Jika ditanya hal umum atau curhat operasional kafe, jawab dengan bijak, solutif, dan empatik.";
    }

    /**
     * Bersihkan karakter emoji
     */
    private function stripEmojis(string $text): string
    {
        $regex = '/[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{1F1E0}-\x{1F1FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{1F900}-\x{1F9FF}\x{1FA70}-\x{1FAFF}\x{200D}\x{FE0F}]/u';
        return preg_replace($regex, '', $text);
    }
}
