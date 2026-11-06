import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, Coffee, ArrowRight, RotateCcw, MessageSquare, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import FormattedAiText from './FormattedAiText';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    statusBadge?: string;
    actionLink?: { label: string; url: string };
    timestamp: string;
}

export default function JelangAiModal({ isOpen, onClose }: Props) {
    const [prompt, setPrompt] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        {
            id: 'init-1',
            sender: 'ai',
            text: 'Jelang Hari Copilot aktif. Sistem siap menganalisis omset, antrean KDS, persediaan bahan baku, efisiensi meja, dan strategi penjualan kafe secara langsung. Silakan ajukan pertanyaan atau pilih topik di bawah.',
            statusBadge: 'Operasional Toko',
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    useEffect(() => {
        if (isOpen) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, chatHistory, isThinking]);

    if (!isOpen) return null;

    const quickPrompts = [
        { label: 'Analisis Omset Hari Ini', query: 'Bagaimana evaluasi omset dan performa keuangan kafe hari ini?' },
        { label: 'Status Operasional Toko', query: 'Ringkasan kondisi toko dan tindakan prioritas hari ini' },
        { label: 'Cara Hadapi Komplain Tamu', query: 'Bagaimana cara menangani komplain pelanggan yang kecewa dengan rasa kopi?' },
        { label: 'Ide Promo Sore Hari', query: 'Berikan ide promo atau bundling menu untuk mendongkrak penjualan sore hari' },
        { label: 'Bahan Baku Kritis', query: 'Cek persediaan stok bahan baku yang hampir habis di gudang' },
        { label: 'Glosarium Istilah Kafe', query: 'Jelaskan istilah HPP, AOV, dan Laba Kotor dalam laporan keuangan kafe' }
    ];

    const generateClientFallback = (rawQuery: string): { reply: string; statusBadge?: string; actionLink?: { label: string; url: string } } => {
        const q = rawQuery.toLowerCase();

        if (q.includes('void') || q.includes('batal')) {
            return {
                reply: `Definisi & Prosedur Void:\n• Void adalah pembatalan transaksi yang sudah dicatat dalam sistem.\n• Cara Melakukan: Buka POS Kasir (/kasir) -> Riwayat Transaksi -> pilih pesanan terkait -> klik Batalkan/Void dan sertakan alasan.\n• Tindakan void tercatat pada log audit kasir untuk keamanan pembukuan.`,
                statusBadge: 'Glosarium Bisnis',
                actionLink: { label: 'Buka Riwayat Kasir', url: '/kasir/riwayat' }
            };
        }

        if (q.includes('hpp') || q.includes('cogs')) {
            return {
                reply: `Definisi & Perhitungan HPP:\n• HPP (Harga Pokok Penjualan) adalah total biaya bahan mentah langsung untuk menghasilkan satu porsi menu F&B.\n• Di Jelang Hari, sistem menghitung HPP secara otomatis berdasarkan takaran di menu Resep Produk (/resep) setiap kali transaksi selesai.`,
                statusBadge: 'Glosarium Finansial',
                actionLink: { label: 'Kelola Resep BOM', url: '/resep' }
            };
        }

        if (q.includes('aov')) {
            return {
                reply: `Definisi & Analisis AOV:\n• AOV (Average Order Value) adalah rata-rata nominal belanja per struk kasir (Omzet / Total Nota).\n• Strategi Meningkatkan: Terapkan kasir upselling (extra shot/oat milk) dan paket bundling makanan ringan.`,
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

        if (q.includes('cerita') || q.includes('curhat') || q.includes('capek') || q.includes('lelah') || q.includes('pusing') || q.includes('sepi')) {
            return {
                reply: `Evaluasi Operasional:\n\nMenjalankan coffee shop membutuhkan konsistensi tinggi dari barista dan kasir. Saat jam lengang (low-hour), maksimalkan waktu untuk persiapan batching bahan, kalibrasi grinder, atau aktivasi promo Happy Hour sore demi menjaga perputaran tamu.`,
                statusBadge: 'Diskusi Operasional',
                actionLink: { label: 'Buka Dashboard', url: '/dashboard' }
            };
        }

        if (q.includes('komplain') || q.includes('marah') || q.includes('kecewa') || q.includes('salah')) {
            return {
                reply: `Solusi Menangani Komplain Pelanggan (Metode L.A.S.T):\n1. Listen: Dengarkan tanpa memotong pembicaraan tamu.\n2. Apologize: Minta maaf dengan tulus atas ketidaknyamanan rasa atau waktu tunggu.\n3. Solve: Gantikan pesanan baru secara cuma-cuma dan prioritaskan di bar.\n4. Thank: Ucapkan terima kasih karena masukannya menjaga standar kualitas Jelang Hari.\n\nPelanggan yang komplainnya diselesaikan secara cepat memiliki loyalitas tinggi.`,
                statusBadge: 'Resolusi Tamu',
                actionLink: { label: 'Cek Antrean KDS', url: '/kds' }
            };
        }

        if (q.includes('promo') || q.includes('laris') || q.includes('marketing') || q.includes('ide')) {
            return {
                reply: `Rekomendasi Promo & Upselling:\n• Bundling Sore: Pasangkan Kopi Susu Jelang Senja + Pastry dengan harga hemat Rp 38.000.\n• Upsell Kasir: Tawarkan 'Add Extra Shot (+Rp 5.000)' atau 'Ganti Susu Oat (+Rp 8.000)' pada setiap pesanan kopi susu.\n• Happy Hour: Diskon 15% untuk dine-in di jam 13.00 - 15.00 guna mengisi jam sepi kafe.`,
                statusBadge: 'Strategi Penjualan',
                actionLink: { label: 'Atur Promo Jam Aktif', url: '/promo' }
            };
        }

        if (q.length <= 4 || q.includes('halo') || q.includes('hai') || q === 'p') {
            return {
                reply: `Jelang Hari Copilot siap membantu. Silakan ajukan pertanyaan seputar tutorial kasir POS, antrean KDS, stok bahan, resep BOM, laporan keuangan, atau istilah bisnis kafe.`,
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

    const handleSend = async (customPrompt?: string) => {
        const textToSend = (customPrompt || prompt).trim();
        if (!textToSend || isThinking) return;

        const userMsg: ChatMessage = {
            id: 'usr-' + Date.now(),
            sender: 'user',
            text: textToSend,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };

        setChatHistory(prev => [...prev, userMsg]);
        setPrompt('');
        setIsThinking(true);

        try {
            // Ambil CSRF token
            const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
            const csrfToken = csrfMeta?.content || '';

            const res = await fetch('/dashboard/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ prompt: textToSend })
            });

            if (res.ok) {
                const data = await res.json();
                const aiMsg: ChatMessage = {
                    id: 'ai-' + Date.now(),
                    sender: 'ai',
                    text: data.reply || 'Data berhasil dianalisis.',
                    statusBadge: data.status_badge,
                    actionLink: data.action_link,
                    timestamp: data.timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                };
                setChatHistory(prev => [...prev, aiMsg]);
            } else {
                // Fallback cerdas jika status non-200
                const fallback = generateClientFallback(textToSend);
                setChatHistory(prev => [...prev, {
                    id: 'ai-' + Date.now(),
                    sender: 'ai',
                    text: fallback.reply,
                    statusBadge: fallback.statusBadge,
                    actionLink: fallback.actionLink,
                    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        } catch {
            // Fallback cerdas jika offline / network drop
            const fallback = generateClientFallback(textToSend);
            setChatHistory(prev => [...prev, {
                id: 'ai-' + Date.now(),
                sender: 'ai',
                text: fallback.reply,
                statusBadge: fallback.statusBadge,
                actionLink: fallback.actionLink,
                timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-colors relative">
                
                {/* Header */}
                <div className="p-4 sm:px-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/90 dark:bg-zinc-950/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-zinc-700 flex items-center justify-center shadow-xs">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white">
                                Jelang Hari Copilot
                            </h3>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                Asisten operasional toko &amp; konsultasi data analitik harian
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {chatHistory.length > 1 && (
                            <button
                                onClick={() => setChatHistory([chatHistory[0]])}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                title="Reset Percakapan"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="Tutup (ESC)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-zinc-50/60 dark:bg-zinc-950/60 scrollbar-thin">
                    {chatHistory.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                {!isUser && (
                                    <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 text-xs shadow-xs mt-0.5">
                                        <Bot className="w-3.5 h-3.5" />
                                    </div>
                                )}
                                
                                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                                    isUser
                                        ? 'bg-zinc-900 text-white dark:bg-emerald-600 dark:text-white rounded-tr-xs shadow-xs'
                                        : 'bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-100 rounded-tl-xs shadow-xs'
                                }`}>
                                    {msg.statusBadge && (
                                        <div className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                            {msg.statusBadge}
                                        </div>
                                    )}

                                    <FormattedAiText text={msg.text} isUser={isUser} />

                                    {msg.actionLink && (
                                        <div className="pt-1.5">
                                            <Link
                                                href={msg.actionLink.url}
                                                onClick={onClose}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-zinc-950 transition shadow-xs"
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

                    {isThinking && (
                        <div className="flex gap-2 items-center text-xs text-emerald-700 dark:text-emerald-400 italic p-2 pl-9">
                            <Sparkles className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                            <span>Jelang Hari Copilot sedang memproses...</span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Quick Chips Bar */}
                <div className="px-4 py-2 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-1.5 overflow-x-auto scrollbar-none">
                    {quickPrompts.map((qp, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSend(qp.query)}
                            disabled={isThinking}
                            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200/60 dark:border-zinc-700 transition disabled:opacity-40"
                        >
                            {qp.label}
                        </button>
                    ))}
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Curhat, tanya omset, atau ceritakan masalah toko pada Jelang AI..."
                        className="flex-1 px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!prompt.trim() || isThinking}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition shadow-sm active:scale-95"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
