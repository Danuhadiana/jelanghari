import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { rupiah, tanggal_id } from '@/lib/format';
import { Lock, Unlock, CalendarCheck, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Props {
    shifts?: any;
    activeShift?: any;
    active_shift?: any;
    active_shift_stats?: { sales: number; count: number };
}

export default function Index({ shifts, activeShift, active_shift, active_shift_stats }: Props) {
    const currentShift = activeShift || active_shift;
    const shiftList = Array.isArray(shifts) ? shifts : (shifts?.data || []);

    const [isBukaModalOpen, setIsBukaModalOpen] = useState(false);
    const [isTutupModalOpen, setIsTutupModalOpen] = useState(false);

    const bukaForm = useForm({
        modal_awal: 200000,
        catatan: '',
    });

    const tutupForm = useForm({
        kas_aktual: 0,
        catatan: '',
    });

    const handleBuka = (e: React.FormEvent) => {
        e.preventDefault();
        bukaForm.post('/shift/buka', {
            onSuccess: () => setIsBukaModalOpen(false),
        });
    };

    const handleTutup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentShift) return;
        tutupForm.post(`/shift/${currentShift.id}/tutup`, {
            onSuccess: () => setIsTutupModalOpen(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Shift Kasir - Jelang Hari" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Shift &amp; Rekap Kasir</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Kontrol saldo kas kecil di laci kasir dan serah terima shift kasir.</p>
                </div>

                <div className="flex items-center gap-2">
                    {!currentShift ? (
                        <button
                            onClick={() => setIsBukaModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-semibold shadow-sm transition"
                        >
                            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Buka Shift Kasir Baru</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                tutupForm.setData('kas_aktual', Number(currentShift.kas_diharapkan || currentShift.modal_awal || 200000));
                                setIsTutupModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition"
                        >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Tutup &amp; Rekap Shift</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Banner Shift Sedang Berjalan */}
            {currentShift && (
                <div className="bg-white border-l-4 border-emerald-500 p-5 rounded-[16px] border border-zinc-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Sesi Shift Aktif
                            </span>
                        </div>
                        <h3 className="font-bold text-base text-zinc-950 mt-1">
                            Kasir: {currentShift.user?.name || currentShift.user?.nama || 'Kasir On-Duty'}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Dibuka sejak: {tanggal_id(currentShift.waktu_buka)}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-xs bg-zinc-50 px-4 py-3 rounded-[12px] border border-zinc-200">
                        <div>
                            <span className="text-zinc-500 block">Modal Awal Laci:</span>
                            <span className="font-mono font-bold text-zinc-950 text-sm">
                                {rupiah(currentShift.modal_awal || currentShift.kas_awal || 0)}
                            </span>
                        </div>
                        <div className="border-l border-zinc-200 pl-6">
                            <span className="text-zinc-500 block">Penjualan Shift Ini:</span>
                            <span className="font-mono font-bold text-emerald-600 text-sm">
                                {rupiah(active_shift_stats?.sales || (Number(currentShift.total_penjualan_cash || 0) + Number(currentShift.total_penjualan_non_cash || 0)))}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[16px] border border-zinc-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 uppercase text-zinc-500 font-semibold tracking-wider">
                        <tr>
                            <th className="px-5 py-3.5">Kasir</th>
                            <th className="px-5 py-3.5">Waktu Buka / Tutup</th>
                            <th className="px-5 py-3.5">Modal Kas Awal</th>
                            <th className="px-5 py-3.5">Fisik Kas Akhir</th>
                            <th className="px-5 py-3.5">Total Penjualan</th>
                            <th className="px-5 py-3.5">Selisih Kas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {shiftList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center text-zinc-400">
                                    Belum ada sesi rekap shift yang tercatat di sistem.
                                </td>
                            </tr>
                        ) : (
                            shiftList.map((item) => {
                                const kasAwal = item.modal_awal !== undefined ? item.modal_awal : (item.kas_awal || 0);
                                const kasAkhir = item.kas_aktual !== undefined ? item.kas_aktual : item.kas_akhir;
                                const totalJual = item.total_penjualan !== undefined ? item.total_penjualan : ((Number(item.total_penjualan_cash || 0) + Number(item.total_penjualan_non_cash || 0)));
                                const kasirNama = item.user?.name || item.user?.nama || 'Kasir';
                                const selisih = Number(item.selisih || 0);

                                return (
                                    <tr key={item.id} className="hover:bg-zinc-50/80 transition">
                                        <td className="px-5 py-4 font-bold text-zinc-950">{kasirNama}</td>
                                        <td className="px-5 py-4 text-zinc-600">
                                            <p className="font-medium text-zinc-900">{tanggal_id(item.waktu_buka)}</p>
                                            <p className="text-[10px] text-zinc-400 mt-0.5">
                                                {item.waktu_tutup ? `Tutup: ${tanggal_id(item.waktu_tutup)}` : 'Masih Berjalan (Aktif)'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 font-mono font-medium text-zinc-800">{rupiah(kasAwal)}</td>
                                        <td className="px-5 py-4 font-mono font-medium text-zinc-800">
                                            {kasAkhir !== null && kasAkhir !== undefined ? rupiah(kasAkhir) : '-'}
                                        </td>
                                        <td className="px-5 py-4 font-mono font-bold text-zinc-950">{rupiah(totalJual)}</td>
                                        <td className="px-5 py-4 font-mono font-bold">
                                            {item.waktu_tutup ? (
                                                <span className={selisih < 0 ? 'text-red-600' : (selisih > 0 ? 'text-emerald-700' : 'text-zinc-600')}>
                                                    {selisih !== 0 ? rupiah(selisih) : 'Tepat (Pas)'}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold uppercase">
                                                    Aktif
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Buka Shift */}
            {isBukaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[20px] border border-zinc-200 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950">Buka Shift Kasir Baru</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Input jumlah uang kembalian (modal awal) di laci kasir.</p>
                            </div>
                            <button onClick={() => setIsBukaModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleBuka} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Modal Kas Awal di Laci (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    value={bukaForm.data.modal_awal}
                                    onChange={(e) => bukaForm.setData('modal_awal', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-base font-mono font-bold text-zinc-900 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Catatan Shift (Opsional)</label>
                                <input
                                    type="text"
                                    value={bukaForm.data.catatan}
                                    onChange={(e) => bukaForm.setData('catatan', e.target.value)}
                                    placeholder="Contoh: Pecahan 10rb dan 5rb cukup"
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => setIsBukaModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-[10px]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={bukaForm.processing}
                                    className="px-5 py-2 rounded-[10px] bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                                >
                                    {bukaForm.processing ? 'Membuka...' : 'Buka Kasir Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tutup Shift */}
            {isTutupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[20px] border border-zinc-200 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
                            <div>
                                <h3 className="font-bold text-base text-rose-700">Tutup &amp; Rekap Kasir</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Hitung seluruh fisik uang di laci kasir untuk verifikasi selisih.</p>
                            </div>
                            <button onClick={() => setIsTutupModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleTutup} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Total Uang Fisik Di Laci (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    value={tutupForm.data.kas_aktual}
                                    onChange={(e) => tutupForm.setData('kas_aktual', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-base font-mono font-bold text-zinc-900 focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Catatan Serah Terima / Alasan Selisih</label>
                                <textarea
                                    rows={2}
                                    value={tutupForm.data.catatan}
                                    onChange={(e) => tutupForm.setData('catatan', e.target.value)}
                                    placeholder="Contoh: Uang fisik pas, laci sudah dikunci..."
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => setIsTutupModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-[10px]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={tutupForm.processing}
                                    className="px-5 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                                >
                                    {tutupForm.processing ? 'Menutup...' : 'Tutup Shift Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
