<?php

namespace App\Services;

use App\Models\Pesanan;
use App\Models\Pengaturan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    public static function isEnabled(): bool
    {
        return Pengaturan::get('midtrans_enabled', '0') === '1';
    }

    public static function isProduction(): bool
    {
        return Pengaturan::get('midtrans_is_production', '0') === '1';
    }

    public static function getServerKey(): string
    {
        return trim((string) Pengaturan::get('midtrans_server_key', env('MIDTRANS_SERVER_KEY', '')));
    }

    public static function getClientKey(): string
    {
        return trim((string) Pengaturan::get('midtrans_client_key', env('MIDTRANS_CLIENT_KEY', '')));
    }

    public static function getMerchantId(): string
    {
        return trim((string) Pengaturan::get('midtrans_merchant_id', env('MIDTRANS_MERCHANT_ID', '')));
    }

    public static function getSnapApiUrl(): string
    {
        return static::isProduction()
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    public static function getSnapJsUrl(): string
    {
        return static::isProduction()
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
    }

    /**
     * Membuat Snap Token untuk pesanan tertentu
     */
    public static function createSnapToken(Pesanan $pesanan): array
    {
        $serverKey = static::getServerKey();
        if (empty($serverKey)) {
            return [
                'success' => false,
                'message' => 'Server Key Midtrans belum dikonfigurasi di menu Pengaturan.',
            ];
        }

        $grossAmount = (int) round((float) $pesanan->total);
        if ($grossAmount <= 0) {
            return [
                'success' => false,
                'message' => 'Total pesanan harus lebih besar dari 0.',
            ];
        }

        // Siapkan item details (maksimal 50 karakter per item name sesuai regulasi Midtrans)
        $itemDetails = [];
        if ($pesanan->relationLoaded('details') && $pesanan->details->isNotEmpty()) {
            foreach ($pesanan->details as $d) {
                $itemDetails[] = [
                    'id' => (string) $d->id,
                    'price' => (int) round((float) $d->harga_satuan),
                    'quantity' => (int) $d->jumlah,
                    'name' => mb_substr((string) ($d->nama_produk . ($d->nama_varian ? " ({$d->nama_varian})" : '')), 0, 50),
                ];
            }

            // Tambahkan diskon sebagai item negatif jika ada
            if ($pesanan->diskon > 0) {
                $itemDetails[] = [
                    'id' => 'DISC',
                    'price' => -((int) round((float) $pesanan->diskon)),
                    'quantity' => 1,
                    'name' => 'Diskon Pesanan',
                ];
            }

            // Tambahkan pajak jika ada
            if ($pesanan->pajak_nominal > 0) {
                $itemDetails[] = [
                    'id' => 'TAX',
                    'price' => (int) round((float) $pesanan->pajak_nominal),
                    'quantity' => 1,
                    'name' => 'Pajak PB1',
                ];
            }

            // Verifikasi jumlah total item details harus sama persis dengan gross_amount
            $itemsSum = array_reduce($itemDetails, function ($carry, $item) {
                return $carry + ($item['price'] * $item['quantity']);
            }, 0);

            // Jika ada selisih pembulatan, sederhanakan menjadi 1 item transaksi agar tidak ditolak Midtrans
            if ($itemsSum !== $grossAmount) {
                $itemDetails = [[
                    'id' => (string) $pesanan->nomor_pesanan,
                    'price' => $grossAmount,
                    'quantity' => 1,
                    'name' => 'Pesanan Jelang Hari #' . substr($pesanan->nomor_pesanan, -6),
                ]];
            }
        } else {
            $itemDetails = [[
                'id' => (string) $pesanan->nomor_pesanan,
                'price' => $grossAmount,
                'quantity' => 1,
                'name' => 'Pesanan Jelang Hari #' . substr($pesanan->nomor_pesanan, -6),
            ]];
        }

        $method = strtolower($pesanan->metode_pembayaran ?? '');
        $allEnabled = [
            'gopay',
            'other_qris',
            'shopeepay',
            'bca_va',
            'bni_va',
            'bri_va',
            'echannel',
            'permata_va',
            'cimb_va',
            'other_va',
        ];

        // Tentukan metode pembayaran Midtrans secara presisi berdasarkan pilihan customer
        if (str_contains($method, 'gopay')) {
            $enabledPayments = ['gopay', 'other_qris'];
        } elseif (str_contains($method, 'shopee')) {
            $enabledPayments = ['shopeepay', 'other_qris'];
        } elseif (str_contains($method, 'bca')) {
            $enabledPayments = ['bca_va', 'other_qris'];
        } elseif (str_contains($method, 'bni')) {
            $enabledPayments = ['bni_va', 'other_qris'];
        } elseif (str_contains($method, 'bri')) {
            $enabledPayments = ['bri_va', 'other_qris'];
        } elseif (str_contains($method, 'mandiri')) {
            $enabledPayments = ['echannel', 'other_qris'];
        } elseif (str_contains($method, 'jago') || str_contains($method, 'permata')) {
            $enabledPayments = ['permata_va', 'other_va', 'other_qris'];
        } elseif (str_contains($method, 'cimb')) {
            $enabledPayments = ['cimb_va', 'other_qris'];
        } elseif (str_contains($method, 'qris')) {
            $enabledPayments = ['other_qris', 'gopay', 'shopeepay'];
        } else {
            $enabledPayments = $allEnabled;
        }

        $payload = [
            'transaction_details' => [
                'order_id' => $pesanan->nomor_pesanan . '-' . time(), // Unik per percobaan bayar
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => mb_substr($pesanan->nama_pelanggan ?: 'Pelanggan Jelang Hari', 0, 50),
                'phone' => preg_replace('/[^0-9]/', '', $pesanan->telepon_pelanggan ?: '08123456789'),
            ],
            'item_details' => $itemDetails,
            'enabled_payments' => $enabledPayments,
            'expiry' => [
                'unit' => 'minute',
                'duration' => 15, // 15 menit hitung mundur
            ],
        ];

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->timeout(15)
                ->post(static::getSnapApiUrl(), $payload);

            if ($response->successful()) {
                $resData = $response->json();
                $token = $resData['token'] ?? null;
                $redirectUrl = $resData['redirect_url'] ?? null;

                if ($token) {
                    $pesanan->update([
                        'referensi_pembayaran' => $token,
                    ]);

                    return [
                        'success' => true,
                        'snap_token' => $token,
                        'redirect_url' => $redirectUrl,
                        'client_key' => static::getClientKey(),
                        'is_production' => static::isProduction(),
                    ];
                }
            }

            Log::error('Midtrans Snap Error: ' . $response->body());
            return [
                'success' => false,
                'message' => 'Gagal membuat tagihan Midtrans: ' . ($response->json('error_messages')[0] ?? $response->body()),
            ];
        } catch (\Throwable $e) {
            Log::error('Midtrans Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Koneksi ke Midtrans bermasalah: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Verifikasi keaslian webhook signature dari Midtrans
     */
    public static function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $serverKey = static::getServerKey();
        if (empty($serverKey)) {
            return false;
        }

        $expected = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        return hash_equals($expected, $signatureKey);
    }
}
