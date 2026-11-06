<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftKasir extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'waktu_buka',
        'waktu_tutup',
        'modal_awal',
        'total_penjualan_cash',
        'total_penjualan_non_cash',
        'total_refund',
        'kas_diharapkan',
        'kas_aktual',
        'selisih',
        'status',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'waktu_buka' => 'datetime',
            'waktu_tutup' => 'datetime',
            'modal_awal' => 'float',
            'total_penjualan_cash' => 'float',
            'total_penjualan_non_cash' => 'float',
            'total_refund' => 'float',
            'kas_diharapkan' => 'float',
            'kas_aktual' => 'float',
            'selisih' => 'float',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
