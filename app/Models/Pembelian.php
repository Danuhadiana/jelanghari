<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pembelian extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_pembelian',
        'supplier_id',
        'user_id',
        'tanggal',
        'total_biaya',
        'status_pembayaran',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'total_biaya' => 'float',
        ];
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function details()
    {
        return $this->hasMany(PembelianDetail::class);
    }

    public static function generateNomor(): string
    {
        $today = date('Ymd');
        $count = static::whereDate('created_at', today())->count() + 1;
        return 'PO-' . $today . '-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}
