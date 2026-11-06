<?php

namespace App\Helpers;

use Carbon\Carbon;

class Format
{
    public static function rupiah($nominal): string
    {
        return 'Rp ' . number_format((float) $nominal, 0, ',', '.');
    }

    public static function tanggalId($datetime, string $format = 'd M Y'): string
    {
        if (!$datetime) return '-';
        return Carbon::parse($datetime)->locale('id')->translatedFormat($format);
    }

    public static function tanggalWaktuId($datetime): string
    {
        if (!$datetime) return '-';
        return Carbon::parse($datetime)->locale('id')->translatedFormat('d M Y, H:i');
    }
}
