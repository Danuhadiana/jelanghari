import React, { useState } from 'react';
import {
    X,
    Calendar,
    Clock,
    Users,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Send,
    Phone,
    ShieldAlert,
    ExternalLink,
    Coffee,
    Sparkles
} from 'lucide-react';
import axios from 'axios';
import { rupiah } from '@/lib/format';

interface MejaItem {
    id: number;
    nomor: string;
    nama: string | null;
    area: string;
    kapasitas: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mejas: MejaItem[];
    settings: Record<string, any>;
    userName?: string;
    userTelepon?: string;
}

export default function CustomerReservationModal({
    isOpen,
    onClose,
    mejas = [],
    settings = {},
    userName = '',
    userTelepon = ''
}: Props) {
    if (!isOpen) return null;

    const isReservasiAktif = settings.reservasi_aktif !== '0';
    const jamBuka = settings.reservasi_jam_buka || '09:00';
    const jamTutup = settings.reservasi_jam_tutup || '22:00';
    const minDp = Number(settings.reservasi_min_dp || 0);
    const maksDurasi = Number(settings.reservasi_maks_durasi || 2);
    const syarat = settings.reservasi_syarat || 'Harap hadir tepat waktu. Meja akan ditahan maksimal 20 menit setelah jam reservasi.';
    const waAdmin = settings.reservasi_wa_admin || '0821-1594-1156';

    const todayStr = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        nama_pemesan: userName || '',
        telepon: userTelepon || '',
        tanggal: todayStr,
        jam: '14:00',
        durasi_jam: 2,
        jumlah_orang: 2,
        meja_id: '',
        catatan: '',
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successData, setSuccessData] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const res = await axios.post('/api/reservasi', {
                ...form,
                durasi_jam: Number(form.durasi_jam),
                jumlah_orang: Number(form.jumlah_orang),
                meja_id: form.meja_id ? Number(form.meja_id) : null,
            });

            if (res.data && res.data.success) {
                setSuccessData(res.data.data);
            } else {
                setErrorMessage(res.data.message || 'Gagal mengirim pengajuan reservasi.');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Terjadi kesalahan saat memproses data reservasi.';
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenWhatsApp = () => {
        if (!successData) return;
        const cleanWa = waAdmin.replace(/[^0-9]/g, '');
        const targetPhone = cleanWa.startsWith('0') ? '62' + cleanWa.substring(1) : cleanWa;
        const text = encodeURIComponent(
            `Halo Jelang Hari Coffee, saya telah mengajukan reservasi meja melalui website:\n` +
            `- Nama: ${successData.nama_pemesan}\n` +
            `- Tanggal: ${successData.tanggal}\n` +
            `- Jam: ${successData.jam} WIB (${form.durasi_jam} Jam)\n` +
            `- Tamu: ${successData.jumlah_orang} Orang\n` +
            `- Pilihan Meja: ${successData.meja_nomor}\n` +
            (form.catatan ? `- Catatan: ${form.catatan}\n` : '') +
            `\nMohon konfirmasi ketersediaannya. Terima kasih!`
        );
        window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[85vh]">
                {/* Header Modal */}
                <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/70 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-tight">
                                Reservasi Meja &amp; Ruang Workspace
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
                                Booking meja lebih awal untuk rapat kerja atau santai.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                    {/* If System Closed Notice */}
                    {!isReservasiAktif && (
                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs">
                            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm">Layanan Reservasi Ditutup Sementara</p>
                                <p className="text-[11px] mt-0.5 opacity-90">
                                    Mohon maaf, layanan booking meja mandiri sedang dinonaktifkan oleh tim manajemen. Untuk pemesanan darurat silakan hubungi WhatsApp kami langsung di {waAdmin}.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS STATE VIEW */}
                    {successData ? (
                        <div className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                    Pengajuan Reservasi Diterima!
                                </h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                                    Terima kasih, <b>{successData.nama_pemesan}</b>. Jadwal kunjungan Anda telah masuk ke sistem antrean reservasi Jelang Hari Coffee.
                                </p>
                            </div>

                            {/* Summary Card */}
                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-2 max-w-md mx-auto">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                    <span className="text-zinc-500">Tanggal Kunjungan</span>
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{successData.tanggal}</span>
                                </div>
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                    <span className="text-zinc-500">Jam &amp; Durasi</span>
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{successData.jam} WIB ({form.durasi_jam} Jam)</span>
                                </div>
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                    <span className="text-zinc-500">Jumlah Tamu &amp; Meja</span>
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{successData.jumlah_orang} Orang (Meja {successData.meja_nomor})</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">Status Saat Ini</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                        Menunggu Konfirmasi Staf
                                    </span>
                                </div>
                            </div>

                            <p className="text-[11px] text-zinc-500 max-w-md mx-auto">
                                Klik tombol di bawah ini untuk meneruskan pesan ke WhatsApp admin agar reservasi Anda dapat langsung dikonfirmasi oleh tim kasir:
                            </p>

                            <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2">
                                <button
                                    type="button"
                                    onClick={handleOpenWhatsApp}
                                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Konfirmasi via WhatsApp Sekarang</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSuccessData(null);
                                        onClose();
                                    }}
                                    className="py-3 px-5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* FORM VIEW */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {errorMessage && (
                                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {/* Info Operasional */}
                            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px]">
                                <div>
                                    <span className="text-zinc-500 block">Jam Operasional:</span>
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{jamBuka} – {jamTutup} WIB</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block">Uang Muka (DP):</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        {minDp > 0 ? rupiah(minDp) : 'Gratis (Tanpa DP)'}
                                    </span>
                                </div>
                            </div>

                            {/* Nama & Telepon */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Nama Pemesan
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Rian Pratama"
                                        value={form.nama_pemesan}
                                        onChange={(e) => setForm({ ...form, nama_pemesan: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        No. WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="081234567890"
                                        value={form.telepon}
                                        onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Tanggal & Jam */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Tanggal Kedatangan
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        min={todayStr}
                                        value={form.tanggal}
                                        onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Jam Kedatangan (WIB)
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={form.jam}
                                        onChange={(e) => setForm({ ...form, jam: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Meja, Tamu, Durasi */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Meja / Area
                                    </label>
                                    <select
                                        value={form.meja_id}
                                        onChange={(e) => setForm({ ...form, meja_id: e.target.value })}
                                        className="w-full px-2.5 py-2 bg-zinc-50/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    >
                                        <option value="">Bebas / Pilihkan</option>
                                        {mejas.map((m) => (
                                             <option key={m.id} value={m.id}>
                                                Meja {m.nomor} ({m.area} - {m.kapasitas}p)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Tamu (Orang)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        max={50}
                                        value={form.jumlah_orang}
                                        onChange={(e) => setForm({ ...form, jumlah_orang: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-zinc-50/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Durasi (Jam)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        max={maksDurasi}
                                        value={form.durasi_jam}
                                        onChange={(e) => setForm({ ...form, durasi_jam: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-zinc-50/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Catatan Khusus */}
                            <div>
                                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                    Catatan / Permintaan Khusus (Opsional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Contoh: Butuh colokan listrik banyak, area bebas asap rokok..."
                                    value={form.catatan}
                                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-zinc-50/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed transition"
                                />
                            </div>

                            {/* Syarat & Ketentuan */}
                            <div className="p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 space-y-0.5">
                                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Kebijakan Reservasi Meja:</span>
                                <p className="leading-relaxed">{syarat}</p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={loading || !isReservasiAktif}
                                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Mengirim Pengajuan Reservasi...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Ajukan Reservasi Meja Sekarang</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
