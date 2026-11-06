import React, { useState, useMemo, useEffect } from 'react';
import {
    BookOpen,
    HelpCircle,
    X,
    Search,
    ChevronDown,
    ShoppingBag,
    Tv,
    Package,
    Users,
    FileSpreadsheet,
    CalendarCheck,
    Coins,
    ArrowUpRight,
    CheckCircle2,
    Lightbulb,
    Bot,
    QrCode,
    CalendarRange,
    FileEdit,
    Plus,
    Trash2,
    Edit2,
    Save,
    RotateCcw,
    AlertTriangle,
    Loader2,
    Check
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'tutorial' | 'glossary';
}

export interface GlossaryItem {
    id: string;
    term: string;
    category: 'keuangan' | 'operasional' | 'inventori' | 'pos_crm';
    categoryLabel: string;
    shortDef: string;
    formula?: string;
    detail: string;
    example: string;
}

export interface TutorialModule {
    id: string;
    title: string;
    badge: string;
    summary: string;
    steps: string[];
    link?: { label: string; url: string };
    iconName?: string;
}

// ── Default Tutorials Jelang Hari ──
const DEFAULT_TUTORIAL_MODULES: TutorialModule[] = [
    {
        id: 'ai_copilot',
        title: '1. Jelang Hari Copilot (AI Asisten Operasional Toko)',
        iconName: 'bot',
        badge: 'Kecerdasan Buatan',
        summary: 'Asisten cerdas berbasis Google Gemini yang menganalisis performa toko, membimbing SOP, dan menjawab konsultasi operasional.',
        steps: [
            'Peran AI: Sebagai asisten kecerdasan buatan operasional dan penasihat analitik kafe 24/7 yang menjembatani data bisnis riil dengan tindakan nyata tim di lapangan.',
            'Konteks Sistem: Memahami secara real-time data omzet harian, jumlah nota lunas, rata-rata belanja tamu (AOV), persediaan bahan baku kritis di gudang, antrean pesanan di KDS, serta SOP resmi pelayanan Jelang Hari.',
            'Tugas Utama: (1) Menyajikan panduan SOP cepat saat kasir atau barista bingung; (2) Menghitung metrik finansial seperti margin HPP, laba kotor, dan proyeksi omzet; (3) Memberi strategi penanganan komplain tamu (metode L.A.S.T); (4) Merekomendasikan promo bundling jam sepi; (5) Mendeteksi bahan baku yang menyentuh batas minimum.',
            'Batasan Sistem (Safety & Governance): AI tidak dapat dan tidak diizinkan mengubah kode program backend atau struktur database secara langsung tanpa otorisasi manusia; AI tidak dapat mengeluarkan uang tunai dari laci kasir secara otomatis; AI tidak dapat mengubah kata sandi, PIN, atau hak akses role pengguna sistem.',
            'Cara Menggunakan: Klik tombol Jelang Hari Copilot di header navigasi (atau tekan Ctrl+J / Cmd+J) atau ketik pertanyaan langsung di widget Copilot pada Dashboard Operasional.'
        ],
        link: { label: 'Buka Jelang Hari Copilot', url: '/dashboard' }
    },
    {
        id: 'meja_qr',
        title: '2. Scan Barcode Meja & Pesan Mandiri Otomatis',
        iconName: 'qr',
        badge: 'Self-Order QR',
        summary: 'Pelanggan memindai barcode di meja dan langsung diarahkan ke menu pemesanan meja tersebut.',
        steps: [
            'Scan Barcode di Meja: Pelanggan membuka kamera ponsel atau aplikasi scanner dan memindai barcode fisik yang tertempel di nomor meja masing-masing.',
            'Otomatis Terarah ke Menu Meja: Web Jelang Hari otomatis terbuka dengan nomor meja yang sudah terkunci (misal Meja 03 - Area Indoor). Pelanggan tidak perlu repot memilih nomor meja secara manual.',
            'Pilih Menu & Kustomisasi: Pelanggan memilih menu kopi atau makanan, memilih tingkat gula (less sugar/normal), varian susu, dan catatan khusus.',
            'Checkout & Metode Pembayaran: Pelanggan mengisi nama dan nomor WhatsApp, lalu memilih pembayaran via QRIS atau Tunai di Kasir.',
            'Pesanan Langsung Masuk ke Dapur/Bar: Setelah terkirim, tiket pesanan otomatis tercetak di layar KDS barista tanpa antre di kasir. Pelanggan dapat memantau proses racikan minuman secara live di layar ponselnya.'
        ],
        link: { label: 'Lihat Katalog Menu Publik', url: '/' }
    },
    {
        id: 'reservasi',
        title: '3. Sistem Reservasi Meja & Ruang Workspace',
        iconName: 'calendar',
        badge: 'Reservasi & Booking',
        summary: 'Pengelolaan booking meja dan ruang kerja oleh pelanggan serta manajemen persetujuan oleh Owner.',
        steps: [
            'Pengajuan oleh Pelanggan: Member dapat masuk ke portal /user/dashboard, memilih tanggal booking, jam kedatangan, durasi jam sewa, jumlah orang, dan pilihan meja.',
            'Panel Manajemen Owner (/reservasi): Owner dan Manajer dapat memantau daftar reservasi yang masuk, memfilter berdasarkan tanggal kedatangan, serta meninjau catatan tamu.',
            'Konfirmasi atau Edit Jadwal: Owner dapat mengubah status menjadi Dikonfirmasi, menetapkan nomor meja alternatif, mencatat uang muka (DP), atau membatalkan reservasi disertai alasan.',
            'Pengaturan Aturan Reservasi: Owner dapat mengaktifkan atau menonaktifkan sistem booking, menetapkan batas minimal DP, durasi maksimal jam sewa, serta nomor WhatsApp konfirmasi resmi toko di menu Pengaturan.'
        ],
        link: { label: 'Kelola Reservasi Meja', url: '/reservasi' }
    },
    {
        id: 'kasir',
        title: '4. Kasir POS & Transaksi Penjualan',
        iconName: 'pos',
        badge: 'POS Utama',
        summary: 'Alur lengkap membuat pesanan, input member, reedem kupon, hingga cetak/share struk.',
        steps: [
            'Buka Shift Kasir: Pastikan membuka sesi shift kasir di menu /shift dan mengisi modal tunai kas kecil (petty cash).',
            'Pilih Menu Produk: Klik produk yang diinginkan atau cari berdasarkan nama/kategori. Klik tombol kuantitas (+) atau (-) di keranjang.',
            'Input Pelanggan / Member: Cari nama atau nomor WhatsApp tamu di kolom "Cari Pelanggan" agar tamu mendapatkan 1 Poin per kelipatan Rp 10.000 belanja.',
            'Kupon & Voucher: Masukkan kode voucher jika tamu memiliki kupon diskon atau tukarkan poin member langsung pada keranjang.',
            'Pilih Pembayaran: Pilih Tunai (masukkan uang yang diterima untuk menghitung kembalian otomatis), QRIS, Transfer Bank, atau Kartu Debit.',
            'Checkout & Struk: Klik "Selesaikan Transaksi". Muncul pop-up cetak struk ke printer thermal Bluetooth/USB atau bagikan link struk digital ke WhatsApp pelanggan.'
        ],
        link: { label: 'Buka Menu Kasir POS', url: '/kasir' }
    },
    {
        id: 'kds',
        title: '5. Kitchen & Barista Display System (KDS)',
        iconName: 'kds',
        badge: 'Dapur & Bar',
        summary: 'Display antrean pesanan tanpa kertas untuk barista dan tim dapur.',
        steps: [
            'Tiket Masuk Otomatis: Setiap transaksi kasir yang berstatus "Paid" langsung muncul sebagai tiket antrean di halaman /kds.',
            'Status Racik / Masak: Saat barista atau chef mulai membuat pesanan, klik tombol "Mulai Proses" agar status berubah dan warna kartu aktif.',
            'Tandai Selesai: Saat seluruh cangkir kopi dan makanan selesai disajikan, klik "Tandai Selesai" untuk memindahkan tiket ke tab Selesai.',
            'Fitur Pembatalan & Reopen: Barista dapat membatalkan pesanan keliru atau membuka ulang tiket yang sudah selesai jika tamu meminta revisi.'
        ],
        link: { label: 'Buka Display KDS', url: '/kds' }
    },
    {
        id: 'stok',
        title: '6. Stok Bahan Baku & Resep Otomatis (BOM)',
        iconName: 'stock',
        badge: 'Inventori',
        summary: 'Formula resep per porsi yang otomatis memotong stok gudang saat transaksi kasir.',
        steps: [
            'Daftar Bahan Baku: Masukkan bahan mentah di menu /stok/bahan-baku (contoh: Espresso Beans dalam gram, Fresh Milk dalam ml, Cup dalam pcs).',
            'Tentukan Batas Minimum (Safety Stock): Beri batas aman agar sistem memberi peringatan ketika stok hampir habis.',
            'Hubungkan Resep (BOM): Di menu /stok/resep, tentukan formula per produk. Misal: 1 cup Kopi Susu = 18 gr Biji Kopi + 120 ml Susu + 1 pcs Paper Cup.',
            'Pemotongan Otomatis: Saat kasir checkout 2 cup Kopi Susu, sistem secara otomatis memotong 36 gr kopi, 240 ml susu, dan 2 cup dari database gudang.',
            'Faktur Pembelian: Catat nota pembelian kulakan bahan di menu /stok/pembelian untuk menambah stok riil.'
        ],
        link: { label: 'Kelola Bahan Baku', url: '/stok/bahan-baku' }
    },
    {
        id: 'crm',
        title: '7. CRM Pelanggan, Sistem Poin & Voucher',
        iconName: 'crm',
        badge: 'Loyalitas',
        summary: 'Pengelolaan data tamu setia, akumulasi poin belanja, dan program promosi.',
        steps: [
            'Registrasi Tamu Cepat: Daftarkan tamu langsung di kasir atau halaman /customer dengan nama dan WhatsApp.',
            'Portal Member (/user/dashboard): Tamu dapat login mandiri untuk melihat saldo poin, tier member, dan kode voucher aktif.',
            'Tunjukkan ke Kasir: Tamu cukup membuka portal member dan menekan tombol "Tunjukkan ke Kasir" untuk menampilkan QR Code & nomor member siap scan.',
            'Penukaran Poin: Poin pelanggan dapat ditukarkan voucher diskon langsung saat kasir menginput nama member di kasir POS.'
        ],
        link: { label: 'Buka Pelanggan & CRM', url: '/customer' }
    },
    {
        id: 'absensi',
        title: '8. Presensi Karyawan & Rekap Absensi Admin',
        iconName: 'absensi',
        badge: 'SDM & Shift',
        summary: 'Self-service clock-in karyawan dengan kamera serta persetujuan izin oleh owner/manager.',
        steps: [
            'Clock-In Karyawan: Karyawan membuka menu /absensi, mengizinkan akses kamera, dan menekan tombol Masuk (Clock-in).',
            'Pengajuan Izin / Sakit: Karyawan yang berhalangan hadir mengisi form pengajuan izin di /absensi/izin disertai surat keterangan.',
            'Persetujuan Owner / Manager: Owner membuka /absensi/admin untuk mereview pengajuan izin, lalu menekan tombol "Setujui" atau "Tolak" pada modal konfirmasi pop-up.',
            'Rekap Jam Kerja: Laporan kehadiran dan keterlambatan dapat diekspor langsung ke file Excel.'
        ],
        link: { label: 'Buka Rekap Absensi', url: '/absensi/admin' }
    },
    {
        id: 'laporan',
        title: '9. Laporan Keuangan, Omzet & Ekspor Pembukuan',
        iconName: 'laporan',
        badge: 'Keuangan',
        summary: 'Analisis omzet harian, estimasi laba kotor, performa menu, dan ekspor PDF/Excel.',
        steps: [
            'Laporan Penjualan Harian: Buka /laporan/harian untuk memantau total omzet kotor, total transaksi, rata-rata belanja (AOV), dan metode bayar terpopuler.',
            'Laporan Performa Produk: Buka /laporan/produk untuk melihat menu terlaris (Star products) dan kontribusi laba kotor setiap resep.',
            'Ekspor Pembukuan: Gunakan tombol "Ekspor Excel" atau "Cetak PDF" untuk arsip pembukuan bulanan kafe.'
        ],
        link: { label: 'Buka Laporan Harian', url: '/laporan/harian' }
    }
];

// ── Default Glossary Items ──
const DEFAULT_GLOSSARY_ITEMS: GlossaryItem[] = [
    {
        id: 'omzet',
        term: 'Omzet / Gross Revenue',
        category: 'keuangan',
        categoryLabel: 'Keuangan & Laporan',
        shortDef: 'Total seluruh penerimaan uang kotor dari penjualan sebelum dikurangi modal atau biaya apa pun.',
        formula: 'Total Pembayaran Semua Transaksi Berhasil (Paid)',
        detail: 'Omzet mencerminkan skala volume penjualan kafe Anda. Angka ini belum memperhitungkan modal bahan baku, gaji karyawan, sewa ruko, atau diskon promosi.',
        example: 'Jika kafe menjual 100 cup Kopi Susu seharga Rp 22.000, maka Omzet hari itu adalah Rp 2.200.000.'
    },
    {
        id: 'hpp',
        term: 'HPP (Harga Pokok Penjualan) / COGS',
        category: 'keuangan',
        categoryLabel: 'Keuangan & Laporan',
        shortDef: 'Biaya bahan baku langsung yang dibutuhkan untuk membuat 1 porsi menu makanan atau minuman.',
        formula: 'Biaya Biji Kopi + Susu + Gula Aren + Cup + Straw (per porsi)',
        detail: 'HPP sangat krusial untuk menentukan margin keuntungan. Idealnya, persentase HPP minuman kopi di kafe modern berkisar antara 25% - 35% dari harga jual.',
        example: '1 cup Kopi Susu dijual Rp 22.000 dengan modal biji kopi Rp 3.000, susu Rp 4.000, gula Rp 500, dan cup Rp 1.000. Maka HPP adalah Rp 8.500.'
    },
    {
        id: 'laba_kotor',
        term: 'Laba Kotor (Gross Profit)',
        category: 'keuangan',
        categoryLabel: 'Keuangan & Laporan',
        shortDef: 'Selisih keuntungan langsung dari penjualan setelah dikurangi HPP bahan baku yang terpakai.',
        formula: 'Omzet Penjualan - Total HPP Bahan Baku',
        detail: 'Laba kotor menunjukkan seberapa efisien resep dan penetapan harga jual menu Anda sebelum dibebani biaya sewa, listrik, dan gaji tim.',
        example: 'Omzet Rp 2.200.000 dikurangi Total HPP Rp 850.000 menghasilkan Laba Kotor sebesar Rp 1.350.000 (Margin ~61%).'
    },
    {
        id: 'laba_bersih',
        term: 'Laba Bersih (Net Profit)',
        category: 'keuangan',
        categoryLabel: 'Keuangan & Laporan',
        shortDef: 'Keuntungan riil akhir yang dibawa pulang setelah laba kotor dikurangi seluruh beban operasional.',
        formula: 'Laba Kotor - Biaya Operasional (Gaji + Listrik + Sewa + Wifi + Maintenance)',
        detail: 'Angka ini adalah ukuran kesehatan bisnis yang sesungguhnya. Kafe yang memiliki omzet besar bisa merugi jika biaya operasionalnya tidak terkontrol.',
        example: 'Laba kotor bulanan Rp 45.000.000 dikurangi total operasional Rp 25.000.000 menghasilkan Laba Bersih Rp 20.000.000.'
    },
    {
        id: 'aov',
        term: 'AOV (Average Order Value)',
        category: 'keuangan',
        categoryLabel: 'Keuangan & Laporan',
        shortDef: 'Rata-rata nominal uang yang dibelanjakan pelanggan dalam satu kali nota transaksi.',
        formula: 'Total Omzet ÷ Jumlah Struk / Transaksi Berhasil',
        detail: 'Menaikkan AOV jauh lebih mudah daripada mencari pelanggan baru. Caranya adalah melatih kasir melakukan upselling (misal: menawarkan ekstra shot atau bundling pastry).',
        example: 'Total omzet Rp 3.000.000 dari 120 transaksi menghasilkan AOV Rp 25.000 per struk.'
    },
    {
        id: 'bom',
        term: 'BOM (Bill of Materials) / Formula Resep',
        category: 'inventori',
        categoryLabel: 'Stok & Resep',
        shortDef: 'Daftar rincian kuantitas bahan baku mentah yang diperlukan untuk menghasilkan satu unit produk jadi.',
        formula: 'Gramasi Kopi + Mililiter Susu + Satuan Kemasan (Cup/Sedotan/Lid)',
        detail: 'BOM di Jelang Hari bekerja otomatis memotong stok setiap kali kasir menyelesaikan transaksi pembayaran.',
        example: 'BOM Caramel Macchiato: 18 gr Espresso Beans, 150 ml Fresh Milk, 20 ml Caramel Sauce, 1 pcs Cold Cup.'
    },
    {
        id: 'safety_stock',
        term: 'Safety Stock / Batas Minimum Stok',
        category: 'inventori',
        categoryLabel: 'Stok & Gudang',
        shortDef: 'Batas minimal persediaan bahan baku di gudang sebagai cadangan pengaman mencegah kehabisan bahan.',
        formula: 'Pemakaian Harian Rata-rata × Waktu Kirim Supplier (Lead Time)',
        detail: 'Ketika stok bahan baku menyentuh angka safety stock, sistem Jelang Hari otomatis memunculkan peringatan kuning/merah.',
        example: 'Kafe memakai 2 kg biji kopi per hari dan pengiriman supplier butuh 3 hari, maka Safety Stock diset pada 6 kg.'
    },
    {
        id: 'kds_term',
        term: 'KDS (Kitchen & Bar Display System)',
        category: 'operasional',
        categoryLabel: 'Operasional & KDS',
        shortDef: 'Layar monitor digital interaktif tanpa kertas di area dapur atau bar barista untuk memantau tiket antrean.',
        detail: 'Menggantikan tiket kertas termal yang mudah hilang atau terkena tumpahan air kopi. Menampilkan durasi timer tiap tiket secara real-time.',
        example: 'Barista melihat pesanan Meja 03 di layar tablet KDS, menekan tombol "Mulai Proses", lalu menekan "Selesai" saat minuman siap diantar.'
    },
    {
        id: 'void',
        term: 'Void Transaksi (Pembatalan Struk)',
        category: 'pos_crm',
        categoryLabel: 'POS & Kasir',
        shortDef: 'Pembatalan transaksi resmi yang telah tersimpan karena kesalahan input kasir atau pembatalan tamu.',
        detail: 'Fitur Void di Jelang Hari mengembalikan nomor pesanan dan mencatat alasan pembatalan agar riwayat pembukuan tetap transparan dan bebas manipulasi kasir.',
        example: 'Pelanggan salah pesan lalu membatalkan sebelum pesanan diproses di bar, kasir melakukan void transaksi.'
    },
    {
        id: 'shift_kasir',
        term: 'Shift Kasir & Petty Cash',
        category: 'pos_crm',
        categoryLabel: 'POS & Kasir',
        shortDef: 'Sesi jam kerja kasir yang dimulai dengan modal awal uang kembalian (petty cash) dan ditutup dengan setoran fisik.',
        detail: 'Shift kasir memastikan akuntabilitas uang tunai di laci kas. Saat tutup shift, sistem membandingkan total uang tunai yang seharusnya ada dengan uang fisik yang dihitung kasir.',
        example: 'Kasir membuka shift dengan petty cash Rp 200.000. Saat tutup shift, total tunai Rp 1.450.000 dihitung dan diserahterimakan.'
    },
    {
        id: 'loyalty_point',
        term: 'Sistem Poin Loyalitas & CRM',
        category: 'pos_crm',
        categoryLabel: 'CRM & Member',
        shortDef: 'Poin reward yang dikumpulkan pelanggan dari setiap transaksi belanja untuk ditukarkan potongan harga.',
        formula: '1 Poin per kelipatan belanja Rp 10.000',
        detail: 'Pelanggan cukup menyebutkan nomor WhatsApp di kasir atau memindai QR Code member dari portal /user/dashboard. Poin ini mendorong retensi tamu agar datang kembali.',
        example: 'Pelanggan belanja Rp 50.000 mendapatkan 5 poin. Saat terkumpul 50 poin, dapat ditukar voucher diskon Rp 25.000.'
    },
    {
        id: 'service_charge',
        term: 'Service Charge & Pajak Restoran (PB1)',
        category: 'keuangan',
        categoryLabel: 'Keuangan & Laporan',
        shortDef: 'Biaya layanan (service fee) dan pajak daerah restoran (biasanya 10%) yang ditambahkan ke nota pelanggan.',
        detail: 'Pengaturan persentase service charge dan pajak dapat diatur dengan mudah melalui menu Pengaturan Sistem di akun Owner.',
        example: 'Pesanan Rp 100.000 + Pajak 10% (Rp 10.000) = Total bayar Rp 110.000.'
    }
];

function getModuleIcon(iconName?: string) {
    switch (iconName) {
        case 'bot': return Bot;
        case 'qr': return QrCode;
        case 'calendar': return CalendarRange;
        case 'pos': return ShoppingBag;
        case 'kds': return Tv;
        case 'stock': return Package;
        case 'crm': return Users;
        case 'absensi': return CalendarCheck;
        case 'laporan': return FileSpreadsheet;
        default: return BookOpen;
    }
}

export default function HelpCenterModal({ isOpen, onClose, initialTab = 'tutorial' }: Props) {
    const [activeTab, setActiveTab] = useState<'tutorial' | 'glossary'>(initialTab);
    const [glossarySearch, setGlossarySearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedTutorial, setExpandedTutorial] = useState<string | null>('kasir');

    // ── Content State (Editable) ──
    const [tutorialModules, setTutorialModules] = useState<TutorialModule[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('jh_custom_panduan_modules');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                } catch (e) {}
            }
        }
        return DEFAULT_TUTORIAL_MODULES;
    });

    const [glossaryItems, setGlossaryItems] = useState<GlossaryItem[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('jh_custom_panduan_glossary');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                } catch (e) {}
            }
        }
        return DEFAULT_GLOSSARY_ITEMS;
    });

    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editingTutorial, setEditingTutorial] = useState<TutorialModule | null>(null);
    const [isNewTutorial, setIsNewTutorial] = useState<boolean>(false);
    const [editingGlossary, setEditingGlossary] = useState<GlossaryItem | null>(null);
    const [isNewGlossary, setIsNewGlossary] = useState<boolean>(false);

    // Confirmation & Alert Modal States
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'tutorial' | 'glossary'; id: string; name: string } | null>(null);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Initial Load from backend API if available
    useEffect(() => {
        if (!isOpen) return;
        fetch('/panduan/data')
            .then(res => res.json())
            .then(res => {
                if (res.success && res.data) {
                    if (Array.isArray(res.data.modules) && res.data.modules.length > 0) {
                        setTutorialModules(res.data.modules);
                        localStorage.setItem('jh_custom_panduan_modules', JSON.stringify(res.data.modules));
                    }
                    if (Array.isArray(res.data.glossary) && res.data.glossary.length > 0) {
                        setGlossaryItems(res.data.glossary);
                        localStorage.setItem('jh_custom_panduan_glossary', JSON.stringify(res.data.glossary));
                    }
                }
            })
            .catch(() => {});
    }, [isOpen]);

    // Save changes to backend and localStorage
    const handleSaveToServer = async (customMods?: TutorialModule[], customGlos?: GlossaryItem[]) => {
        const modsToSave = customMods || tutorialModules;
        const glosToSave = customGlos || glossaryItems;

        setIsSaving(true);
        localStorage.setItem('jh_custom_panduan_modules', JSON.stringify(modsToSave));
        localStorage.setItem('jh_custom_panduan_glossary', JSON.stringify(glosToSave));

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/panduan/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    panduan: {
                        modules: modsToSave,
                        glossary: glosToSave,
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                setSaveStatus('Buku panduan & glosarium berhasil disimpan ke server!');
                setTimeout(() => setSaveStatus(''), 3000);
            }
        } catch (e) {
            setSaveStatus('Tersimpan di peramban lokal!');
            setTimeout(() => setSaveStatus(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    // Filtered Glossary
    const filteredGlossary = useMemo(() => {
        return glossaryItems.filter(item => {
            const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchSearch = glossarySearch.trim() === '' ||
                item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
                item.shortDef.toLowerCase().includes(glossarySearch.toLowerCase()) ||
                item.detail.toLowerCase().includes(glossarySearch.toLowerCase());
            return matchCategory && matchSearch;
        });
    }, [glossaryItems, glossarySearch, selectedCategory]);

    // ── Tutorial Action Handlers ──
    const handleOpenAddTutorial = () => {
        setEditingTutorial({
            id: `mod_${Date.now()}`,
            title: '',
            badge: 'SOP Toko',
            summary: '',
            steps: ['Langkah 1: Siapkan peralatan kerja', 'Langkah 2: Jalankan proses sesuai standar'],
            link: { label: 'Buka Menu Terkait', url: '/dashboard' },
            iconName: 'book'
        });
        setIsNewTutorial(true);
    };

    const handleSaveTutorial = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTutorial || !editingTutorial.title.trim()) return;

        let updated: TutorialModule[];
        if (isNewTutorial) {
            updated = [...tutorialModules, editingTutorial];
        } else {
            updated = tutorialModules.map(m => m.id === editingTutorial.id ? editingTutorial : m);
        }

        setTutorialModules(updated);
        setEditingTutorial(null);
        setIsNewTutorial(false);
        handleSaveToServer(updated, glossaryItems);
    };

    // ── Glossary Action Handlers ──
    const handleOpenAddGlossary = () => {
        setEditingGlossary({
            id: `glo_${Date.now()}`,
            term: '',
            category: 'operasional',
            categoryLabel: 'Operasional',
            shortDef: '',
            formula: '',
            detail: '',
            example: ''
        });
        setIsNewGlossary(true);
    };

    const handleSaveGlossary = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGlossary || !editingGlossary.term.trim()) return;

        let categoryLabel = 'Operasional';
        if (editingGlossary.category === 'keuangan') categoryLabel = 'Keuangan & Laporan';
        else if (editingGlossary.category === 'inventori') categoryLabel = 'Stok & Gudang';
        else if (editingGlossary.category === 'pos_crm') categoryLabel = 'POS & Kasir';

        const prepared = { ...editingGlossary, categoryLabel };

        let updated: GlossaryItem[];
        if (isNewGlossary) {
            updated = [...glossaryItems, prepared];
        } else {
            updated = glossaryItems.map(g => g.id === prepared.id ? prepared : g);
        }

        setGlossaryItems(updated);
        setEditingGlossary(null);
        setIsNewGlossary(false);
        handleSaveToServer(tutorialModules, updated);
    };

    // ── Delete Confirmation ──
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'tutorial') {
            const updated = tutorialModules.filter(m => m.id !== deleteTarget.id);
            setTutorialModules(updated);
            handleSaveToServer(updated, glossaryItems);
        } else {
            const updated = glossaryItems.filter(g => g.id !== deleteTarget.id);
            setGlossaryItems(updated);
            handleSaveToServer(tutorialModules, updated);
        }

        setDeleteTarget(null);
    };

    // ── Reset to Default Confirmation ──
    const handleConfirmReset = () => {
        setTutorialModules(DEFAULT_TUTORIAL_MODULES);
        setGlossaryItems(DEFAULT_GLOSSARY_ITEMS);
        localStorage.removeItem('jh_custom_panduan_modules');
        localStorage.removeItem('jh_custom_panduan_glossary');
        handleSaveToServer(DEFAULT_TUTORIAL_MODULES, DEFAULT_GLOSSARY_ITEMS);
        setIsResetConfirmOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden my-auto max-h-[88vh] transition-colors">
                
                {/* ── 1. MODAL HEADER ── */}
                <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-md flex-shrink-0">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-white">
                                    Pusat Panduan &amp; Glosarium Kafe
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/60">
                                    Resmi Jelang Hari
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Panduan SOP langkah-demi-langkah &amp; kamus istilah finansial toko
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {/* Tab Switcher Pills */}
                        <div className="flex items-center p-1 bg-zinc-200/70 dark:bg-zinc-800 rounded-xl text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setActiveTab('tutorial')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                                    activeTab === 'tutorial'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                                }`}
                            >
                                <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Tutorial ({tutorialModules.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('glossary')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                                    activeTab === 'glossary'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                                }`}
                            >
                                <Coins className="w-3.5 h-3.5 text-amber-500" />
                                <span>Glosarium ({glossaryItems.length})</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="Tutup (Esc)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ── BANNER EDIT MODE (KETIKA AKTIF) ── */}
                {isEditMode && (
                    <div className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs flex-wrap">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                            <FileEdit className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Mode Edit Panduan &amp; SOP Aktif. Anda dapat menambah, mengubah, atau merapikan modul dan istilah toko.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsResetConfirmOpen(true)}
                                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold flex items-center gap-1 border border-zinc-300 dark:border-zinc-700"
                            >
                                <RotateCcw className="w-3 h-3 text-amber-600" />
                                <span>Reset Standar</span>
                            </button>
                            {activeTab === 'tutorial' ? (
                                <button
                                    type="button"
                                    onClick={handleOpenAddTutorial}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Tambah Modul Panduan</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleOpenAddGlossary}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Tambah Istilah Glosarium</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── 2. MODAL BODY (SCROLLABLE) ── */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    
                    {/* ════ TAB 1: TUTORIAL OPERASIONAL LENGKAP ════ */}
                    {activeTab === 'tutorial' && (
                        <div className="space-y-4">
                            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                                    <span className="font-bold">Panduan Operasional Digital Jelang Hari:</span> Seluruh modul terhubung secara real-time—pesanan di kasir otomatis memotong stok bahan baku dan mengirim tiket ke layar KDS dapur tanpa penundaan.
                                </div>
                            </div>

                            {/* Tutorial Modules Accordion */}
                            {tutorialModules.map((mod) => {
                                const isExpanded = expandedTutorial === mod.id;
                                const IconComponent = getModuleIcon(mod.iconName);
                                return (
                                    <div
                                        key={mod.id}
                                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs transition"
                                    >
                                        <div className="flex items-center justify-between p-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedTutorial(isExpanded ? null : mod.id)}
                                                className="flex-1 flex items-center gap-3 min-w-0 text-left"
                                            >
                                                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center flex-shrink-0">
                                                    <IconComponent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-xs sm:text-sm text-zinc-950 dark:text-white truncate">
                                                            {mod.title}
                                                        </h3>
                                                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                            {mod.badge}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                                        {mod.summary}
                                                    </p>
                                                </div>
                                            </button>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {isEditMode && (
                                                    <div className="flex items-center gap-1 mr-1">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingTutorial({ ...mod });
                                                                setIsNewTutorial(false);
                                                            }}
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                                                            title="Edit Modul Panduan Ini"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteTarget({ type: 'tutorial', id: mod.id, name: mod.title });
                                                            }}
                                                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                                            title="Hapus Modul Panduan Ini"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedTutorial(isExpanded ? null : mod.id)}
                                                    className="p-1 text-zinc-400 hover:text-zinc-600"
                                                >
                                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-4 sm:p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3 bg-zinc-50/30 dark:bg-zinc-900/40">
                                                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                                    Tahapan Langkah demi Langkah:
                                                </p>
                                                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                                                    {mod.steps.map((st, sIdx) => (
                                                        <li key={sIdx} className="flex items-start gap-2.5">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                            <span className="leading-relaxed">{st}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                {mod.link && mod.link.url && (
                                                    <div className="pt-2">
                                                        <Link
                                                            href={mod.link.url}
                                                            onClick={onClose}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-950 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 hover:opacity-90 transition shadow-xs"
                                                        >
                                                            <span>{mod.link.label || 'Buka Halaman'}</span>
                                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ════ TAB 2: BUKU KAMUS ISTILAH KAFE & KEUANGAN ════ */}
                    {activeTab === 'glossary' && (
                        <div className="space-y-4">
                            {/* Search & Category Filter */}
                            <div className="space-y-3 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={glossarySearch}
                                        onChange={(e) => setGlossarySearch(e.target.value)}
                                        placeholder="Cari istilah kafe, keuangan, HPP, omzet, KDS..."
                                        className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                    {[
                                        { id: 'all', label: 'Semua Kategori' },
                                        { id: 'keuangan', label: 'Keuangan & Laporan' },
                                        { id: 'operasional', label: 'Operasional' },
                                        { id: 'inventori', label: 'Stok & Gudang' },
                                        { id: 'pos_crm', label: 'POS & Kasir' }
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                                                selectedCategory === cat.id
                                                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-2xs'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Glossary List */}
                            <div className="space-y-3">
                                {filteredGlossary.length === 0 ? (
                                    <div className="py-12 text-center text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                                        <Coins className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                                        <p className="text-xs font-semibold">Tidak ada istilah yang cocok dengan "{glossarySearch}".</p>
                                        <p className="text-[11px] text-zinc-500 mt-0.5">Coba gunakan kata kunci seperti HPP, Omzet, AOV, atau BOM.</p>
                                    </div>
                                ) : (
                                    filteredGlossary.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5 transition hover:border-zinc-300 dark:hover:border-zinc-700 relative"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white">
                                                        {item.term}
                                                    </h3>
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                                        {item.categoryLabel}
                                                    </span>
                                                </div>

                                                {isEditMode && (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingGlossary({ ...item });
                                                                setIsNewGlossary(false);
                                                            }}
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                                            title="Edit Istilah Glosarium Ini"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteTarget({ type: 'glossary', id: item.id, name: item.term })}
                                                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                                            title="Hapus Istilah Ini"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                                                {item.shortDef}
                                            </p>

                                            {item.formula && (
                                                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 font-mono text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                                        Rumus
                                                    </span>
                                                    <span className="font-semibold">{item.formula}</span>
                                                </div>
                                            )}

                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                {item.detail}
                                            </p>

                                            {item.example && (
                                                <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400 italic">
                                                    <span className="font-semibold not-italic text-emerald-600 dark:text-emerald-400">Contoh Kasus:</span>
                                                    <span>{item.example}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── 3. MODAL FOOTER ── */}
                <div className="p-3.5 sm:px-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px] text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">ESC</kbd>
                        <span>Tutup modal panduan</span>
                        {saveStatus && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-2 animate-in fade-in">
                                ✓ {saveStatus}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditMode && (
                            <button
                                type="button"
                                onClick={() => handleSaveToServer()}
                                disabled={isSaving}
                                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs text-xs flex items-center gap-1.5"
                            >
                                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                <span>Simpan Perubahan</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold transition shadow-xs text-xs"
                        >
                            Tutup
                        </button>
                    </div>
                </div>

                {/* ── MODAL EDIT / TAMBAH TUTORIAL MODULE ── */}
                {editingTutorial && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white">
                                        {isNewTutorial ? 'Tambah Modul Panduan Baru' : 'Edit Modul Panduan'}
                                    </h3>
                                    <p className="text-[11px] text-zinc-500">
                                        Konfigurasi judul, ringkasan, dan tahapan SOP langkah demi langkah
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingTutorial(null)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveTutorial} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Judul Modul
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: 10. SOP Penanganan Bahan Baku Segar"
                                        value={editingTutorial.title}
                                        onChange={(e) => setEditingTutorial({ ...editingTutorial, title: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                            Badge Kategori
                                        </label>
                                        <input
                                            type="text"
                                            value={editingTutorial.badge}
                                            onChange={(e) => setEditingTutorial({ ...editingTutorial, badge: e.target.value })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                            Ikon Modul
                                        </label>
                                        <select
                                            value={editingTutorial.iconName || 'book'}
                                            onChange={(e) => setEditingTutorial({ ...editingTutorial, iconName: e.target.value })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold"
                                        >
                                            <option value="book">Buku Panduan</option>
                                            <option value="bot">AI Copilot</option>
                                            <option value="qr">QR Code Meja</option>
                                            <option value="calendar">Reservasi</option>
                                            <option value="pos">Kasir POS</option>
                                            <option value="kds">Kitchen / Barista</option>
                                            <option value="stock">Stok & Gudang</option>
                                            <option value="crm">CRM & Member</option>
                                            <option value="absensi">Presensi</option>
                                            <option value="laporan">Laporan Keuangan</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Ringkasan Singkat (Summary)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={editingTutorial.summary}
                                        onChange={(e) => setEditingTutorial({ ...editingTutorial, summary: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                                    />
                                </div>

                                {/* Step by step editor */}
                                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                            Tahapan Langkah-Langkah SOP
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setEditingTutorial({
                                                ...editingTutorial,
                                                steps: [...editingTutorial.steps, `Langkah ${editingTutorial.steps.length + 1}: `]
                                            })}
                                            className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah Langkah</span>
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                                        {editingTutorial.steps.map((st, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[10px] flex items-center justify-center shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={st}
                                                    onChange={(e) => {
                                                        const copy = [...editingTutorial.steps];
                                                        copy[idx] = e.target.value;
                                                        setEditingTutorial({ ...editingTutorial, steps: copy });
                                                    }}
                                                    className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={editingTutorial.steps.length <= 1}
                                                    onClick={() => {
                                                        const copy = editingTutorial.steps.filter((_, sIdx) => sIdx !== idx);
                                                        setEditingTutorial({ ...editingTutorial, steps: copy });
                                                    }}
                                                    className="p-1.5 text-zinc-400 hover:text-rose-600 disabled:opacity-30"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                            Label Tombol Tautan (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingTutorial.link?.label || ''}
                                            onChange={(e) => setEditingTutorial({
                                                ...editingTutorial,
                                                link: { label: e.target.value, url: editingTutorial.link?.url || '/dashboard' }
                                            })}
                                            placeholder="Contoh: Buka Menu Kasir"
                                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                            URL Halaman (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingTutorial.link?.url || ''}
                                            onChange={(e) => setEditingTutorial({
                                                ...editingTutorial,
                                                link: { label: editingTutorial.link?.label || 'Buka Halaman', url: e.target.value }
                                            })}
                                            placeholder="Contoh: /kasir"
                                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setEditingTutorial(null)}
                                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Simpan Modul</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── MODAL EDIT / TAMBAH GLOSARIUM ── */}
                {editingGlossary && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white">
                                        {isNewGlossary ? 'Tambah Istilah Glosarium' : 'Edit Istilah Glosarium'}
                                    </h3>
                                    <p className="text-[11px] text-zinc-500">
                                        Kamus istilah finansial, operasional, dan POS kafe
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingGlossary(null)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveGlossary} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Nama Istilah (Term)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Net Margin / Laba Bersih"
                                        value={editingGlossary.term}
                                        onChange={(e) => setEditingGlossary({ ...editingGlossary, term: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Kategori
                                    </label>
                                    <select
                                        value={editingGlossary.category}
                                        onChange={(e) => setEditingGlossary({ ...editingGlossary, category: e.target.value as any })}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold"
                                    >
                                        <option value="keuangan">Keuangan & Laporan</option>
                                        <option value="operasional">Operasional</option>
                                        <option value="inventori">Stok & Gudang</option>
                                        <option value="pos_crm">POS & Kasir</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Definisi Singkat (Short Definition)
                                    </label>
                                    <textarea
                                        rows={2}
                                        required
                                        value={editingGlossary.shortDef}
                                        onChange={(e) => setEditingGlossary({ ...editingGlossary, shortDef: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Rumus / Formula Perhitungan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={editingGlossary.formula || ''}
                                        onChange={(e) => setEditingGlossary({ ...editingGlossary, formula: e.target.value })}
                                        placeholder="Contoh: Omzet - Total HPP Bahan Baku"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Penjelasan Rinci (Detail)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={editingGlossary.detail}
                                        onChange={(e) => setEditingGlossary({ ...editingGlossary, detail: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Contoh Kasus Nyata
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={editingGlossary.example}
                                        onChange={(e) => setEditingGlossary({ ...editingGlossary, example: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs italic"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setEditingGlossary(null)}
                                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Simpan Istilah</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── MODAL KONFIRMASI HAPUS (CUSTOM MODAL DIALOG) ── */}
                {deleteTarget && (
                    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                        Hapus {deleteTarget.type === 'tutorial' ? 'Modul' : 'Istilah'}?
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Apakah Anda yakin ingin menghapus "{deleteTarget.name}"?
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Ya, Hapus</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MODAL KONFIRMASI RESET KE STANDAR ── */}
                {isResetConfirmOpen && (
                    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <RotateCcw className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                        Kembalikan Panduan Standar?
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Semua modul tutorial dan glosarium kustom akan direset ke konten standar resmi Jelang Hari.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsResetConfirmOpen(false)}
                                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmReset}
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Ya, Reset Standar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
