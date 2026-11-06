<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meja extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor',
        'nama',
        'area',
        'kapasitas',
        'status',
        'qr_code',
        'is_aktif',
    ];

    protected function casts(): array
    {
        return [
            'kapasitas' => 'integer',
            'is_aktif' => 'boolean',
        ];
    }

    public function pesanans()
    {
        return $this->hasMany(Pesanan::class);
    }

    public function pesananAktif()
    {
        return $this->hasOne(Pesanan::class)->whereNotIn('status_pesanan', ['selesai', 'dibatalkan'])->latest();
    }
}
