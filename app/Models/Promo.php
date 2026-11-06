<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'deskripsi',
        'tipe',
        'nilai',
        'tanggal_mulai',
        'tanggal_selesai',
        'hari_berlaku',
        'jam_mulai',
        'jam_selesai',
        'is_aktif',
    ];

    protected function casts(): array
    {
        return [
            'nilai' => 'float',
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'is_aktif' => 'boolean',
        ];
    }
}
