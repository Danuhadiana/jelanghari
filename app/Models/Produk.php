<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produk extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'kategori_id',
        'kode',
        'nama',
        'slug',
        'deskripsi',
        'harga',
        'harga_modal',
        'foto',
        'is_tersedia',
        'is_favorite',
        'kelola_stok',
        'stok',
        'min_stok',
        'station',
        'urutan',
    ];

    protected function casts(): array
    {
        return [
            'harga' => 'float',
            'harga_modal' => 'float',
            'is_tersedia' => 'boolean',
            'is_favorite' => 'boolean',
            'kelola_stok' => 'boolean',
            'stok' => 'integer',
            'min_stok' => 'integer',
            'urutan' => 'integer',
        ];
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    public function varians()
    {
        return $this->hasMany(Varian::class);
    }

    public function modifierGroups()
    {
        return $this->belongsToMany(ModifierGroup::class, 'produk_modifier_group');
    }

    public function resep()
    {
        return $this->hasMany(ProdukBahan::class);
    }

    public function logStoks()
    {
        return $this->hasMany(LogStok::class);
    }
}
