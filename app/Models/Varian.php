<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Varian extends Model
{
    use HasFactory;

    protected $fillable = [
        'produk_id',
        'nama',
        'harga_tambahan',
        'sku',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'harga_tambahan' => 'float',
            'is_default' => 'boolean',
        ];
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }
}
