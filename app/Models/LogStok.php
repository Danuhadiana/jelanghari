<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogStok extends Model
{
    use HasFactory;

    protected $fillable = [
        'bahan_baku_id',
        'produk_id',
        'user_id',
        'tipe',
        'jumlah',
        'stok_sebelum',
        'stok_sesudah',
        'keterangan',
        'referensi',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'float',
            'stok_sebelum' => 'float',
            'stok_sesudah' => 'float',
        ];
    }

    public function bahanBaku()
    {
        return $this->belongsTo(BahanBaku::class);
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
