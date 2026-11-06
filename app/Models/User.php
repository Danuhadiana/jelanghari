<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'pin',
        'role',
        'telepon',
        'is_aktif',
        'avatar',
        'gaji_harian',
    ];

    protected $hidden = [
        'password',
        'pin',
        'remember_token',
    ];

    protected $appends = [
        'nama',
        'role_slug',
    ];

    public function getNamaAttribute(): string
    {
        return $this->attributes['name'] ?? '';
    }

    public function setNamaAttribute($value): void
    {
        $this->attributes['name'] = $value;
    }

    public function getRoleSlugAttribute(): string
    {
        $role = $this->attributes['role'] ?? 'owner';
        return is_string($role) ? strtolower($role) : 'owner';
    }

    public function setRoleSlugAttribute($value): void
    {
        $this->attributes['role'] = $value;
    }

    public function save(array $options = [])
    {
        unset($this->attributes['nama']);
        unset($this->attributes['role_slug']);
        return parent::save($options);
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_aktif' => 'boolean',
        ];
    }

    public function pesanans()
    {
        return $this->hasMany(Pesanan::class);
    }

    public function shifts()
    {
        return $this->hasMany(ShiftKasir::class);
    }

    public function activeShift()
    {
        return $this->hasOne(ShiftKasir::class)->where('status', 'aktif')->latest();
    }

    public function absensis()
    {
        return $this->hasMany(Absensi::class);
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isManager(): bool
    {
        return in_array($this->role, ['owner', 'manager']);
    }

    public function isKasir(): bool
    {
        return in_array($this->role, ['owner', 'manager', 'kasir']);
    }

    public function isPelanggan(): bool
    {
        return $this->role === 'pelanggan';
    }

    public function isStaff(): bool
    {
        return in_array($this->role, ['owner', 'manager', 'kasir', 'barista', 'kitchen']);
    }
}

