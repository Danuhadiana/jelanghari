<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pesanan extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_pesanan',
        'user_id',
        'meja_id',
        'nama_pelanggan',
        'telepon_pelanggan',
        'tipe_pesanan',
        'subtotal',
        'diskon',
        'voucher_kode',
        'pajak_persen',
        'pajak_nominal',
        'service_persen',
        'service_nominal',
        'pembulatan',
        'total',
        'bayar',
        'kembalian',
        'metode_pembayaran',
        'referensi_pembayaran',
        'status_pembayaran',
        'status_pesanan',
        'catatan',
        'waktu_bayar',
        'waktu_selesai',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'float',
            'diskon' => 'float',
            'pajak_persen' => 'float',
            'pajak_nominal' => 'float',
            'service_persen' => 'float',
            'service_nominal' => 'float',
            'pembulatan' => 'float',
            'total' => 'float',
            'bayar' => 'float',
            'kembalian' => 'float',
            'waktu_bayar' => 'datetime',
            'waktu_selesai' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function meja()
    {
        return $this->belongsTo(Meja::class);
    }

    public function details()
    {
        return $this->hasMany(DetailPesanan::class);
    }

    public static function generateNomor(): string
    {
        $today = date('Ymd');
        $count = static::whereDate('created_at', today())->count() + 1;
        return 'JH-' . $today . '-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}
