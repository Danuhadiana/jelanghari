<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Owner Jelang Hari',
                'username' => 'owner',
                'email' => 'owner@jelanghari.com',
                'password' => Hash::make('password'),
                'pin' => Hash::make('123456'),
                'role' => 'owner',
                'telepon' => '081234567890',
                'is_aktif' => true,
            ],
            [
                'name' => 'Manager Dimas',
                'username' => 'manager',
                'email' => 'manager@jelanghari.com',
                'password' => Hash::make('password'),
                'pin' => Hash::make('123456'),
                'role' => 'manager',
                'telepon' => '081234567891',
                'is_aktif' => true,
            ],
            [
                'name' => 'Kasir Rina',
                'username' => 'kasir',
                'email' => 'kasir@jelanghari.com',
                'password' => Hash::make('password'),
                'pin' => Hash::make('112233'),
                'role' => 'kasir',
                'telepon' => '081234567892',
                'is_aktif' => true,
            ],
            [
                'name' => 'Barista Fajar',
                'username' => 'barista',
                'email' => 'barista@jelanghari.com',
                'password' => Hash::make('password'),
                'pin' => Hash::make('112233'),
                'role' => 'barista',
                'telepon' => '081234567893',
                'is_aktif' => true,
            ],
            [
                'name' => 'Chef Budi',
                'username' => 'kitchen',
                'email' => 'kitchen@jelanghari.com',
                'password' => Hash::make('password'),
                'pin' => Hash::make('112233'),
                'role' => 'kitchen',
                'telepon' => '081234567894',
                'is_aktif' => true,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(['email' => $userData['email']], $userData);
        }
    }
}
