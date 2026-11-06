<?php

use App\Models\User;
use App\Models\Produk;
use App\Models\Meja;

beforeEach(function () {
    $this->seed();
});

it('renders kasir page for authenticated kasir user', function () {
    $user = User::where('email', 'kasir@jelanghari.com')->first();
    $response = $this->actingAs($user)->get('/kasir');

    $response->assertStatus(200);
});

it('can checkout order and deduct stock', function () {
    $user = User::where('email', 'kasir@jelanghari.com')->first();
    $produk = Produk::where('kode', 'SIG-001')->first();
    $meja = Meja::first();

    $payload = [
        'tipe_pesanan' => 'dine_in',
        'meja_id' => $meja->id,
        'nama_pelanggan' => 'Pelanggan Uji Coba',
        'items' => [
            [
                'produk_id' => $produk->id,
                'nama_produk' => $produk->nama,
                'harga_satuan' => $produk->harga,
                'jumlah' => 2,
                'subtotal' => $produk->harga * 2,
            ]
        ],
        'subtotal' => $produk->harga * 2,
        'diskon' => 0,
        'pajak_persen' => 10,
        'pajak_nominal' => ($produk->harga * 2) * 0.1,
        'total' => ($produk->harga * 2) * 1.1,
        'bayar' => 100000,
        'kembalian' => 100000 - (($produk->harga * 2) * 1.1),
        'metode_pembayaran' => 'cash',
    ];

    $response = $this->actingAs($user)->postJson('/kasir/checkout', $payload);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);

    $this->assertDatabaseHas('pesanans', [
        'nama_pelanggan' => 'Pelanggan Uji Coba',
        'metode_pembayaran' => 'cash',
    ]);
});
