<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Modifier extends Model
{
    use HasFactory;

    protected $fillable = [
        'modifier_group_id',
        'nama',
        'harga_tambahan',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'harga_tambahan' => 'float',
            'is_default' => 'boolean',
        ];
    }

    public function group()
    {
        return $this->belongsTo(ModifierGroup::class, 'modifier_group_id');
    }
}
