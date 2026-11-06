<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProdukBahan extends Model
{
    use HasFactory;

    protected $fillable = [
        'produk_id',
        'bahan_baku_id',
        'jumlah_pemakaian',
    ];

    protected function casts(): array
    {
        return [
            'jumlah_pemakaian' => 'float',
        ];
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }

    public function bahanBaku()
    {
        return $this->belongsTo(BahanBaku::class);
    }
}
