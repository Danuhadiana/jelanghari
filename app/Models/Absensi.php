<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    use HasFactory;

    protected $table = 'absensi';

    protected $fillable = [
        'user_id',
        'tanggal',
        'shift_id',
        'jam_masuk',
        'jam_keluar',
        'foto_masuk',
        'foto_keluar',
        'latitude_masuk',
        'longitude_masuk',
        'latitude_keluar',
        'longitude_keluar',
        'status',
        'jam_kerja_menit',
        'lembur_menit',
        'keterangan',
        'approved_by',
        'approved_at',
        'is_approved',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'jam_masuk' => 'datetime',
            'jam_keluar' => 'datetime',
            'approved_at' => 'datetime',
            'latitude_masuk' => 'float',
            'longitude_masuk' => 'float',
            'latitude_keluar' => 'float',
            'longitude_keluar' => 'float',
            'jam_kerja_menit' => 'integer',
            'lembur_menit' => 'integer',
            'is_approved' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function shift()
    {
        return $this->belongsTo(ShiftKasir::class, 'shift_id');
    }
}
