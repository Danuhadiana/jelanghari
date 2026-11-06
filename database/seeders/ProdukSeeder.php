<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kategori;
use App\Models\Produk;
use App\Models\Varian;
use App\Models\ModifierGroup;
use App\Models\Modifier;

class ProdukSeeder extends Seeder
{
    public function run(): void
    {
        // ── Modifier Groups ──────────────────────────────────────────────
        // ── Modifier Groups ──────────────────────────────────────────────
        $groupGula = ModifierGroup::firstOrCreate(
            ['nama' => 'Level Gula'],
            ['wajib_pilih' => false, 'min_pilihan' => 0, 'maks_pilihan' => 1]
        );
        if ($groupGula->modifiers()->count() === 0) {
            Modifier::insert([
                ['modifier_group_id' => $groupGula->id, 'nama' => 'Normal Sweet (100%)', 'harga_tambahan' => 0,    'is_default' => true],
                ['modifier_group_id' => $groupGula->id, 'nama' => 'Less Sweet (50%)',    'harga_tambahan' => 0,    'is_default' => false],
                ['modifier_group_id' => $groupGula->id, 'nama' => 'No Sugar (0%)',       'harga_tambahan' => 0,    'is_default' => false],
            ]);
        }

        $groupSusu = ModifierGroup::firstOrCreate(
            ['nama' => 'Pilihan Susu'],
            ['wajib_pilih' => false, 'min_pilihan' => 0, 'maks_pilihan' => 1]
        );
        if ($groupSusu->modifiers()->count() === 0) {
            Modifier::insert([
                ['modifier_group_id' => $groupSusu->id, 'nama' => 'Fresh Milk (Default)', 'harga_tambahan' => 0,    'is_default' => true],
                ['modifier_group_id' => $groupSusu->id, 'nama' => 'Oat Milk',             'harga_tambahan' => 6000, 'is_default' => false],
                ['modifier_group_id' => $groupSusu->id, 'nama' => 'Soy Milk',             'harga_tambahan' => 5000, 'is_default' => false],
            ]);
        }

        $groupSyrup = ModifierGroup::firstOrCreate(
            ['nama' => 'Pilihan Rasa Syrup'],
            ['wajib_pilih' => false, 'min_pilihan' => 0, 'maks_pilihan' => 1]
        );
        if ($groupSyrup->modifiers()->count() === 0) {
            Modifier::insert([
                ['modifier_group_id' => $groupSyrup->id, 'nama' => 'Original',     'harga_tambahan' => 0, 'is_default' => true],
                ['modifier_group_id' => $groupSyrup->id, 'nama' => 'Vanilla',      'harga_tambahan' => 0, 'is_default' => false],
                ['modifier_group_id' => $groupSyrup->id, 'nama' => 'Hazelnut',     'harga_tambahan' => 0, 'is_default' => false],
                ['modifier_group_id' => $groupSyrup->id, 'nama' => 'Caramel',      'harga_tambahan' => 0, 'is_default' => false],
                ['modifier_group_id' => $groupSyrup->id, 'nama' => 'Butterscotch', 'harga_tambahan' => 0, 'is_default' => false],
            ]);
        }

        $groupExtra = ModifierGroup::firstOrCreate(
            ['nama' => 'Extra Topping'],
            ['wajib_pilih' => false, 'min_pilihan' => 0, 'maks_pilihan' => 3]
        );
        if ($groupExtra->modifiers()->count() === 0) {
            Modifier::insert([
                ['modifier_group_id' => $groupExtra->id, 'nama' => 'Extra Espresso Shot', 'harga_tambahan' => 5000, 'is_default' => false],
                ['modifier_group_id' => $groupExtra->id, 'nama' => 'Extra Syrup',          'harga_tambahan' => 3000, 'is_default' => false],
                ['modifier_group_id' => $groupExtra->id, 'nama' => 'Whipped Cream',        'harga_tambahan' => 4000, 'is_default' => false],
            ]);
        }

        // ── Retrieve Categories ──────────────────────────────────────────
        $katSig   = Kategori::where('slug', 'signature')->first();
        $katCB    = Kategori::where('slug', 'coffee-based')->first();
        $katMB    = Kategori::where('slug', 'manual-brew')->first();
        $katNC    = Kategori::where('slug', 'non-coffee')->first();
        $katTrop  = Kategori::where('slug', 'tropical')->first();
        $katTrad  = Kategori::where('slug', 'traditional')->first();
        $katNood  = Kategori::where('slug', 'noodles')->first();
        $katWest  = Kategori::where('slug', 'western')->first();
        $katSnack = Kategori::where('slug', 'snacks')->first();
        $katPast  = Kategori::where('slug', 'pastry-dessert')->first();

        // ── SIGNATURE ────────────────────────────────────────────────────
        $this->makeDrink($katSig->id, 'SIG-001', 'Kopi Susu Jelang Hari', 'es-kopi-susu-jelang-hari',
            'Signature house blend espresso dengan gula aren organik & fresh milk creamy', 25000, true, 1,
            [['Ice', 0, true]], [$groupGula->id, $groupSusu->id, $groupExtra->id]);

        $this->makeDrink($katSig->id, 'SIG-002', 'Brown Sugar', 'brown-sugar',
            'Espresso dengan gula aren karamel yang kaya dan susu segar', 24000, true, 2,
            [['Ice', 0, true]], [$groupSusu->id, $groupExtra->id]);

        $this->makeDrink($katSig->id, 'SIG-003', 'Lemonito', 'lemonito',
            'Minuman segar perpaduan lemon, susu, dan espresso', 24000, true, 3,
            [['Ice', 0, true]], []);

        $this->makeDrink($katSig->id, 'SIG-004', 'Suwarni', 'suwarni',
            'Minuman andalan dengan rasa yang unik dan memanjakan lidah', 25000, true, 4,
            [['Ice', 0, true]], [$groupGula->id]);

        $this->makeDrink($katSig->id, 'SIG-005', 'Suwarno', 'suwarno',
            'Varian signature dengan perpaduan rasa yang istimewa', 24000, true, 5,
            [['Ice', 0, true]], [$groupGula->id]);

        $this->makeDrink($katSig->id, 'SIG-006', 'Rum Vampire', 'rum-vampire',
            'Best seller! Minuman spesial dengan rasa kompleks yang menggoda', 35000, true, 6,
            [['Ice', 0, true]], []);

        // ── COFFEE BASED ─────────────────────────────────────────────────
        $this->makeDrink($katCB->id, 'CB-001', 'Americano', 'americano',
            'Double shot espresso arabika pilihan dengan air mineral segar', 21000, false, 1,
            [['Hot', 0, true], ['Ice', 2000, false]], [$groupExtra->id]);

        $this->makeDrink($katCB->id, 'CB-002', 'Cappuccino', 'cappuccino',
            'Espresso dengan steamed milk foam tebal yang lembut', 21000, false, 2,
            [['Hot', 0, true], ['Ice', 2000, false]], [$groupSusu->id, $groupExtra->id]);

        $this->makeDrink($katCB->id, 'CB-003', 'Espresso', 'espresso',
            'Single atau double shot espresso murni tanpa tambahan', 18000, false, 3,
            [['Hot', 0, true]], [$groupExtra->id]);

        $this->makeDrink($katCB->id, 'CB-004', 'Cafe Latte', 'cafe-latte',
            'Espresso lembut dengan steamed milk – tersedia varian rasa pilihan', 22000, false, 4,
            [['Hot', 0, true], ['Ice', 2000, false]], [$groupGula->id, $groupSusu->id, $groupSyrup->id, $groupExtra->id]);

        // ── MANUAL BREW ──────────────────────────────────────────────────
        $this->makeDrink($katMB->id, 'MB-001', 'Vietnam Drip', 'vietnam-drip',
            'Kopi drip ala Vietnam dengan kondensasi susu kental manis yang klasik', 21000, false, 1,
            [['Hot', 0, true], ['Ice', 2000, false]], [$groupGula->id]);

        // ── NON COFFEE ───────────────────────────────────────────────────
        $this->makeDrink($katNC->id, 'NC-001', 'Matcha / Thaitea', 'matcha-thaitea',
            'Matcha premium Jepang atau Thai tea klasik yang menyegarkan', 20000, false, 1,
            [['Hot', 0, true], ['Ice', 2000, false]], [$groupGula->id, $groupSusu->id]);

        $this->makeDrink($katNC->id, 'NC-002', 'Redvelvet / Taro', 'redvelvet-taro',
            'Minuman berwarna cantik dengan rasa redvelvet atau taro yang khas', 20000, false, 2,
            [['Hot', 0, true], ['Ice', 2000, false]], [$groupGula->id, $groupSusu->id]);

        $this->makeDrink($katNC->id, 'NC-003', 'Chocolate', 'chocolate',
            'Cokelat belgia premium yang kaya dan creamy', 20000, false, 3,
            [['Hot', 0, true], ['Ice', 2000, false]], [$groupGula->id, $groupSusu->id]);

        $this->makeDrink($katNC->id, 'NC-004', 'Mango Milk', 'mango-milk',
            'Perpaduan segar mangga tropis dengan susu lembut', 23000, false, 4,
            [['Ice', 0, true]], []);

        $this->makeDrink($katNC->id, 'NC-005', 'Apple Mint', 'apple-mint',
            'Sensasi segar apel dan mint yang menyegarkan tenggorokan', 23000, false, 5,
            [['Ice', 0, true]], []);

        $this->makeDrink($katNC->id, 'NC-006', 'Lemon Tea', 'lemon-tea',
            'Teh dengan perasan lemon segar yang menyeimbangkan rasa', 17000, false, 6,
            [['Hot', 0, true], ['Ice', 3000, false]], []);

        $this->makeDrink($katNC->id, 'NC-007', 'Black Tea', 'black-tea',
            'Teh hitam pilihan dengan aroma yang kuat dan harum', 10000, false, 7,
            [['Hot', 0, true], ['Ice', 3000, false]], []);

        $this->makeDrink($katNC->id, 'NC-008', 'Lychee Tea', 'lychee-tea',
            'Teh leci dengan aroma bunga dan rasa manis yang ringan', 20000, true, 8,
            [['Hot', 0, true], ['Ice', 3000, false]], []);

        $this->makeDrink($katNC->id, 'NC-009', 'Lemongrass Tea', 'lemongrass-tea',
            'Teh sereh hangat dengan aroma herbal yang menenangkan', 19000, false, 9,
            [['Hot', 0, true], ['Ice', 3000, false]], []);

        // ── TROPICAL ─────────────────────────────────────────────────────
        $this->makeDrink($katTrop->id, 'TP-001', 'Mojito', 'mojito',
            'Minuman segar ala bar dengan mint dan lemon yang menyegarkan', 23000, false, 1,
            [['Ice', 0, true]], []);

        $this->makeDrink($katTrop->id, 'TP-002', 'Rainy Mango', 'rainy-mango',
            'Mangga tropis dengan sentuhan asam manis yang memanjakan', 24000, false, 2,
            [['Ice', 0, true]], []);

        $this->makeDrink($katTrop->id, 'TP-003', 'Sunrise', 'sunrise',
            'Gradasi warna cantik dengan rasa buah tropis yang segar', 24000, false, 3,
            [['Ice', 0, true]], []);

        $this->makeDrink($katTrop->id, 'TP-004', 'Dose of Magic', 'dose-of-magic',
            'Kombinasi bahan rahasia yang menciptakan rasa magis', 24000, true, 4,
            [['Ice', 0, true]], []);

        $this->makeDrink($katTrop->id, 'TP-005', 'Jus Markisa', 'jus-markisa',
            'Jus buah markisa segar alami tanpa pengawet', 17000, false, 5,
            [['Ice', 0, true]], []);

        // ── TRADITIONAL ──────────────────────────────────────────────────
        $this->makeFood($katTrad->id, 'TR-001', 'Nasi Goreng Rempah', 'nasi-goreng-rempah',
            'Nasi goreng dengan bumbu rempah pilihan, telur ceplok & kerupuk udang', 27000, true, 1);

        $this->makeFood($katTrad->id, 'TR-002', 'Nasi Sup Gurame', 'nasi-sup-gurame',
            'Gurame segar dalam kuah sup bening hangat dengan nasi putih', 32000, true, 2);

        $this->makeFood($katTrad->id, 'TR-003', 'Nasi Ayam Penyet', 'nasi-ayam-penyet',
            'Ayam goreng krispi dipenyet dengan sambal terasi pedas mantap', 28000, false, 3);

        $this->makeFood($katTrad->id, 'TR-004', 'Nasi Ayam Bakar Madu', 'nasi-ayam-bakar-madu',
            'Ayam bakar dengan olesan madu yang harum dan karamel', 28000, false, 4);

        $this->makeFood($katTrad->id, 'TR-005', 'Nasi Jeruk Kulit Krispi', 'nasi-jeruk-kulit-krispi',
            'Ayam krispi dengan bumbu jeruk unik yang segar dan renyah', 24000, true, 5);

        // ── NOODLES ──────────────────────────────────────────────────────
        $this->makeFood($katNood->id, 'ND-001', 'Mie Goreng', 'mie-goreng',
            'Mie goreng lezat dengan bumbu spesial dan pelengkap pilihan', 24000, false, 1);

        $this->makeFood($katNood->id, 'ND-002', 'Kwetiau Goreng / Kuah', 'kwetiau-goreng-kuah',
            'Kwetiau dengan pilihan goreng crispy atau kuah kaldu gurih', 24000, false, 2);

        $this->makeFood($katNood->id, 'ND-003', 'Mie Tektek', 'mie-tektek',
            'Mie tektek gerobak ala street food dengan cita rasa otentik', 24000, false, 3);

        // ── WESTERN ──────────────────────────────────────────────────────
        $this->makeFood($katWest->id, 'WS-001', 'Chicken Steak BBQ', 'chicken-steak-bbq',
            'Chicken steak panggang dengan saus barbeque smoky & kentang goreng', 36000, false, 1);

        $this->makeFood($katWest->id, 'WS-002', 'Chicken Rice Blackpepper', 'chicken-rice-blackpepper',
            'Nasi ayam dengan saus lada hitam yang kaya rasa', 24000, false, 2);

        $this->makeFood($katWest->id, 'WS-003', 'Spicy Chicken Wings', 'spicy-chicken-wings',
            'Sayap ayam goreng dengan saus pedas spicy yang nagih', 25000, true, 3);

        $this->makeFood($katWest->id, 'WS-004', 'Spaghetti Bolognese', 'spaghetti-bolognese',
            'Spaghetti dengan saus daging cincang tomat yang kaya rempah Italia', 27500, false, 4);

        $this->makeFood($katWest->id, 'WS-005', 'Omelet', 'omelet',
            'Telur dadar lembut dengan isian pilihan yang mengenyangkan', 13000, false, 5);

        // ── SNACKS ───────────────────────────────────────────────────────
        $this->makeFood($katSnack->id, 'SK-001', 'Sosis Kentang', 'sosis-kentang',
            'Sosis dengan kentang goreng renyah, cocok untuk teman nongkrong', 21000, false, 1);

        $this->makeFood($katSnack->id, 'SK-002', 'Mix Plater', 'mix-plater',
            'Kombinasi aneka snack pilihan dalam satu piring besar', 32000, false, 2);

        $this->makeFood($katSnack->id, 'SK-003', 'Tahu Cabe Garam', 'tahu-cabe-garam',
            'Tahu goreng krispi dengan bumbu cabe garam yang menggoda selera', 18000, false, 3);

        $this->makeFood($katSnack->id, 'SK-004', 'Cireng', 'cireng',
            'Aci digoreng renyah dengan saus cocolan pedas', 15000, false, 4);

        $this->makeFood($katSnack->id, 'SK-005', 'Cirawang', 'cirawang',
            'Cireng isi rawon dengan rasa bumbu hitam yang khas', 17000, true, 5);

        $this->makeFood($katSnack->id, 'SK-006', 'Singgor', 'singgor',
            'Singkong goreng krispi dengan bumbu tabur pilihan', 17000, false, 6);

        $this->makeFood($katSnack->id, 'SK-007', 'Pisgor / Pisbak', 'pisgor-pisbak',
            'Pisang goreng atau pisang bakar dengan topping saus manis', 17000, false, 7);

        $this->makeFood($katSnack->id, 'SK-008', 'Roti Bakar Skippy', 'roti-bakar-skippy',
            'Roti bakar dengan olesan selai kacang Skippy yang creamy', 17000, false, 8);

        // ── PASTRY & DESSERT ─────────────────────────────────────────────
        $this->makeFood($katPast->id, 'PS-001', 'Croffle', 'croffle',
            'Croissant waffle dengan tekstur krispy berlapis dan aroma mentega', 20000, false, 1);

        $this->makeFood($katPast->id, 'PS-002', 'Cinnamon Croissant', 'cinnamon-croissant',
            'Croissant hangat dengan aroma kayu manis yang menggugah selera', 22000, true, 2);

        $this->makeFood($katPast->id, 'PS-003', 'Choc Au Pain', 'choc-au-pain',
            'Pain au chocolat lembut dengan isian dark chocolate premium', 22000, false, 3);

        $this->makeFood($katPast->id, 'PS-004', 'Roti Macan', 'roti-macan',
            'Roti soft dengan topping spesial yang unik dan lezat', 22000, false, 4);

        $this->makeFood($katPast->id, 'PS-005', 'Singkong Thailand', 'singkong-thailand',
            'Singkong kukus dengan santan dan pandan ala dessert Thailand', 20000, false, 5);
    }

    /** Helper: buat minuman dengan varian & modifier */
    private function makeDrink(
        int $katId, string $kode, string $nama, string $slug,
        string $deskripsi, int $harga, bool $isFav, int $urutan,
        array $varians, array $modifierGroupIds
    ): void {
        $produk = Produk::updateOrCreate(
            ['kode' => $kode],
            [
                'kategori_id'  => $katId,
                'nama'         => $nama,
                'slug'         => $slug,
                'deskripsi'    => $deskripsi,
                'harga'        => $harga,
                'harga_modal'  => (int) round($harga * 0.35),
                'is_tersedia'  => true,
                'is_favorite'  => $isFav,
                'station'      => 'barista',
                'urutan'       => $urutan,
            ]
        );

        foreach ($varians as [$vNama, $vHarga, $vDefault]) {
            Varian::firstOrCreate(
                ['produk_id' => $produk->id, 'nama' => $vNama],
                ['harga_tambahan' => $vHarga, 'is_default' => $vDefault]
            );
        }

        if (!empty($modifierGroupIds)) {
            $produk->modifierGroups()->sync($modifierGroupIds);
        }
    }

    /** Helper: buat makanan (tanpa varian utama) */
    private function makeFood(
        int $katId, string $kode, string $nama, string $slug,
        string $deskripsi, int $harga, bool $isFav, int $urutan
    ): void {
        Produk::updateOrCreate(
            ['kode' => $kode],
            [
                'kategori_id'  => $katId,
                'nama'         => $nama,
                'slug'         => $slug,
                'deskripsi'    => $deskripsi,
                'harga'        => $harga,
                'harga_modal'  => (int) round($harga * 0.35),
                'is_tersedia'  => true,
                'is_favorite'  => $isFav,
                'station'      => 'kitchen',
                'urutan'       => $urutan,
            ]
        );
    }
}
