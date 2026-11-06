<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModifierGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'wajib_pilih',
        'min_pilihan',
        'maks_pilihan',
    ];

    protected function casts(): array
    {
        return [
            'wajib_pilih' => 'boolean',
            'min_pilihan' => 'integer',
            'maks_pilihan' => 'integer',
        ];
    }

    public function modifiers()
    {
        return $this->hasMany(Modifier::class);
    }

    public function produks()
    {
        return $this->belongsToMany(Produk::class, 'produk_modifier_group');
    }
}
