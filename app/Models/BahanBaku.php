<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BahanBaku extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode',
        'nama',
        'kategori',
        'satuan',
        'stok',
        'min_stok',
        'harga_beli_terakhir',
    ];

    protected function casts(): array
    {
        return [
            'stok' => 'float',
            'min_stok' => 'float',
            'harga_beli_terakhir' => 'float',
        ];
    }

    public function resepProduks()
    {
        return $this->hasMany(ProdukBahan::class);
    }

    public function logs()
    {
        return $this->hasMany(LogStok::class);
    }
}
