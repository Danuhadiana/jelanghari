<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitorLog extends Model
{
    use HasFactory;

    protected $table = 'visitor_logs';

    protected $fillable = [
        'ip_address',
        'url',
        'method',
        'user_id',
        'user_name',
        'user_role',
        'device_info',
        'user_agent',
        'referrer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

