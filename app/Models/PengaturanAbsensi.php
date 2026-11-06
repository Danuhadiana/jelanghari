<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengaturanAbsensi extends Model
{
    use HasFactory;

    protected $table = 'pengaturan_absensi';

    protected $fillable = [
        'kunci',
        'nilai',
        'deskripsi',
    ];

    public static function get(string $key, $default = null)
    {
        $item = static::where('kunci', $key)->first();
        return $item ? $item->nilai : $default;
    }

    public static function set(string $key, $value, $deskripsi = null): void
    {
        static::updateOrCreate(
            ['kunci' => $key],
            ['nilai' => (string) $value, 'deskripsi' => $deskripsi]
        );
    }

    public static function allKeyValues(): array
    {
        return static::pluck('nilai', 'kunci')->toArray();
    }
}
