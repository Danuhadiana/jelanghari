<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservasi extends Model
{
    use HasFactory;

    protected $table = 'reservasis';

    protected $fillable = [
        'user_id',
        'nama_pemesan',
        'telepon',
        'tanggal',
        'jam',
        'durasi_jam',
        'jumlah_orang',
        'meja_id',
        'status',
        'dp_nominal',
        'catatan',
        'catatan_admin',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'durasi_jam' => 'integer',
            'jumlah_orang' => 'integer',
            'dp_nominal' => 'float',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function meja()
    {
        return $this->belongsTo(Meja::class);
    }
}
