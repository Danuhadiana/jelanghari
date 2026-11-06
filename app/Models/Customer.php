<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'telepon',
        'email',
        'tanggal_lahir',
        'poin',
        'total_transaksi',
        'kunjungan_count',
        'terakhir_kunjung',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'poin' => 'integer',
            'total_transaksi' => 'float',
            'kunjungan_count' => 'integer',
            'terakhir_kunjung' => 'datetime',
        ];
    }
}
