<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Meja;

class MejaSeeder extends Seeder
{
    public function run(): void
    {
        $tables = [
            ['nomor' => '01', 'nama' => 'Meja 01 (Indoor Depan)', 'area' => 'Indoor', 'kapasitas' => 2, 'status' => 'kosong'],
            ['nomor' => '02', 'nama' => 'Meja 02 (Indoor Tengah)', 'area' => 'Indoor', 'kapasitas' => 4, 'status' => 'kosong'],
            ['nomor' => '03', 'nama' => 'Meja 03 (Indoor Sofa)', 'area' => 'Indoor', 'kapasitas' => 4, 'status' => 'kosong'],
            ['nomor' => '04', 'nama' => 'Meja 04 (Indoor Bar)', 'area' => 'Indoor', 'kapasitas' => 2, 'status' => 'kosong'],
            ['nomor' => '05', 'nama' => 'Meja 05 (Outdoor Garden)', 'area' => 'Outdoor', 'kapasitas' => 4, 'status' => 'kosong'],
            ['nomor' => '06', 'nama' => 'Meja 06 (Outdoor Smoking)', 'area' => 'Outdoor', 'kapasitas' => 4, 'status' => 'kosong'],
            ['nomor' => '07', 'nama' => 'Meja 07 (Outdoor Rooftop)', 'area' => 'Outdoor', 'kapasitas' => 6, 'status' => 'kosong'],
            ['nomor' => 'WS-01', 'nama' => 'Workspace Pod 1 (Colokan & Lampu)', 'area' => 'Workspace', 'kapasitas' => 1, 'status' => 'kosong'],
            ['nomor' => 'WS-02', 'nama' => 'Workspace Pod 2 (Colokan & Lampu)', 'area' => 'Workspace', 'kapasitas' => 1, 'status' => 'kosong'],
            ['nomor' => 'WS-03', 'nama' => 'Workspace Communal Table', 'area' => 'Workspace', 'kapasitas' => 8, 'status' => 'kosong'],
        ];

        foreach ($tables as $t) {
            Meja::updateOrCreate(['nomor' => $t['nomor']], $t);
        }
    }
}
