<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode',
        'nama',
        'tipe',
        'nilai',
        'min_belanja',
        'maks_potongan',
        'kuota',
        'terpakai',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_aktif',
    ];

    protected function casts(): array
    {
        return [
            'nilai' => 'float',
            'min_belanja' => 'float',
            'maks_potongan' => 'float',
            'kuota' => 'integer',
            'terpakai' => 'integer',
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'is_aktif' => 'boolean',
        ];
    }
}
