<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kategori;

class KategoriSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['nama' => 'Signature',         'slug' => 'signature',       'ikon' => 'Sparkles',  'urutan' => 1,  'is_aktif' => true],
            ['nama' => 'Coffee Based',      'slug' => 'coffee-based',    'ikon' => 'Coffee',    'urutan' => 2,  'is_aktif' => true],
            ['nama' => 'Manual Brew',       'slug' => 'manual-brew',     'ikon' => 'Flame',     'urutan' => 3,  'is_aktif' => true],
            ['nama' => 'Non Coffee',        'slug' => 'non-coffee',      'ikon' => 'Leaf',      'urutan' => 4,  'is_aktif' => true],
            ['nama' => 'Tropical',          'slug' => 'tropical',        'ikon' => 'Sun',       'urutan' => 5,  'is_aktif' => true],
            ['nama' => 'Traditional',       'slug' => 'traditional',     'ikon' => 'Utensils',  'urutan' => 6,  'is_aktif' => true],
            ['nama' => 'Noodles',           'slug' => 'noodles',         'ikon' => 'Soup',      'urutan' => 7,  'is_aktif' => true],
            ['nama' => 'Western',           'slug' => 'western',         'ikon' => 'Beef',      'urutan' => 8,  'is_aktif' => true],
            ['nama' => 'Snacks',            'slug' => 'snacks',          'ikon' => 'Cookie',    'urutan' => 9,  'is_aktif' => true],
            ['nama' => 'Pastry & Dessert',  'slug' => 'pastry-dessert',  'ikon' => 'Croissant', 'urutan' => 10, 'is_aktif' => true],
        ];

        foreach ($categories as $cat) {
            Kategori::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
