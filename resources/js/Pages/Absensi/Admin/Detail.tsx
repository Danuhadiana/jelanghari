import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { rupiah, tanggal_id } from '@/lib/format';
import {
    ArrowLeft,
    User,
    Calendar,
    Clock,
    DollarSign,
    CheckCircle2,
    FileText,
    Camera
} from 'lucide-react';

interface Props {
    karyawan: {
        id: number;
        nama: string;
        email: string;
        role: string;
        telepon?: string;
        gaji_harian: number;
    };
    riwayat: Array<{
        id: number;
        tanggal: string;
        jam_masuk: string | null;
        jam_keluar: string | null;
        status: string;
        jam_kerja_menit: number;
        lembur_menit: number;
        foto_masuk: string | null;
        keterangan?: string | null;
    }>;
    pengajuanIzin: Array<{
        id: number;
        tipe: string;
        tanggal_mulai: string;
        tanggal_selesai: string;
        total_hari: number;
        alasan: string;
        status: string;
        catatan_admin?: string | null;
    }>;
}

export default function Detail({ karyawan, riwayat, pengajuanIzin }: Props) {
    return (
        <AppLayout>
            <Head title={`Detail Presensi - ${karyawan.nama}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4] dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/absensi/admin"
                            className="p-2 rounded-[10px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[#0A0A0A] dark:text-zinc-100 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="font-serif text-2xl font-bold text-[#0A0A0A] dark:text-white">{karyawan.nama}</h1>
                            <p className="text-xs text-[#78716C] dark:text-zinc-400">
                                {karyawan.email} &bull; Jabatan: <span className="uppercase font-semibold">{karyawan.role}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                        <span className="text-[#78716C] dark:text-zinc-400 block">Telepon / WA</span>
                        <span className="font-semibold text-[#0A0A0A] dark:text-white">{karyawan.telepon || '-'}</span>
                    </div>
                    <div>
                        <span className="text-[#78716C] dark:text-zinc-400 block">Rate Gaji Harian</span>
                        <span className="font-mono font-bold text-[#0A0A0A] dark:text-white">{rupiah(karyawan.gaji_harian)}</span>
                    </div>
                    <div>
                        <span className="text-[#78716C] dark:text-zinc-400 block">Hari Masuk Bulan Ini</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{riwayat.filter(r => ['hadir', 'terlambat'].includes(r.status)).length} hari</span>
                    </div>
                    <div>
                        <span className="text-[#78716C] dark:text-zinc-400 block">Total Jam Kerja</span>
                        <span className="font-mono font-bold text-[#0A0A0A] dark:text-white">
                            {(riwayat.reduce((acc, r) => acc + r.jam_kerja_menit, 0) / 60).toFixed(1)} jam
                        </span>
                    </div>
                </div>

                {/* Riwayat Absensi */}
                <div className="bg-white dark:bg-zinc-900 rounded-[16px] border border-[#E7E5E4] dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#E7E5E4] dark:border-zinc-800 bg-[#FAFAF9] dark:bg-zinc-800/80">
                        <h3 className="font-bold text-sm text-[#0A0A0A] dark:text-white">Log Kehadiran Bulan Ini</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-[#E7E5E4] dark:border-zinc-800 text-[#78716C] dark:text-zinc-400 font-semibold uppercase text-[11px] bg-[#FAFAF9]/50 dark:bg-zinc-800/40">
                                <tr>
                                    <th className="px-5 py-3.5">Tanggal</th>
                                    <th className="px-5 py-3.5">Jam Masuk</th>
                                    <th className="px-5 py-3.5">Jam Pulang</th>
                                    <th className="px-5 py-3.5">Durasi</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E7E5E4] dark:divide-zinc-800">
                                {riwayat.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-[#78716C] dark:text-zinc-500">
                                            Belum ada data presensi pada bulan ini.
                                        </td>
                                    </tr>
                                ) : (
                                    riwayat.map(item => (
                                        <tr key={item.id} className="hover:bg-[#FAFAF9] dark:hover:bg-zinc-800/50 transition">
                                            <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">{tanggal_id(item.tanggal)}</td>
                                            <td className="px-5 py-3.5 font-mono text-zinc-900 dark:text-zinc-100">
                                                {item.jam_masuk ? new Date(item.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-zinc-900 dark:text-zinc-100">
                                                {item.jam_keluar ? new Date(item.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-zinc-900 dark:text-zinc-100">
                                                {item.jam_kerja_menit > 0 ? `${Math.floor(item.jam_kerja_menit / 60)}j ${item.jam_kerja_menit % 60}m` : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 capitalize font-bold text-[11px] text-zinc-900 dark:text-zinc-100">{item.status}</td>
                                            <td className="px-5 py-3.5 text-[#78716C] dark:text-zinc-400">{item.keterangan || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pengajuan Izin */}
                <div className="bg-white dark:bg-zinc-900 rounded-[16px] border border-[#E7E5E4] dark:border-zinc-800 shadow-sm p-5 space-y-3">
                    <h3 className="font-bold text-sm text-[#0A0A0A] dark:text-white pb-2 border-b border-[#E7E5E4] dark:border-zinc-800">
                        Riwayat Permohonan Izin Karyawan Ini
                    </h3>
                    <div className="space-y-2.5">
                        {pengajuanIzin.length === 0 ? (
                            <p className="text-xs text-[#78716C] dark:text-zinc-500 py-4 text-center">Belum ada riwayat permohonan izin.</p>
                        ) : (
                            pengajuanIzin.map(iz => (
                                <div key={iz.id} className="p-3 bg-[#FAFAF9] dark:bg-zinc-800/80 rounded-xl border border-[#E7E5E4] dark:border-zinc-700 text-xs flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-[#0A0A0A] dark:text-white uppercase mr-2">{iz.tipe}</span>
                                        <span className="text-[#78716C] dark:text-zinc-400">{tanggal_id(iz.tanggal_mulai)} s/d {tanggal_id(iz.tanggal_selesai)} ({iz.total_hari} hari)</span>
                                        <p className="text-[#0A0A0A] dark:text-zinc-200 mt-1">{iz.alasan}</p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                                        {iz.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
