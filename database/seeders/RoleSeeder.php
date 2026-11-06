<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'owner', 'display_name' => 'Owner Cafe', 'description' => 'Akses penuh ke seluruh sistem dan laporan'],
            ['name' => 'manager', 'display_name' => 'Manager Operasional', 'description' => 'Kelola inventori, staff, dan laporan penjualan'],
            ['name' => 'kasir', 'display_name' => 'Kasir', 'description' => 'Operasional POS kasir dan pembayaran transaksi'],
            ['name' => 'barista', 'display_name' => 'Barista', 'description' => 'KDS Barista & pembuatan minuman'],
            ['name' => 'kitchen', 'display_name' => 'Kitchen', 'description' => 'KDS Kitchen & penyajian makanan'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(['name' => $role['name']], $role);
        }
    }
}
