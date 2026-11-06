<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailPesananModifier extends Model
{
    use HasFactory;

    protected $fillable = [
        'detail_pesanan_id',
        'modifier_id',
        'nama_modifier',
        'harga_tambahan',
    ];

    protected function casts(): array
    {
        return [
            'harga_tambahan' => 'float',
        ];
    }

    public function detailPesanan()
    {
        return $this->belongsTo(DetailPesanan::class, 'detail_pesanan_id');
    }

    public function modifier()
    {
        return $this->belongsTo(Modifier::class);
    }
}
