import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    Clock, DollarSign, Calculator, CheckCircle2, AlertTriangle, 
    X, ArrowRight, ShieldCheck, History, Coins, FileText, Check, 
    RotateCcw, Sparkles, Store, ShieldAlert, AlertCircle, Loader2
} from 'lucide-react';
import { rupiah } from '@/lib/format';
import SlideToConfirm from './SlideToConfirm';
import { KasirCalculatorView } from './KasirCalculatorDrawer';

interface ActiveShift {
    id: number;
    waktu_buka: string;
    modal_awal: number;
    total_penjualan_cash: number;
    total_penjualan_non_cash: number;
    kas_diharapkan: number;
    catatan?: string | null;
}

interface Props {
    isOpen: boolean;
    mode: 'buka' | 'tutup' | 'history';
    activeShift: ActiveShift | null;
    onClose: () => void;
    onOpenShiftSuccess?: () => void;
    onCloseShiftSuccess?: () => void;
}

export default function ShiftModal({
    isOpen,
    mode,
    activeShift,
    onClose,
    onCloseShiftSuccess,
}: Props) {
    // Mode Buka Shift State
    const [modalAwal, setModalAwal] = useState<number>(200000);
    const [catatanBuka, setCatatanBuka] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mode Tutup Shift State (Hitung Kas Fisik)
    const [kasAktual, setKasAktual] = useState<number>(0);
    const [catatanTutup, setCatatanTutup] = useState('');

    // State Kalkulator Side Drawer (Keluar dari Sisi Kanan)
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    // Modal Konfirmasi Penutupan Toko Pop-up
    const [isConfirmCloseModalOpen, setIsConfirmCloseModalOpen] = useState(false);
    const [sliderResetKey, setSliderResetKey] = useState(0);

    // Riwayat Shift State
    const [shiftHistoryList, setShiftHistoryList] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        if (isOpen && activeShift) {
            // Default actual cash to expected cash so cashier can adjust easily
            const expected = (Number(activeShift.modal_awal) || 0) + (Number(activeShift.total_penjualan_cash) || 0);
            setKasAktual(expected);
        }
        if (isOpen && mode === 'history') {
            fetchHistory();
        }
        if (!isOpen) {
            setIsConfirmCloseModalOpen(false);
            setIsCalculatorOpen(false);
        }
    }, [isOpen, mode, activeShift]);

    const fetchHistory = () => {
        setIsLoadingHistory(true);
        fetch('/kasir/shift-riwayat', {
            headers: { 'Accept': 'application/json' }
        })
            .then(res => res.json())
            .then(data => {
                if (data.shifts) setShiftHistoryList(data.shifts);
            })
            .catch(() => {})
            .finally(() => setIsLoadingHistory(false));
    };

    if (!isOpen) return null;

    // Hitungan Selisih Kas
    const expectedCash = activeShift 
        ? (Number(activeShift.modal_awal) || 0) + (Number(activeShift.total_penjualan_cash) || 0)
        : 0;
    const selisih = kasAktual - expectedCash;

    // Handler Buka Shift
    const handleBukaShift = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/shift/buka', {
            modal_awal: modalAwal,
            catatan: catatanBuka || 'Buka Toko POS Kasir',
            redirect_to: 'kasir',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                onClose();
            },
            onError: (err) => {
                setIsSubmitting(false);
                alert(Object.values(err)[0] || 'Gagal membuka shift kasir.');
            }
        });
    };

    // Handler ketika slider di-geser penuh ke kanan:
    // Jika kas pas (selisih === 0), langsung eksekusi penutupan toko secara instan.
    // Jika ada selisih kas (surplus / defisit), munculkan pop-up modal konfirmasi komparasi.
    const handleSlideToCloseComplete = () => {
        if (!activeShift) return;

        if (selisih === 0) {
            handleExecuteTutupShift();
            return;
        }

        setIsConfirmCloseModalOpen(true);
    };

    // Handler batal konfirmasi tutup toko
    const handleCancelConfirmClose = () => {
        setIsConfirmCloseModalOpen(false);
        setSliderResetKey(prev => prev + 1); // Reset slider thumb kembali ke kiri
    };

    // Handler eksekusi submit tutup toko setelah dikonfirmasi di Modal Pop-up
    const handleExecuteTutupShift = () => {
        if (!activeShift) return;

        setIsSubmitting(true);
        router.post(`/shift/${activeShift.id}/tutup`, {
            kas_aktual: kasAktual,
            catatan: catatanTutup || 'Penutupan Toko POS Kasir',
            redirect_to: 'kasir',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setIsConfirmCloseModalOpen(false);
                onClose();
                onCloseShiftSuccess?.();
            },
            onError: (err) => {
                setIsSubmitting(false);
                setSliderResetKey(prev => prev + 1);
                alert(Object.values(err)[0] || 'Gagal menutup shift kasir.');
            }
        });
    };

    // Quick denomination helper buttons
    const addCash = (amount: number) => {
        setKasAktual(prev => Math.max(0, prev + amount));
    };

    return (
        <>
            {/* Modal Dialog Utama Shift Kasir */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
                <div className={`w-full ${isCalculatorOpen && mode === 'tutup' ? 'max-w-4xl lg:max-w-5xl' : 'max-w-md md:max-w-lg'} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto transition-all duration-200`}>
                    
                    {/* Header Minimalis */}
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center border border-zinc-700/50">
                                {mode === 'buka' && <DollarSign className="w-4 h-4 text-emerald-400" />}
                                {mode === 'tutup' && <Store className="w-4 h-4 text-zinc-100" />}
                                {mode === 'history' && <History className="w-4 h-4 text-blue-400" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-100 leading-tight">
                                    {mode === 'buka' && 'Buka Toko / Shift Baru'}
                                    {mode === 'tutup' && 'Tutup Toko & Hitung Kas Laci'}
                                    {mode === 'history' && 'Riwayat Sesi Toko & Rekap Kas'}
                                </h3>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                    {mode === 'buka' && 'Input modal uang kecil awal di cash drawer untuk mulai jualan'}
                                    {mode === 'tutup' && (isCalculatorOpen ? 'Hitung uang kas dengan bantuan kalkulator berdampingan di sebelah kanan' : 'Hitung uang fisik di laci dan cocokkan dengan data sistem')}
                                    {mode === 'history' && 'Daftar rekapitulasi shift kasir dan pencatatan kas'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="Tutup Modal"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        
                        {/* ── MODE 1: BUKA SHIFT ── */}
                        {mode === 'buka' && (
                            <form onSubmit={handleBukaShift} className="p-4 overflow-y-auto space-y-4">
                                <div className="p-3 bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl">
                                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-xs mb-1">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>Memulai Sesi Kasir &amp; Buka Toko</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Setelah toko dibuka, kasir dapat langsung memproses transaksi pesanan pelanggan, cetak struk dan KDS dapur.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                        Modal Awal Uang Kas (Float Laci) *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-zinc-400">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="any"
                                            value={modalAwal}
                                            onChange={(e) => setModalAwal(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                                            placeholder="200000"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        {[100000, 200000, 300000, 500000].map(amt => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setModalAwal(amt)}
                                                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition"
                                            >
                                                {rupiah(amt)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                        Catatan Buka Sesi (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={catatanBuka}
                                        onChange={(e) => setCatatanBuka(e.target.value)}
                                        placeholder="Contoh: Shift Pagi (08:00 - 16:00)"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 px-4 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 active:scale-95"
                                >
                                    <span>{isSubmitting ? 'Membuka Toko...' : 'Buka Toko & Mulai Jualan'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        )}

                        {/* ── MODE 2: TUTUP SHIFT & HITUNG KAS (BERDAMPINGAN DENGAN KALKULATOR) ── */}
                        {mode === 'tutup' && activeShift && (
                            <div className="flex flex-col md:flex-row items-stretch flex-1 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
                                
                                {/* Kolom Kiri: Form Hitung Kas & Tutup Toko */}
                                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 min-w-0">
                                    {/* Ringkasan Penjualan Sesi (Minimalist Card) */}
                                    <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-100/90 dark:bg-zinc-800/90 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
                                        <div className="p-1.5">
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Modal Awal</span>
                                            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                                                {rupiah(activeShift.modal_awal)}
                                            </span>
                                        </div>
                                        <div className="p-1.5">
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Total Tunai (Cash)</span>
                                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                                +{rupiah(activeShift.total_penjualan_cash)}
                                            </span>
                                        </div>
                                        <div className="p-1.5 border-t border-zinc-200/80 dark:border-zinc-700/80">
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Non-Tunai (QRIS/Card)</span>
                                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                                                {rupiah(activeShift.total_penjualan_non_cash)}
                                            </span>
                                        </div>
                                        <div className="p-1.5 border-t border-zinc-200/80 dark:border-zinc-700/80">
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Kas Wajib (Expected)</span>
                                            <span className="font-mono font-black text-zinc-950 dark:text-white text-sm">
                                                {rupiah(expectedCash)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Input Kas Fisik Hasil Hitung */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                                <Coins className="w-3.5 h-3.5 text-zinc-400" />
                                                <span>Hitung Kas Fisik di Laci *</span>
                                            </label>
                                            
                                            {/* Tombol Buka Kalkulator Berdampingan */}
                                            <button
                                                type="button"
                                                onClick={() => setIsCalculatorOpen(prev => !prev)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition active:scale-95 ${
                                                    isCalculatorOpen
                                                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs font-bold'
                                                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700'
                                                }`}
                                                title={isCalculatorOpen ? 'Sembunyikan panel kalkulator' : 'Buka kalkulator berdampingan di sisi kanan'}
                                            >
                                                <Calculator className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                                                <span>{isCalculatorOpen ? 'Tutup Kalkulator' : 'Kalkulator'}</span>
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-zinc-400">
                                                Rp
                                            </span>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="any"
                                                value={kasAktual || ''}
                                                onChange={(e) => setKasAktual(parseFloat(e.target.value) || 0)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-base font-bold text-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* Denomination Fast Adder Minimalis */}
                                        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10.5px]">
                                            {[10000, 20000, 50000, 100000].map(denom => (
                                                <button
                                                    key={denom}
                                                    type="button"
                                                    onClick={() => addCash(denom)}
                                                    className="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 font-mono font-semibold whitespace-nowrap transition active:scale-95"
                                                >
                                                    +{denom / 1000}k
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setKasAktual(expectedCash)}
                                                className="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold whitespace-nowrap transition active:scale-95"
                                                title="Samakan dengan total kas yang diharapkan sistem"
                                            >
                                                Uang Pas
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setKasAktual(0)}
                                                className="px-2 py-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-semibold"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>

                                    {/* Indikator Status Selisih Kas Minimalis */}
                                    <div className="p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-100/90 dark:bg-zinc-800/90 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`w-2.5 h-2.5 rounded-full ${
                                                selisih === 0 
                                                    ? 'bg-emerald-500' 
                                                    : selisih > 0 
                                                    ? 'bg-blue-500' 
                                                    : 'bg-rose-500 animate-pulse'
                                            }`} />
                                            <div>
                                                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                                                    {selisih === 0 && 'Kas Sesuai / Pas (Sempurna)'}
                                                    {selisih > 0 && 'Kas Lebih (Surplus)'}
                                                    {selisih < 0 && 'Kas Kurang (Defisit)'}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                                    {selisih === 0 && 'Jumlah uang fisik di laci cocok dengan data'}
                                                    {selisih > 0 && 'Uang fisik lebih banyak dari catatan sistem'}
                                                    {selisih < 0 && 'Uang fisik lebih sedikit dari catatan sistem'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`font-mono font-bold text-sm ${
                                            selisih === 0 
                                                ? 'text-emerald-600 dark:text-emerald-400' 
                                                : selisih > 0 
                                                ? 'text-blue-600 dark:text-blue-400' 
                                                : 'text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {selisih > 0 ? `+${rupiah(selisih)}` : rupiah(selisih)}
                                        </span>
                                    </div>

                                    {/* Catatan Penutupan */}
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                            Catatan Penutupan Toko
                                        </label>
                                        <input
                                            type="text"
                                            value={catatanTutup}
                                            onChange={(e) => setCatatanTutup(e.target.value)}
                                            placeholder="Contoh: Tutup shift normal, diserahkan ke owner"
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                                        />
                                    </div>

                                    {/* Slide to Confirm: Ketika digeser penuh ke kanan, munculkan modal pop-up konfirmasi */}
                                    <div className="pt-2">
                                        <SlideToConfirm
                                            onConfirm={handleSlideToCloseComplete}
                                            isSubmitting={isSubmitting}
                                            text="Geser ke kanan untuk Tutup Toko"
                                            loadingText="Mempersiapkan Tutup Toko..."
                                            resetKey={sliderResetKey}
                                        />
                                    </div>
                                </div>

                                {/* Kolom Kanan: Panel Kalkulator Berdampingan (Tidak Menutupi Content) */}
                                {isCalculatorOpen && (
                                    <div className="w-full md:w-[310px] lg:w-[350px] border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50 animate-in fade-in slide-in-from-right-4 duration-200 overflow-hidden">
                                        <KasirCalculatorView
                                            onApplyAmount={(val) => setKasAktual(val)}
                                            onClose={() => setIsCalculatorOpen(false)}
                                            initialAmount={kasAktual}
                                            title="Kalkulator"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── MODE 3: RIWAYAT SHIFT ── */}
                        {mode === 'history' && (
                            <div className="space-y-3">
                                {isLoadingHistory ? (
                                    <div className="py-8 text-center text-xs text-zinc-400">Memuat riwayat sesi kasir...</div>
                                ) : shiftHistoryList.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-zinc-400">Belum ada riwayat penutupan toko.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {shiftHistoryList.map((sh) => (
                                            <div
                                                key={sh.id}
                                                className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                            sh.status === 'aktif' 
                                                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                                                                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                                                        }`}>
                                                            {sh.status === 'aktif' ? 'Sedang Berjalan' : 'Selesai Tutup'}
                                                        </span>
                                                        <span className="font-semibold text-zinc-900 dark:text-white">
                                                            {sh.user?.nama || sh.user?.name || 'Kasir'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-400">
                                                        {sh.waktu_tutup ? new Date(sh.waktu_tutup).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Aktif'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60 text-[11px]">
                                                    <div>
                                                        <span className="text-zinc-400 block text-[9px]">Modal Awal</span>
                                                        <span className="font-mono font-medium">{rupiah(sh.modal_awal)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-zinc-400 block text-[9px]">Kas Aktual</span>
                                                        <span className="font-mono font-medium">{rupiah(sh.kas_aktual || sh.kas_diharapkan)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-zinc-400 block text-[9px]">Selisih</span>
                                                        <span className={`font-mono font-bold ${
                                                            (sh.selisih || 0) === 0 
                                                                ? 'text-emerald-600 dark:text-emerald-400' 
                                                                : (sh.selisih || 0) > 0 
                                                                ? 'text-blue-600 dark:text-blue-400' 
                                                                : 'text-rose-600 dark:text-rose-400'
                                                        }`}>
                                                            {rupiah(sh.selisih || 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ── MODAL POP-UP KONFIRMASI TUTUP TOKO (MUNCUL SETELAH GESER SLIDER) ── */}
            {isConfirmCloseModalOpen && activeShift && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
                        {/* Header Pop-up */}
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-zinc-950 dark:bg-zinc-800 text-white flex items-center justify-center shrink-0 border border-zinc-700/60">
                                <Store className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base text-zinc-950 dark:text-zinc-100">
                                    Konfirmasi Tutup Toko
                                </h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Periksa kembali rekapitulasi kas fisik dan transaksi sebelum mengakhiri sesi kasir.
                                </p>
                            </div>
                        </div>

                        {/* Rincian Komparasi Kas Minimalis */}
                        <div className="bg-zinc-100/90 dark:bg-zinc-800/90 rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-700/80 text-xs space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="text-zinc-500 dark:text-zinc-400">Modal Awal Sesi:</span>
                                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                                    {rupiah(activeShift.modal_awal)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="text-zinc-500 dark:text-zinc-400">Penjualan Tunai (Cash):</span>
                                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                    +{rupiah(activeShift.total_penjualan_cash)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="text-zinc-500 dark:text-zinc-400">Penjualan Non-Tunai (QRIS/Card):</span>
                                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                                    {rupiah(activeShift.total_penjualan_non_cash)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="text-zinc-500 dark:text-zinc-400">Kas Wajib di Laci (Expected):</span>
                                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                    {rupiah(expectedCash)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="font-bold text-zinc-800 dark:text-zinc-200">Kas Aktual Fisik:</span>
                                <span className="font-mono font-black text-sm text-zinc-950 dark:text-white">
                                    {rupiah(kasAktual)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-0.5">
                                <span className="font-bold text-zinc-800 dark:text-zinc-200">Status Selisih Kas:</span>
                                <span className={`font-mono font-black text-sm ${
                                    selisih === 0 
                                        ? 'text-emerald-600 dark:text-emerald-400' 
                                        : selisih > 0 
                                        ? 'text-blue-600 dark:text-blue-400' 
                                        : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                    {selisih === 0 ? 'Pas (Rp 0)' : selisih > 0 ? `+${rupiah(selisih)}` : rupiah(selisih)}
                                </span>
                            </div>
                        </div>

                        {/* Catatan jika ada */}
                        {catatanTutup && (
                            <div className="p-2.5 bg-zinc-100/60 dark:bg-zinc-800/50 rounded-xl text-[11px] text-zinc-600 dark:text-zinc-400">
                                <span className="font-bold text-zinc-700 dark:text-zinc-300">Catatan: </span>
                                <span>{catatanTutup}</span>
                            </div>
                        )}

                        {/* Peringatan jika terdapat selisih kas */}
                        {selisih !== 0 && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                <div className="space-y-0.5">
                                    <span className="font-bold block">Peringatan Selisih Kas</span>
                                    <p className="text-[11px] opacity-90 leading-relaxed">
                                        Terdapat selisih kas fisik sebesar <strong className="font-mono font-bold">{selisih > 0 ? `+${rupiah(selisih)}` : rupiah(selisih)}</strong>. Selisih ini akan tercatat permanen di laporan shift.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                            <button
                                type="button"
                                onClick={handleCancelConfirmClose}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95"
                            >
                                Periksa / Hitung Kembali
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteTutupShift}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Menutup Toko...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Ya, Tutup Toko</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
