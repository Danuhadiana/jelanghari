<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailPesanan extends Model
{
    use HasFactory;

    protected $fillable = [
        'pesanan_id',
        'produk_id',
        'varian_id',
        'nama_produk',
        'nama_varian',
        'harga_satuan',
        'jumlah',
        'subtotal',
        'catatan_khusus',
        'status_kds',
    ];

    protected function casts(): array
    {
        return [
            'harga_satuan' => 'float',
            'jumlah' => 'integer',
            'subtotal' => 'float',
        ];
    }

    public function pesanan()
    {
        return $this->belongsTo(Pesanan::class);
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }

    public function varian()
    {
        return $this->belongsTo(Varian::class);
    }

    public function modifiers()
    {
        return $this->hasMany(DetailPesananModifier::class, 'detail_pesanan_id');
    }
}
