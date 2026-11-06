<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    use HasFactory;

    protected $fillable = [
        'judul',
        'pesan',
        'tipe',
        'dibaca',
        'link',
    ];

    protected function casts(): array
    {
        return [
            'dibaca' => 'boolean',
        ];
    }
}
