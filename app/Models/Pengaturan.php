<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengaturan extends Model
{
    use HasFactory;

    protected $table = 'pengaturan';

    protected $fillable = [
        'kunci',
        'nilai',
        'kategori',
        'tipe',
        'deskripsi',
    ];

    public static function get(string $key, $default = null)
    {
        $setting = static::where('kunci', $key)->first();
        if (!$setting) {
            return $default;
        }

        return match ($setting->tipe) {
            'number' => is_numeric($setting->nilai) ? (float) $setting->nilai : $default,
            'boolean' => filter_var($setting->nilai, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($setting->nilai, true) ?? $default,
            default => $setting->nilai,
        };
    }

    public static function set(string $key, $value, string $kategori = 'umum', string $tipe = 'string'): void
    {
        $valStr = is_array($value) ? json_encode($value) : (string) $value;
        static::updateOrCreate(
            ['kunci' => $key],
            ['nilai' => $valStr, 'kategori' => $kategori, 'tipe' => $tipe]
        );
    }

    /**
     * Cek status operasional toko (otomatis jam buka/tutup atau override manual)
     */
    public static function isStoreOpen(): array
    {
        $statusOverride = (string) static::get('status_operasional_toko', 'otomatis'); // 'otomatis' | 'buka' | 'tutup'
        $jamBuka = (string) static::get('jam_buka', '08:00');
        $jamTutup = (string) static::get('jam_tutup', '23:00');
        $pesanTutup = (string) static::get('pesan_toko_tutup', "Mohon maaf, Jelang Hari sedang tutup dan belum menerima pesanan online. Kami buka setiap hari pukul {$jamBuka} – {$jamTutup} WIB.");

        if ($statusOverride === 'buka') {
            return [
                'is_open' => true,
                'jam_buka' => $jamBuka,
                'jam_tutup' => $jamTutup,
                'status_mode' => 'buka',
                'pesan' => 'Toko Sedang Buka',
            ];
        }

        if ($statusOverride === 'tutup') {
            return [
                'is_open' => false,
                'jam_buka' => $jamBuka,
                'jam_tutup' => $jamTutup,
                'status_mode' => 'tutup',
                'pesan' => $pesanTutup,
            ];
        }

        // Mode Otomatis (Mengikuti jam buka & tutup WIB)
        $now = now()->setTimezone('Asia/Jakarta');
        $currentTime = $now->format('H:i');

        $isOpen = false;
        if ($jamBuka <= $jamTutup) {
            $isOpen = ($currentTime >= $jamBuka && $currentTime <= $jamTutup);
        } else {
            // Melewati tengah malam (misal buka 16:00 sampai 02:00)
            $isOpen = ($currentTime >= $jamBuka || $currentTime <= $jamTutup);
        }

        return [
            'is_open' => $isOpen,
            'jam_buka' => $jamBuka,
            'jam_tutup' => $jamTutup,
            'status_mode' => 'otomatis',
            'pesan' => $isOpen ? 'Toko Sedang Buka' : $pesanTutup,
        ];
    }
}
