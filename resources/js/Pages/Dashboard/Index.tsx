import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import FormattedAiText from '@/Components/FormattedAiText';
import { rupiah } from '@/lib/format';
import {
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Wallet,
    ArrowUpRight,
    Clock,
    Receipt,
    Plus,
    Sparkles,
    Layers,
    FileSpreadsheet,
    Bot,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Calculator,
    Minus,
    X,
    ExternalLink,
    HelpCircle,
    Check,
    Send,
    Package,
    Tv,
    Flame,
    Coffee,
    Utensils,
    AlertTriangle
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';

interface DashboardProps {
    stats: {
        penjualan_hari_ini: number;
        transaksi_hari_ini: number;
        avg_order: number;
        laba_kotor: number;
    };
    chart_sales: Array<{
        tanggal: string;
        total: number;
    }>;
    transaksi_terbaru: Array<{
        id: number;
        no_struk: string;
        pelanggan: string;
        total: number;
        metode_bayar: string;
        status: string;
        waktu: string;
    }>;
    topProducts?: Array<{
        nama_produk: string;
        total_terjual: number;
        total_omset: number;
    }>;
    lowStockList?: Array<{
        id: number;
        nama: string;
        stok: number;
        min_stok: number;
        satuan: string;
    }>;
}

export default function Index({ 
    stats, 
    chart_sales, 
    transaksi_terbaru,
    topProducts = [],
    lowStockList = []
}: DashboardProps) {
    // ── Jelang AI Store Copilot State (Percakapan Mandiri & Interaktif) ──
    interface ChatMessage {
        id: string;
        sender: 'user' | 'ai';
        text: string;
        statusBadge?: string;
        actionLink?: { label: string; url: string } | null;
        timestamp: string;
    }

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            sender: 'ai',
            text: `Jelang Hari Copilot siap membantu. Saat ini tercatat omset Rp ${Number(stats?.penjualan_hari_ini || 0).toLocaleString('id-ID')} (${stats?.transaksi_hari_ini || 0} nota, AOV Rp ${Number(stats?.avg_order || 0).toLocaleString('id-ID')}). Silakan tanyakan data keuangan, bahan baku, promo, antrean KDS, atau ketik kata kunci yang Anda butuhkan.`,
            statusBadge: 'Operasional Toko',
            actionLink: { label: 'Buka POS Kasir', url: '/kasir' },
            timestamp: 'Aktif'
        }
    ]);
    const [copilotPrompt, setCopilotPrompt] = useState('');
    const [copilotLoading, setCopilotLoading] = useState(false);
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll ke pesan terbaru
    React.useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, copilotLoading]);

    // ── Interactive Margin Calculator Modal ──
    const [isCalcOpen, setIsCalcOpen] = useState(false);
    const [calcHargaJual, setCalcHargaJual] = useState<number>(25000);
    const [calcHpp, setCalcHpp] = useState<number>(8500);

    const calcLabaNominal = Math.max(0, calcHargaJual - calcHpp);
    const calcMarginPercent = calcHargaJual > 0 ? Math.round((calcLabaNominal / calcHargaJual) * 100) : 0;
    const calcProyeksi100Cup = calcLabaNominal * 100;

    // ── Interactive Petty Cash Expense Modal ──
    const [isExpenseOpen, setIsExpenseOpen] = useState(false);
    const [expenseNama, setExpenseNama] = useState('');
    const [expenseNominal, setExpenseNominal] = useState<number>(20000);
    const [expenseSaved, setExpenseSaved] = useState(false);

    const handleSaveExpense = (e: React.FormEvent) => {
        e.preventDefault();
        setExpenseSaved(true);
        setTimeout(() => {
            setExpenseSaved(false);
            setIsExpenseOpen(false);
            setExpenseNama('');
        }, 1200);
    };

    // ── Jelang AI Query Handler (Mengobrol & Audit Operasional) ──
    const generateDashboardFallback = (rawQuery: string): { reply: string; statusBadge?: string; actionLink?: { label: string; url: string } } => {
        const q = rawQuery.toLowerCase();
        const salesFmt = rupiah(stats?.penjualan_hari_ini || 0);
        const aovFmt = rupiah(stats?.avg_order || 0);
        const notaFmt = stats?.transaksi_hari_ini || 0;

        if (q.includes('void') || q.includes('batal')) {
            return {
                reply: `Definisi & Prosedur Void:\n• Void adalah pembatalan transaksi yang sudah dicatat dalam sistem.\n• Cara Melakukan: Buka POS Kasir (/kasir) -> Riwayat Transaksi -> pilih pesanan terkait -> klik Batalkan/Void dan sertakan alasan.\n• Tindakan void tercatat pada log audit kasir untuk keamanan pembukuan.`,
                statusBadge: 'Glosarium Bisnis',
                actionLink: { label: 'Buka Riwayat Kasir', url: '/kasir/riwayat' }
            };
        }

        if (q.includes('hpp') || q.includes('cogs')) {
            return {
                reply: `Definisi & Perhitungan HPP:\n• HPP (Harga Pokok Penjualan) adalah biaya bahan mentah langsung untuk menghasilkan satu porsi menu F&B.\n• Di Jelang Hari, sistem menghitung HPP secara otomatis berdasarkan takaran di menu Resep Produk (/resep) setiap kali transaksi selesai.`,
                statusBadge: 'Glosarium Finansial',
                actionLink: { label: 'Kelola Resep BOM', url: '/resep' }
            };
        }

        if (q.includes('aov')) {
            return {
                reply: `Definisi & Analisis AOV:\n• AOV (Average Order Value) adalah rata-rata nominal belanja per struk kasir (Omzet / Total Nota).\n• Data Hari Ini: AOV saat ini sebesar ${aovFmt} dari ${notaFmt} transaksi.\n• Dorong upselling kasir (extra shot/oat milk) untuk menaikkan AOV.`,
                statusBadge: 'Glosarium Finansial',
                actionLink: { label: 'Lihat Laporan Harian', url: '/laporan/harian' }
            };
        }

        if (q.includes('kas keluar') || q.includes('pengeluaran') || q.includes('petty cash')) {
            return {
                reply: `Panduan Catat Kas Keluar (Petty Cash):\n1. Klik tombol 'Kas Keluar' di Dashboard atau Kasir.\n2. Masukkan keterangan belanja (misal: Beli Es Kristal, Galon, Gas) dan nominal rupiahnya.\n3. Simpan agar saldo uang tunai fisik saat tutup shift tetap seimbang.`,
                statusBadge: 'Panduan Pengeluaran',
                actionLink: { label: 'Input Kas Keluar', url: '/dashboard' }
            };
        }

        if (q.includes('absen') || q.includes('presensi') || q.includes('clock in') || q.includes('clock out') || q.includes('izin')) {
            return {
                reply: `Panduan Presensi Staf:\n1. Buka menu Presensi (/absensi).\n2. Masukkan PIN 6 digit staf terdaftar.\n3. Klik 'Clock In' saat mulai tugas dan 'Clock Out' saat selesai.\n4. Ajukan izin atau cuti sakit melalui formulir Pengajuan Izin.`,
                statusBadge: 'Panduan Absensi',
                actionLink: { label: 'Buka Menu Presensi', url: '/absensi' }
            };
        }

        if (q.includes('user') || q.includes('tambah kasir') || q.includes('role') || q.includes('pin')) {
            return {
                reply: `Panduan Pengelolaan Akun Staf:\n1. Buka menu Kelola Pengguna (/users) dengan akun Owner atau Manajer.\n2. Klik 'Tambah Pengguna Baru' dan tentukan role (Kasir, Barista, Kitchen, dll).\n3. Buat PIN 6 digit staf untuk otentikasi cepat saat shift kasir dan presensi.`,
                statusBadge: 'Panduan Pengguna',
                actionLink: { label: 'Kelola Akun Pengguna', url: '/users' }
            };
        }

        if (q.includes('struk') || q.includes('print')) {
            return {
                reply: `Panduan Cetak Ulang Struk Kasir:\n1. Buka POS Kasir (/kasir) -> klik tombol 'Riwayat Transaksi'.\n2. Pilih pesanan yang ingin dicetak ulang.\n3. Klik ikon Struk/Printer lalu pilih opsi Cetak Thermal atau kirim Struk Digital.`,
                statusBadge: 'Panduan Struk',
                actionLink: { label: 'Buka Riwayat Kasir', url: '/kasir/riwayat' }
            };
        }

        if (q.includes('kds') || q.includes('dapur') || q.includes('kitchen') || q.includes('barista')) {
            return {
                reply: `Panduan Kitchen & Bar Display System (KDS):\n1. Tiket pesanan baru otomatis muncul di layar KDS bar dan dapur.\n2. Klik tiket untuk mengubah status (Menunggu -> Diproses -> Selesai).\n3. Pembatalan pesanan dapat dilakukan di KDS jika pesanan belum diproduksi.`,
                statusBadge: 'Panduan KDS',
                actionLink: { label: 'Buka KDS Bar & Dapur', url: '/kds' }
            };
        }

        if (q.includes('resep') || q.includes('bom')) {
            return {
                reply: `Panduan Pengaturan Resep BOM:\n1. Buka menu Resep (/resep) lalu pilih menu produk.\n2. Masukkan takaran bahan baku (misal 18g Biji Kopi, 150ml Susu).\n3. Simpan. Setiap transaksi kasir akan langsung memotong stok bahan di gudang secara otomatis.`,
                statusBadge: 'Panduan Resep',
                actionLink: { label: 'Kelola Resep Produk', url: '/resep' }
            };
        }

        if (q.includes('cerita') || q.includes('curhat') || q.includes('capek') || q.includes('lelah') || q.includes('sepi')) {
            return {
                reply: `Evaluasi Operasional:\n\nMenjalankan coffee shop membutuhkan stamina dan konsistensi tinggi. Pada jam low-hour, manfaatkan waktu untuk persiapan batching sirup/susu, kalibrasi grinder, atau aktivasi promo Happy Hour sore untuk menarik tamu.`,
                statusBadge: 'Diskusi Operasional',
                actionLink: { label: 'Lihat Laporan Penjualan', url: '/laporan/harian' }
            };
        }

        if (q.includes('komplain') || q.includes('marah') || q.includes('kecewa') || q.includes('salah')) {
            return {
                reply: `Prosedur Penanganan Komplain Tamu (Metode L.A.S.T):\n1. Listen: Dengarkan keluhan tamu tanpa memotong.\n2. Apologize: Minta maaf dengan tulus atas rasa atau waktu tunggu.\n3. Solve: Gantikan pesanan baru dengan prioritas pertama di bar kasir.\n4. Thank: Berterima kasih atas evaluasi untuk menjaga standar Jelang Hari.`,
                statusBadge: 'Resolusi Tamu',
                actionLink: { label: 'Buka KDS Barista', url: '/kds' }
            };
        }

        if (q.includes('promo') || q.includes('strategi') || q.includes('marketing') || q.includes('ide')) {
            return {
                reply: `Strategi Peningkatan Penjualan & AOV:\n• Menu Bundling: Tawarkan paket Kopi Susu + Pastry seharga Rp 38.000 pada jam 15.00 - 18.00.\n• Upselling Kasir: Tawarkan Extra Espresso Shot (+Rp 5.000) atau Upgrade Oat Milk (+Rp 8.000).\n• Happy Hour: Diskon 15% dine-in di jam 13.00 - 15.00 guna mengisi kapasitas meja.`,
                statusBadge: 'Strategi Penjualan',
                actionLink: { label: 'Kelola Promo', url: '/promo' }
            };
        }

        if (q.includes('stok') || q.includes('bahan') || q.includes('gudang') || q.includes('kritis')) {
            return {
                reply: `Pemeriksaan Stok Inventori:\nPastikan biji kopi espresso blend, fresh milk, oat milk, dan cup kemasan berada di atas batas minimum stok operasional demi kelancaran pesanan kasir.`,
                statusBadge: 'Inventori Stok',
                actionLink: { label: 'Cek Stok Gudang', url: '/stok/bahan-baku' }
            };
        }

        if (q.length <= 4 || q.includes('halo') || q.includes('hai') || q === 'p') {
            return {
                reply: `Jelang Hari Copilot siap membantu. Ringkasan operasional terkini:\n• Omset Hari Ini: ${salesFmt} (${notaFmt} transaksi, AOV ${aovFmt})\n• Okupansi Meja: ${metrics?.meja_terisi || 0} dari ${metrics?.total_meja || 0} meja terisi\n• Status Stok: ${metrics?.stok_menipis || 0} bahan mendekati batas minimum\n\nSilakan ajukan pertanyaan seputar tutorial kasir, KDS, stok bahan, resep BOM, laporan keuangan, atau istilah kafe.`,
                statusBadge: 'Operasional Toko',
                actionLink: { label: 'Buka POS Kasir', url: '/kasir' }
            };
        }

        return {
            reply: `Informasi Operasional Toko:\nTopik terkait dapat dikelola melalui navigasi sistem:\n• Kasir & Transaksi: Menu POS Kasir (/kasir)\n• Dapur & Bar: Layar KDS (/kds)\n• Stok & Resep: Menu Gudang (/stok/bahan-baku) dan Resep BOM (/resep)\n• Pembukuan: Menu Laporan (/laporan/harian)\n\nSilakan ajukan pertanyaan lebih spesifik (misal: 'apa itu void?', 'cara input kas keluar', atau 'cara absensi').`,
            statusBadge: 'Bantuan Sistem',
            actionLink: { label: 'Buka POS Kasir', url: '/kasir' }
        };
    };

    const handleAskCopilot = async (customQuery?: string) => {
        const queryToAsk = (customQuery || copilotPrompt).trim();
        if (!queryToAsk || copilotLoading) return;

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: queryToAsk,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages(prev => [...prev, userMsg]);
        setCopilotPrompt('');
        setCopilotLoading(true);

        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
            const res = await fetch('/dashboard/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfMeta?.content || '',
                },
                body: JSON.stringify({ prompt: queryToAsk })
            });

            if (res.ok) {
                const data = await res.json();
                const aiMsg: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    sender: 'ai',
                    text: data.reply || 'Data berhasil dianalisis.',
                    statusBadge: data.status_badge || 'Operasional Toko',
                    actionLink: data.action_link || null,
                    timestamp: data.timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                };
                setChatMessages(prev => [...prev, aiMsg]);
            } else {
                const fallback = generateDashboardFallback(queryToAsk);
                const aiMsg: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    sender: 'ai',
                    text: fallback.reply,
                    statusBadge: fallback.statusBadge || 'Operasional Toko',
                    actionLink: fallback.actionLink || null,
                    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                };
                setChatMessages(prev => [...prev, aiMsg]);
            }
        } catch {
            const fallback = generateDashboardFallback(queryToAsk);
            const aiMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: fallback.reply,
                statusBadge: fallback.statusBadge || 'Operasional Toko',
                actionLink: fallback.actionLink || null,
                timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages(prev => [...prev, aiMsg]);
        } finally {
            setCopilotLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Dashboard Operasional & Analitik - Jelang Hari" />

            {/* ── 1. Header & Rapi Navigation Action Bar ── */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                        Dashboard Operasional &amp; Performa Kafe
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Monitoring analitik omzet, pesanan kasir, performa menu terlaris, dan kecerdasan Jelang AI Store Copilot.
                    </p>
                </div>

                {/* Navigasi Cepat Operasional Toko (Bersih & Taktis) */}
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/kasir"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition text-xs font-bold shadow-md active:scale-95"
                    >
                        <ShoppingBag className="w-4 h-4 text-emerald-400 dark:text-white" />
                        <span>Buka Kasir POS</span>
                    </Link>

                    <Link
                        href="/kds"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition text-xs font-bold shadow-xs active:scale-95"
                        title="Tampilan Antrean Kitchen & Barista"
                    >
                        <Tv className="w-4 h-4 text-amber-500" />
                        <span>Kitchen KDS</span>
                    </Link>

                    <Link
                        href="/transaksi"
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition text-xs font-semibold shadow-xs"
                        title="Riwayat Seluruh Transaksi & Struk"
                    >
                        <Receipt className="w-4 h-4 text-zinc-500" />
                        <span className="hidden sm:inline">Transaksi</span>
                    </Link>

                    <Link
                        href="/stok/bahan-baku"
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition text-xs font-semibold shadow-xs"
                        title="Pantau Sisa Stok Bahan Baku"
                    >
                        <Package className="w-4 h-4 text-zinc-500" />
                        <span className="hidden sm:inline">Stok Bahan</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsCalcOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition text-xs font-semibold shadow-xs"
                        title="Kalkulator Margin Menu"
                    >
                        <Calculator className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="hidden md:inline">Kalkulator Margin</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsExpenseOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition text-xs font-semibold shadow-xs"
                        title="Catat Kas Operasional Keluar"
                    >
                        <Minus className="w-3.5 h-3.5 text-rose-500" />
                        <span className="hidden md:inline">Kas Keluar</span>
                    </button>
                </div>
            </div>

            {/* ── 2. JELANG HARI COPILOT (MANDIRI, MINIMALIS & INTERAKTIF) ── */}
            <div className="mb-7 rounded-2xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-soft dark:shadow-xl relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Copilot Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center text-emerald-800 dark:text-emerald-400 shadow-xs">
                            <Bot className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-zinc-950 dark:text-white">Jelang Hari Copilot</h3>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Asisten cerdas analisis keuangan, stok &amp; operasional toko</p>
                        </div>
                    </div>

                    {/* Live Metrics Ribbon & Clear Chat */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                            <span>Omset: <strong className="text-zinc-950 dark:text-white">{rupiah(stats?.penjualan_hari_ini || 0)}</strong></span>
                            <span className="text-zinc-400 dark:text-zinc-600">•</span>
                            <span>Nota: <strong className="text-zinc-950 dark:text-white">{stats?.transaksi_hari_ini || 0}</strong></span>
                            <span className="text-zinc-400 dark:text-zinc-600">•</span>
                            <span>AOV: <strong className="text-zinc-950 dark:text-white">{rupiah(stats?.avg_order || 0)}</strong></span>
                        </div>

                        {chatMessages.length > 1 && (
                            <button
                                type="button"
                                onClick={() => setChatMessages([chatMessages[0]])}
                                className="px-2 py-1 rounded-lg text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition"
                            >
                                Reset Obrolan
                            </button>
                        )}
                    </div>
                </div>

                {/* Live Chat Message Stream */}
                <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/80 mb-3 scrollbar-thin">
                    {chatMessages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <div
                                key={msg.id}
                                className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                {!isUser && (
                                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                        AI
                                    </div>
                                )}

                                <div
                                    className={`p-3 rounded-2xl text-xs max-w-[90%] sm:max-w-[80%] space-y-2 ${
                                        isUser
                                            ? 'bg-zinc-900 text-white dark:bg-emerald-600 dark:text-white rounded-tr-xs shadow-xs'
                                            : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-xs border border-zinc-200 dark:border-zinc-700 shadow-xs'
                                    }`}
                                >
                                    {/* Status Badge */}
                                    {msg.statusBadge && (
                                        <div className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                            {msg.statusBadge}
                                        </div>
                                    )}

                                    {/* Formatted Content */}
                                    <FormattedAiText text={msg.text} isUser={isUser} />

                                    {/* Action Link Button */}
                                    {msg.actionLink && (
                                        <div className="pt-1.5">
                                            <Link
                                                href={msg.actionLink.url}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-zinc-950 transition shadow-xs"
                                            >
                                                <span>{msg.actionLink.label}</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    )}

                                    <div className={`text-[10px] font-mono text-right ${isUser ? 'text-zinc-300 dark:text-emerald-100' : 'text-zinc-400'}`}>
                                        {msg.timestamp}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {copilotLoading && (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 py-1 pl-8">
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            <span>Jelang Hari Copilot sedang memproses...</span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Quick Query Chips (Bebas Emoji) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs mb-2">
                    {[
                        { label: 'Ringkasan Toko', query: 'p' },
                        { label: 'Analisis Omset', query: 'Bagaimana analisis keuangan dan omset hari ini?' },
                        { label: 'Atasi Komplain Tamu', query: 'Bagaimana langkah elegan mengatasi komplain tamu yang kecewa dengan rasa kopi?' },
                        { label: 'Ide Promo Sore', query: 'Berikan ide promo atau bundling menu untuk mendongkrak omzet sore hari' },
                        { label: 'Bahan Baku Kritis', query: 'Cek stok bahan baku yang hampir habis di gudang' },
                        { label: 'Antrean KDS', query: 'Bagaimana status antrean di KDS dapur dan barista?' },
                        { label: 'Audit Toko', query: 'Lakukan audit dan ringkasan kondisi operasional toko' }
                    ].map((chip, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleAskCopilot(chip.query)}
                            disabled={copilotLoading}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 font-medium whitespace-nowrap transition active:scale-95 text-[11px]"
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>

                {/* Freeform Prompt Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tanyakan analisis omset, stok bahan, promo, atau ketik 'halo' / 'p'..."
                        value={copilotPrompt}
                        onChange={(e) => setCopilotPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAskCopilot();
                        }}
                        className="w-full pl-3.5 pr-12 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    <button
                        type="button"
                        onClick={() => handleAskCopilot()}
                        disabled={copilotLoading || !copilotPrompt.trim()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-40"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ── 3. KPI Stat Cards (Finansial & Operasional) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Penjualan Hari Ini</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {rupiah(stats?.penjualan_hari_ini || 0)}
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Total omset kotor lunas
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Transaksi Selesai</span>
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 flex items-center justify-center">
                            <Receipt className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {stats?.transaksi_hari_ini || 0} <span className="text-sm font-sans font-normal text-zinc-500 dark:text-zinc-400">nota</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-2">
                        Jumlah order lunas hari ini
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Rata-rata Belanja (AOV)</span>
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {rupiah(stats?.avg_order || 0)}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-2">
                        Rata-rata belanja per tamu
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Estimasi Laba Kotor</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {rupiah(stats?.laba_kotor || 0)}
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2">
                        Margin kotor ~65% omset
                    </p>
                </div>
            </div>

            {/* ── 4. Grafik Penjualan & Menu Terlaris & Transaksi Terbaru ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Tren Penjualan 7 Hari */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-lg text-zinc-950 dark:text-white">Tren Penjualan (7 Hari Terakhir)</h2>
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Grafik dinamika pendapatan harian kafe</p>
                        </div>
                        <Link
                            href="/laporan/harian"
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline transition"
                        >
                            <span>Laporan Detail</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chart_sales || []}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3F3F46" strokeOpacity={0.3} />
                                <XAxis
                                    dataKey="tanggal"
                                    tick={{ fill: '#A1A1AA', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#A1A1AA', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `Rp${(val / 1000)}k`}
                                />
                                <Tooltip
                                    formatter={(value: any) => [rupiah(Number(value)), 'Penjualan']}
                                    contentStyle={{
                                        backgroundColor: '#0A0A0A',
                                        borderRadius: '12px',
                                        color: '#FFFFFF',
                                        border: '1px solid #27272A',
                                        fontSize: '12px',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#10B981"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transaksi Terbaru Realtime */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-base text-zinc-950 dark:text-white">Transaksi Terbaru</h2>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 dark:text-zinc-300">
                                {transaksi_terbaru?.length || 0}
                            </span>
                        </div>
                        <Link href="/transaksi" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="flex-1 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-y-auto max-h-[300px]">
                        {(!transaksi_terbaru || transaksi_terbaru.length === 0) ? (
                            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                                Belum ada transaksi yang tercatat hari ini.
                            </div>
                        ) : (
                            (transaksi_terbaru || []).map((trx) => (
                                <div key={trx.id} className="py-3 flex items-center justify-between text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-1 rounded-lg transition">
                                    <div>
                                        <p className="font-mono font-bold text-zinc-950 dark:text-white">{trx.no_struk}</p>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                                            <span>{trx.pelanggan}</span> &bull; 
                                            <span className="uppercase text-[10px] font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded">
                                                {trx.metode_bayar}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-bold text-zinc-950 dark:text-white">{rupiah(trx.total)}</p>
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center justify-end gap-1 mt-0.5">
                                            <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" /> {trx.waktu}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── 5. Menu Terlaris & Bahan Baku Kritis ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Menu Terlaris */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4 text-amber-500" />
                            <h3 className="font-bold text-sm text-zinc-950 dark:text-white">Top 5 Menu Terlaris</h3>
                        </div>
                        <Link href="/produk" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                            Katalog Menu
                        </Link>
                    </div>

                    {topProducts.length === 0 ? (
                        <p className="text-xs text-zinc-400 py-6 text-center">Belum ada data penjualan menu.</p>
                    ) : (
                        <div className="space-y-2">
                            {topProducts.map((p, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white dark:bg-zinc-700 font-bold font-mono text-[11px] flex items-center justify-center">
                                            #{idx + 1}
                                        </span>
                                        <span className="font-bold text-zinc-900 dark:text-white">{p.nama_produk}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">{p.total_terjual} porsi</span>
                                        <span className="text-[10px] text-zinc-400 font-mono">{rupiah(p.total_omset)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bahan Baku Menipis */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            <h3 className="font-bold text-sm text-zinc-950 dark:text-white">Bahan Baku Menipis (Stok Kritis)</h3>
                        </div>
                        <Link href="/stok/bahan-baku" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                            Kelola Stok
                        </Link>
                    </div>

                    {lowStockList.length === 0 ? (
                        <div className="p-6 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            ✅ Semua stok bahan baku dalam batas aman.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {lowStockList.map((b) => (
                                <div key={b.id} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs">
                                    <div>
                                        <span className="font-bold text-rose-900 dark:text-rose-200 block">{b.nama}</span>
                                        <span className="text-[10px] text-zinc-500">Min. limit: {b.min_stok} {b.satuan}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                                            {b.stok} {b.satuan}
                                        </span>
                                        <span className="block text-[9px] uppercase font-bold text-rose-500">Segera Restock</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── MODAL KALKULATOR MARGIN MENU ── */}
            {isCalcOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white">Kalkulator Margin &amp; Laba Menu</h3>
                            </div>
                            <button onClick={() => setIsCalcOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Harga Jual Target (Rp)</label>
                                <input
                                    type="number"
                                    step="1000"
                                    value={calcHargaJual}
                                    onChange={e => setCalcHargaJual(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-zinc-950 dark:text-white outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Estimasi HPP / Bahan Baku (Rp)</label>
                                <input
                                    type="number"
                                    step="500"
                                    value={calcHpp}
                                    onChange={e => setCalcHpp(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-zinc-950 dark:text-white outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2 mt-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-600 dark:text-zinc-400">Laba Kotor per Porsi:</span>
                                    <span className="font-mono font-bold text-emerald-900 dark:text-emerald-300">{rupiah(calcLabaNominal)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-600 dark:text-zinc-400">Gross Margin Persen:</span>
                                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">{calcMarginPercent}%</span>
                                </div>
                                <div className="flex justify-between text-xs pt-2 border-t border-emerald-200 dark:border-emerald-800/60">
                                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Proyeksi Laba (100 Terjual):</span>
                                    <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-300 text-sm">{rupiah(calcProyeksi100Cup)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setIsCalcOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border dark:border-zinc-700 text-white transition"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL CATAT KAS OPERASIONAL KELUAR ── */}
            {isExpenseOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Minus className="w-4 h-4 text-rose-500" />
                                <h3 className="font-bold text-sm text-zinc-950 dark:text-white">Catat Kas Operasional Keluar</h3>
                            </div>
                            <button onClick={() => setIsExpenseOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveExpense} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Keperluan Pengeluaran</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Beli Es Kristal, Galon Aqua, Gas"
                                    value={expenseNama}
                                    onChange={e => setExpenseNama(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Nominal (Rp)</label>
                                <input
                                    type="number"
                                    step="1000"
                                    value={expenseNominal}
                                    onChange={e => setExpenseNominal(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-zinc-950 dark:text-white outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsExpenseOpen(false)}
                                    className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border dark:border-zinc-700 text-white transition flex items-center gap-1.5"
                                >
                                    {expenseSaved ? <Check size={14} className="text-emerald-400" /> : null}
                                    <span>{expenseSaved ? 'Tersimpan!' : 'Catat Pengeluaran'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
