import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { tanggal_id } from '@/lib/format';
import {
    ArrowLeft,
    Clock,
    Calendar,
    Filter,
    CheckCircle2,
    AlertCircle,
    Eye,
    X,
    FileText,
    Camera
} from 'lucide-react';

interface Props {
    riwayat: Array<{
        id: number;
        tanggal: string;
        jam_masuk: string | null;
        jam_keluar: string | null;
        status: string;
        jam_kerja_menit: number;
        lembur_menit: number;
        foto_masuk: string | null;
        foto_keluar: string | null;
        keterangan?: string | null;
    }>;
    filter: {
        bulan: number;
        tahun: number;
    };
    rekap: {
        hadir: number;
        terlambat: number;
        izin: number;
        sakit: number;
        cuti: number;
        alpha: number;
        total_jam_kerja: number;
        total_lembur_jam: number;
    };
}

export default function Riwayat({ riwayat, filter, rekap }: Props) {
    const [bulan, setBulan] = useState(filter.bulan);
    const [tahun, setTahun] = useState(filter.tahun);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/absensi/riwayat', { bulan, tahun }, { preserveState: true });
    };

    const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'hadir':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">Hadir</span>;
            case 'terlambat':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#F59E0B] border border-amber-200">Terlambat</span>;
            case 'izin':
            case 'cuti':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">{status}</span>;
            case 'sakit':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Sakit</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#DC2626] border border-red-200">Alpha</span>;
        }
    };

    return (
        <AppLayout>
            <Head title="Riwayat Presensi Karyawan - Jelang Hari" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E5E4]">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/absensi"
                            className="p-2 rounded-[10px] bg-white border border-[#E7E5E4] hover:bg-zinc-100 text-[#0A0A0A] transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="font-serif text-2xl font-bold text-[#0A0A0A]">Riwayat Presensi</h1>
                            <p className="text-xs text-[#78716C]">
                                Catatan kehadiran periode {namaBulan[bulan - 1]} {tahun}
                            </p>
                        </div>
                    </div>

                    {/* Filter Form */}
                    <form onSubmit={handleFilter} className="flex items-center gap-2">
                        <select
                            value={bulan}
                            onChange={e => setBulan(Number(e.target.value))}
                            className="px-3 py-1.5 bg-white border border-[#E7E5E4] rounded-[10px] text-xs font-medium text-[#0A0A0A] outline-none"
                        >
                            {namaBulan.map((n, idx) => (
                                <option key={idx + 1} value={idx + 1}>{n}</option>
                            ))}
                        </select>
                        <select
                            value={tahun}
                            onChange={e => setTahun(Number(e.target.value))}
                            className="px-3 py-1.5 bg-white border border-[#E7E5E4] rounded-[10px] text-xs font-medium text-[#0A0A0A] outline-none"
                        >
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="px-3.5 py-1.5 bg-[#0A0A0A] hover:bg-zinc-800 text-white rounded-[10px] text-xs font-semibold shadow-sm transition"
                        >
                            Terapkan
                        </button>
                    </form>
                </div>

                {/* Rekap Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-[16px] bg-white border border-[#E7E5E4]">
                        <span className="text-xs text-[#78716C] block">Total Hadir</span>
                        <span className="font-mono text-xl font-bold text-[#0A0A0A]">{rekap.hadir} hari</span>
                        <span className="text-[10px] text-[#16A34A] block mt-0.5">On-time hadir</span>
                    </div>
                    <div className="p-4 rounded-[16px] bg-white border border-[#E7E5E4]">
                        <span className="text-xs text-[#78716C] block">Terlambat</span>
                        <span className="font-mono text-xl font-bold text-[#F59E0B]">{rekap.terlambat} hari</span>
                        <span className="text-[10px] text-[#78716C] block mt-0.5">Lewat toleransi</span>
                    </div>
                    <div className="p-4 rounded-[16px] bg-white border border-[#E7E5E4]">
                        <span className="text-xs text-[#78716C] block">Izin / Sakit / Cuti</span>
                        <span className="font-mono text-xl font-bold text-[#8B7355]">{rekap.izin + rekap.sakit + rekap.cuti} hari</span>
                        <span className="text-[10px] text-[#78716C] block mt-0.5">Tercatat resmi</span>
                    </div>
                    <div className="p-4 rounded-[16px] bg-white border border-[#E7E5E4]">
                        <span className="text-xs text-[#78716C] block">Total Jam Kerja</span>
                        <span className="font-mono text-xl font-bold text-[#0A0A0A]">{rekap.total_jam_kerja} jam</span>
                        <span className="text-[10px] text-[#78716C] block mt-0.5">+{rekap.total_lembur_jam}j lembur</span>
                    </div>
                </div>

                {/* Riwayat Table */}
                <div className="bg-white rounded-[16px] border border-[#E7E5E4] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[#78716C] font-semibold uppercase text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5">Tanggal</th>
                                    <th className="px-5 py-3.5">Jam Masuk</th>
                                    <th className="px-5 py-3.5">Jam Pulang</th>
                                    <th className="px-5 py-3.5">Durasi Kerja</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Swafoto</th>
                                    <th className="px-5 py-3.5">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E7E5E4]">
                                {riwayat.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-[#78716C]">
                                            Tidak ada riwayat presensi pada bulan ini.
                                        </td>
                                    </tr>
                                ) : (
                                    riwayat.map((item) => {
                                        const masuk = item.jam_masuk ? new Date(item.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
                                        const keluar = item.jam_keluar ? new Date(item.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
                                        const durasi = item.jam_kerja_menit > 0 ? `${Math.floor(item.jam_kerja_menit / 60)}j ${item.jam_kerja_menit % 60}m` : '-';

                                        return (
                                            <tr key={item.id} className="hover:bg-[#FAFAF9] transition">
                                                <td className="px-5 py-3.5 font-medium text-[#0A0A0A]">
                                                    {tanggal_id(item.tanggal)}
                                                </td>
                                                <td className="px-5 py-3.5 font-mono">{masuk}</td>
                                                <td className="px-5 py-3.5 font-mono">{keluar}</td>
                                                <td className="px-5 py-3.5 font-mono font-medium">
                                                    {durasi}
                                                    {item.lembur_menit > 0 && (
                                                        <span className="ml-1 text-[10px] text-amber-700 font-bold">(Lembur)</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">{getStatusBadge(item.status)}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        {item.foto_masuk && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedPhoto(`/storage/${item.foto_masuk}`)}
                                                                title="Foto Masuk"
                                                                className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[#0A0A0A]"
                                                            >
                                                                <Camera className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        {item.foto_keluar && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedPhoto(`/storage/${item.foto_keluar}`)}
                                                                title="Foto Pulang"
                                                                className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[#0A0A0A]"
                                                            >
                                                                <Camera className="w-3.5 h-3.5 text-red-600" />
                                                            </button>
                                                        )}
                                                        {!item.foto_masuk && !item.foto_keluar && (
                                                            <span className="text-[#78716C]">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-[#78716C] text-[11px] max-w-xs truncate">
                                                    {item.keterangan || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Preview Foto */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="bg-white rounded-2xl p-2 max-w-md w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <img src={selectedPhoto} alt="Verifikasi Swafoto" className="w-full h-auto rounded-xl object-contain max-h-[80vh]" />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
