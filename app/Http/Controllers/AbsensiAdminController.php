<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\PengajuanIzin;
use App\Models\PengaturanAbsensi;
use App\Models\User;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AbsensiAdminController extends Controller
{
    private function checkAdminAccess()
    {
        $user = auth()->user();
        $role = is_string($user->role) ? $user->role : ($user->role_slug ?? $user->role?->slug ?? 'pelanggan');
        if (!in_array(strtolower($role), ['owner', 'manager'])) {
            abort(403, 'Akses khusus Owner dan Manager.');
        }
    }

    public function index(Request $request)
    {
        $this->checkAdminAccess();

        $tanggal = $request->tanggal ?? Carbon::today()->toDateString();
        $search = $request->search;
        $filterStatus = $request->status;

        // 1. Data Karyawan (non-pelanggan)
        $karyawanQuery = User::where('role', '!=', 'pelanggan')
            ->where('is_aktif', true);

        if ($search) {
            $karyawanQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $allKaryawan = $karyawanQuery->orderBy('name')->get();

        // 2. Absensi pada tanggal terpilih
        $absensiRecords = Absensi::whereDate('tanggal', $tanggal)
            ->get()
            ->keyBy('user_id');

        // 3. Mapping status karyawan
        $staffStatusList = $allKaryawan->map(function ($user) use ($absensiRecords) {
            $record = $absensiRecords->get($user->id);
            $kondisi = 'belum_absen';
            $durasiMenit = 0;

            if ($record) {
                if ($record->jam_keluar) {
                    $kondisi = 'selesai';
                    $durasiMenit = $record->jam_kerja_menit;
                } elseif ($record->jam_masuk) {
                    $kondisi = 'sedang_bekerja';
                    $durasiMenit = max(0, Carbon::parse($record->jam_masuk)->diffInMinutes(now()));
                } else {
                    $kondisi = $record->status; // izin/sakit/cuti/alpha
                }
            }

            return [
                'user_id' => $user->id,
                'name' => $user->nama ?: $user->name,
                'email' => $user->email,
                'role' => is_string($user->role) ? $user->role : ($user->role?->nama ?? 'Staff'),
                'telepon' => $user->telepon,
                'kondisi' => $kondisi,
                'status_absensi' => $record?->status ?? 'belum_absen',
                'jam_masuk' => $record?->jam_masuk ? Carbon::parse($record->jam_masuk)->format('H:i') : null,
                'jam_keluar' => $record?->jam_keluar ? Carbon::parse($record->jam_keluar)->format('H:i') : null,
                'durasi_kerja' => $durasiMenit > 0 ? floor($durasiMenit / 60) . 'j ' . ($durasiMenit % 60) . 'm' : null,
                'lembur_menit' => $record?->lembur_menit ?? 0,
                'foto_masuk' => $record?->foto_masuk ? asset('storage/' . $record->foto_masuk) : null,
                'foto_keluar' => $record?->foto_keluar ? asset('storage/' . $record->foto_keluar) : null,
                'keterangan' => $record?->keterangan,
            ];
        });

        if ($filterStatus) {
            $staffStatusList = $staffStatusList->filter(function ($s) use ($filterStatus) {
                if ($filterStatus === 'hadir') return in_array($s['status_absensi'], ['hadir', 'terlambat']);
                if ($filterStatus === 'terlambat') return $s['status_absensi'] === 'terlambat';
                if ($filterStatus === 'izin') return in_array($s['status_absensi'], ['izin', 'sakit', 'cuti']);
                if ($filterStatus === 'belum_absen') return $s['kondisi'] === 'belum_absen';
                return $s['status_absensi'] === $filterStatus;
            })->values();
        }

        // 4. Stat Cards
        $totalHadirHariIni = $absensiRecords->whereIn('status', ['hadir', 'terlambat'])->count();
        $totalTerlambatHariIni = $absensiRecords->where('status', 'terlambat')->count();
        $totalIzinHariIni = $absensiRecords->whereIn('status', ['izin', 'sakit', 'cuti'])->count();
        $totalAlphaHariIni = max(0, $allKaryawan->count() - $absensiRecords->count());

        // 5. Pending Pengajuan Izin untuk approval cepat
        $pendingIzin = PengajuanIzin::with('user')
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('Absensi/Admin/Index', [
            'staffStatusList' => $staffStatusList,
            'stats' => [
                'hadir' => $totalHadirHariIni,
                'terlambat' => $totalTerlambatHariIni,
                'izin' => $totalIzinHariIni,
                'alpha' => $totalAlphaHariIni,
                'total_karyawan' => $allKaryawan->count(),
            ],
            'pendingIzin' => $pendingIzin,
            'filter' => [
                'tanggal' => $tanggal,
                'search' => $search,
                'status' => $filterStatus,
            ],
        ]);
    }

    public function rekap(Request $request)
    {
        $this->checkAdminAccess();

        $bulan = (int) ($request->bulan ?? Carbon::today()->month);
        $tahun = (int) ($request->tahun ?? Carbon::today()->year);
        $userId = $request->user_id;

        $karyawanQuery = User::where('role', '!=', 'pelanggan')->where('is_aktif', true);
        if ($userId) {
            $karyawanQuery->where('id', $userId);
        }
        $karyawans = $karyawanQuery->orderBy('name')->get();

        $absensiBulan = Absensi::whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->get()
            ->groupBy('user_id');

        $rekapData = $karyawans->map(function ($user) use ($absensiBulan) {
            $logs = $absensiBulan->get($user->id, collect());
            $hadirCount = $logs->where('status', 'hadir')->count();
            $terlambatCount = $logs->where('status', 'terlambat')->count();
            $izinCount = $logs->where('status', 'izin')->count();
            $sakitCount = $logs->where('status', 'sakit')->count();
            $cutiCount = $logs->where('status', 'cuti')->count();
            $alphaCount = $logs->where('status', 'alpha')->count();
            $totalMenit = $logs->sum('jam_kerja_menit');
            $totalLemburMenit = $logs->sum('lembur_menit');

            $gajiHarian = (float) ($user->gaji_harian ?? 100000);
            $totalHariMasuk = $hadirCount + $terlambatCount;
            $estimasiGaji = $totalHariMasuk * $gajiHarian;

            return [
                'user_id' => $user->id,
                'nama' => $user->nama ?: $user->name,
                'role' => is_string($user->role) ? $user->role : ($user->role?->nama ?? 'Staff'),
                'hadir' => $hadirCount,
                'terlambat' => $terlambatCount,
                'izin' => $izinCount,
                'sakit' => $sakitCount,
                'cuti' => $cutiCount,
                'alpha' => $alphaCount,
                'total_hari_masuk' => $totalHariMasuk,
                'total_jam_kerja' => round($totalMenit / 60, 1),
                'total_lembur_jam' => round($totalLemburMenit / 60, 1),
                'gaji_harian' => $gajiHarian,
                'estimasi_gaji' => $estimasiGaji,
            ];
        });

        return Inertia::render('Absensi/Admin/Rekap', [
            'rekapData' => $rekapData,
            'karyawans' => $karyawans->map(fn($u) => ['id' => $u->id, 'nama' => $u->nama ?: $u->name]),
            'filter' => [
                'bulan' => $bulan,
                'tahun' => $tahun,
                'user_id' => $userId,
            ],
        ]);
    }

    public function detail($user_id)
    {
        $this->checkAdminAccess();

        $user = User::findOrFail($user_id);
        $bulanSekarang = Carbon::today()->format('Y-m');

        $riwayatBulanIni = Absensi::where('user_id', $user_id)
            ->where('tanggal', 'like', "{$bulanSekarang}%")
            ->orderBy('tanggal', 'desc')
            ->get();

        $pengajuanIzinList = PengajuanIzin::where('user_id', $user_id)
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Absensi/Admin/Detail', [
            'karyawan' => [
                'id' => $user->id,
                'nama' => $user->nama ?: $user->name,
                'email' => $user->email,
                'role' => is_string($user->role) ? $user->role : ($user->role?->nama ?? 'Staff'),
                'telepon' => $user->telepon,
                'gaji_harian' => (float) ($user->gaji_harian ?? 100000),
            ],
            'riwayat' => $riwayatBulanIni,
            'pengajuanIzin' => $pengajuanIzinList,
        ]);
    }

    public function approve($id)
    {
        $this->checkAdminAccess();

        $pengajuan = PengajuanIzin::findOrFail($id);
        $pengajuan->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        // Catat hari izin ke tabel absensi
        $curr = Carbon::parse($pengajuan->tanggal_mulai);
        $selesai = Carbon::parse($pengajuan->tanggal_selesai);

        while ($curr->lessThanOrEqualTo($selesai)) {
            Absensi::updateOrCreate(
                ['user_id' => $pengajuan->user_id, 'tanggal' => $curr->toDateString()],
                [
                    'status' => $pengajuan->tipe,
                    'keterangan' => "Izin ({$pengajuan->tipe}) disetujui: {$pengajuan->alasan}",
                    'approved_by' => auth()->id(),
                    'approved_at' => now(),
                    'is_approved' => 1,
                ]
            );
            $curr->addDay();
        }

        // Simpan notifikasi jika tabel notifikasi tersedia
        try {
            if (class_exists(Notifikasi::class)) {
                Notifikasi::create([
                    'judul' => 'Pengajuan Izin Disetujui',
                    'pesan' => "Pengajuan {$pengajuan->tipe} Anda untuk tanggal {$pengajuan->tanggal_mulai->format('d/m/Y')} telah disetujui.",
                    'tipe' => 'success',
                ]);
            }
        } catch (\Exception $e) {}

        return back()->with('success', "Pengajuan izin #{$id} berhasil disetujui.");
    }

    public function reject(Request $request, $id)
    {
        $this->checkAdminAccess();

        $request->validate([
            'catatan_admin' => 'required|string|min:5',
        ], [
            'catatan_admin.required' => 'Wajib memberikan alasan penolakan.',
        ]);

        $pengajuan = PengajuanIzin::findOrFail($id);
        $pengajuan->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'catatan_admin' => $request->catatan_admin,
        ]);

        return back()->with('success', "Pengajuan izin #{$id} telah ditolak.");
    }

    public function export(Request $request)
    {
        $this->checkAdminAccess();

        $bulan = (int) ($request->bulan ?? Carbon::today()->month);
        $tahun = (int) ($request->tahun ?? Carbon::today()->year);

        $data = Absensi::with('user')
            ->whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->orderBy('tanggal')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"Absensi_JelangHari_{$bulan}_{$tahun}.csv\"",
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Tanggal', 'Nama Karyawan', 'Role', 'Status', 'Jam Masuk', 'Jam Pulang', 'Durasi (Menit)', 'Lembur (Menit)', 'Keterangan']);

            foreach ($data as $row) {
                fputcsv($file, [
                    $row->id,
                    $row->tanggal->format('Y-m-d'),
                    $row->user ? ($row->user->nama ?: $row->user->name) : 'User #' . $row->user_id,
                    is_string($row->user?->role) ? $row->user->role : ($row->user?->role?->nama ?? '-'),
                    $row->status,
                    $row->jam_masuk ? Carbon::parse($row->jam_masuk)->format('H:i:s') : '-',
                    $row->jam_keluar ? Carbon::parse($row->jam_keluar)->format('H:i:s') : '-',
                    $row->jam_kerja_menit,
                    $row->lembur_menit,
                    $row->keterangan ?? '-',
                ]);
            }
            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    public function pengaturan()
    {
        $this->checkAdminAccess();

        $settings = PengaturanAbsensi::allKeyValues();

        return Inertia::render('Absensi/Admin/Pengaturan', [
            'settings' => [
                'aktif_swafoto' => ($settings['aktif_swafoto'] ?? '1') === '1',
                'aktif_gps' => ($settings['aktif_gps'] ?? '0') === '1',
                'radius_gps_meter' => (int) ($settings['radius_gps_meter'] ?? 100),
                'jam_masuk_normal' => $settings['jam_masuk_normal'] ?? '08:00',
                'toleransi_terlambat_menit' => (int) ($settings['toleransi_terlambat_menit'] ?? 15),
                'jam_pulang_normal' => $settings['jam_pulang_normal'] ?? '17:00',
                'wajib_approval_izin' => ($settings['wajib_approval_izin'] ?? '1') === '1',
                'maks_absen_per_hari' => (int) ($settings['maks_absen_per_hari'] ?? 1),
                'latitude_cafe' => (float) ($settings['latitude_cafe'] ?? -6.20000000),
                'longitude_cafe' => (float) ($settings['longitude_cafe'] ?? 106.81666600),
            ],
        ]);
    }

    public function updatePengaturan(Request $request)
    {
        $this->checkAdminAccess();

        $data = $request->validate([
            'aktif_swafoto' => 'required|boolean',
            'aktif_gps' => 'required|boolean',
            'radius_gps_meter' => 'required|numeric|min:10',
            'jam_masuk_normal' => 'required|string',
            'toleransi_terlambat_menit' => 'required|numeric|min:0',
            'jam_pulang_normal' => 'required|string',
            'wajib_approval_izin' => 'required|boolean',
            'maks_absen_per_hari' => 'required|numeric|min:1',
            'latitude_cafe' => 'required|numeric',
            'longitude_cafe' => 'required|numeric',
        ]);

        foreach ($data as $key => $val) {
            PengaturanAbsensi::set($key, is_bool($val) ? ($val ? '1' : '0') : (string) $val);
        }

        return back()->with('success', 'Pengaturan absensi berhasil diperbarui.');
    }
}
