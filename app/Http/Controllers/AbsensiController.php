<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\PengajuanIzin;
use App\Models\PengaturanAbsensi;
use App\Models\ShiftKasir;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AbsensiController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();
        $today = Carbon::today()->toDateString();
        $bulanSekarang = Carbon::today()->format('Y-m');

        // 1. Status Absensi Hari Ini
        $todayAbsensi = Absensi::where('user_id', $userId)
            ->whereDate('tanggal', $today)
            ->first();

        // 2. Statistik Bulan Ini untuk Karyawan
        $monthlyRecords = Absensi::where('user_id', $userId)
            ->where('tanggal', 'like', "{$bulanSekarang}%")
            ->get();

        $totalHadir = $monthlyRecords->whereIn('status', ['hadir', 'terlambat'])->count();
        $totalTerlambat = $monthlyRecords->where('status', 'terlambat')->count();
        $totalIzinCuti = $monthlyRecords->whereIn('status', ['izin', 'sakit', 'cuti'])->count();
        $totalMenitKerja = $monthlyRecords->sum('jam_kerja_menit');
        $totalJamKerja = round($totalMenitKerja / 60, 1);

        // 3. Pengaturan Absensi
        $settings = PengaturanAbsensi::allKeyValues();

        return Inertia::render('Absensi/Index', [
            'todayAbsensi' => $todayAbsensi,
            'stats' => [
                'total_hadir' => $totalHadir,
                'total_terlambat' => $totalTerlambat,
                'total_izin_cuti' => $totalIzinCuti,
                'total_jam_kerja' => $totalJamKerja,
                'total_menit_kerja' => $totalMenitKerja,
            ],
            'pengaturan' => [
                'aktif_swafoto' => ($settings['aktif_swafoto'] ?? '1') === '1',
                'aktif_gps' => ($settings['aktif_gps'] ?? '0') === '1',
                'radius_gps_meter' => (int) ($settings['radius_gps_meter'] ?? 100),
                'latitude_cafe' => (float) ($settings['latitude_cafe'] ?? -6.20000000),
                'longitude_cafe' => (float) ($settings['longitude_cafe'] ?? 106.81666600),
                'jam_masuk_normal' => $settings['jam_masuk_normal'] ?? '08:00',
                'toleransi_terlambat_menit' => (int) ($settings['toleransi_terlambat_menit'] ?? 15),
                'jam_pulang_normal' => $settings['jam_pulang_normal'] ?? '17:00',
            ],
        ]);
    }

    public function clockIn(Request $request)
    {
        $userId = auth()->id();
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();

        $settings = PengaturanAbsensi::allKeyValues();
        $wajibSwafoto = ($settings['aktif_swafoto'] ?? '1') === '1';
        $wajibGps = ($settings['aktif_gps'] ?? '0') === '1';

        // 1. Validasi Input
        $rules = [];
        if ($wajibGps) {
            $rules['latitude'] = 'required|numeric';
            $rules['longitude'] = 'required|numeric';
        } else {
            $rules['latitude'] = 'nullable|numeric';
            $rules['longitude'] = 'nullable|numeric';
        }

        $request->validate($rules);

        // 2. Cek apakah hari ini sudah clock in
        $existing = Absensi::where('user_id', $userId)
            ->whereDate('tanggal', $today)
            ->first();

        if ($existing) {
            if (is_null($existing->jam_keluar)) {
                return back()->with('error', 'Anda sudah clock in, silakan clock out terlebih dahulu.');
            }
            return back()->with('error', 'Absensi hari ini sudah selesai.');
        }

        // 3. Validasi GPS radius (jika aktif)
        if ($wajibGps && $request->filled('latitude') && $request->filled('longitude')) {
            $cafeLat = (float) ($settings['latitude_cafe'] ?? -6.20000000);
            $cafeLng = (float) ($settings['longitude_cafe'] ?? 106.81666600);
            $radiusMax = (int) ($settings['radius_gps_meter'] ?? 100);

            $distance = $this->calculateHaversineDistance(
                (float) $request->latitude,
                (float) $request->longitude,
                $cafeLat,
                $cafeLng
            );

            if ($distance > $radiusMax) {
                return back()->with('error', "Anda di luar radius cafe (" . round($distance) . " meter dari lokasi cafe, batas max {$radiusMax}m).");
            }
        }

        // 4. Simpan Swafoto
        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $request->validate(['foto' => 'image|max:2048']);
            $fotoPath = $request->file('foto')->store("absensi/{$userId}", 'public');
        } elseif ($request->filled('foto_base64')) {
            $fotoPath = $this->storeBase64Image($request->foto_base64, $userId, 'masuk');
        } elseif ($wajibSwafoto) {
            return back()->with('error', 'Swafoto wajib dilampirkan untuk melakukan absensi masuk.');
        }

        // 5. Hitung status On-Time atau Terlambat
        $jamMasukNormal = $settings['jam_masuk_normal'] ?? '08:00';
        $toleransiMenit = (int) ($settings['toleransi_terlambat_menit'] ?? 15);

        [$targetH, $targetM] = explode(':', $jamMasukNormal);
        $deadline = Carbon::today()->setTime((int) $targetH, (int) $targetM)->addMinutes($toleransiMenit);

        $status = 'hadir';
        $menitTerlambat = 0;
        if ($now->greaterThan($deadline)) {
            $status = 'terlambat';
            $menitTerlambat = $deadline->diffInMinutes($now);
        }

        // 6. Cek Shift Kasir aktif jika ada
        $activeShift = ShiftKasir::where('user_id', $userId)
            ->where('status', 'aktif')
            ->latest()
            ->first();

        // 7. Insert ke tabel absensi
        Absensi::create([
            'user_id' => $userId,
            'tanggal' => $today,
            'shift_id' => $activeShift?->id,
            'jam_masuk' => $now,
            'foto_masuk' => $fotoPath,
            'latitude_masuk' => $request->latitude,
            'longitude_masuk' => $request->longitude,
            'status' => $status,
            'keterangan' => $status === 'terlambat' ? "Terlambat {$menitTerlambat} menit" : 'Tepat waktu',
            'is_approved' => 1,
        ]);

        if ($status === 'terlambat') {
            return redirect()->route('absensi.index')->with('warning', "Absen masuk berhasil. Anda terlambat {$menitTerlambat} menit.");
        }

        return redirect()->route('absensi.index')->with('success', 'Absen masuk berhasil. Selamat bekerja!');
    }

    public function clockOut(Request $request)
    {
        $userId = auth()->id();
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();

        $settings = PengaturanAbsensi::allKeyValues();
        $wajibSwafoto = ($settings['aktif_swafoto'] ?? '1') === '1';

        // 1. Cek baris absensi aktif hari ini
        $absensi = Absensi::where('user_id', $userId)
            ->whereDate('tanggal', $today)
            ->whereNull('jam_keluar')
            ->first();

        if (!$absensi) {
            return back()->with('error', 'Tidak ditemukan catatan jam masuk aktif untuk hari ini.');
        }

        // 2. Simpan Swafoto Pulang (jika ada)
        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $request->validate(['foto' => 'image|max:2048']);
            $fotoPath = $request->file('foto')->store("absensi/{$userId}", 'public');
        } elseif ($request->filled('foto_base64')) {
            $fotoPath = $this->storeBase64Image($request->foto_base64, $userId, 'keluar');
        } elseif ($wajibSwafoto) {
            return back()->with('error', 'Swafoto wajib dilampirkan untuk melakukan absensi pulang.');
        }

        // 3. Hitung durasi kerja & lembur
        $jamMasuk = Carbon::parse($absensi->jam_masuk);
        $durasiMenit = max(0, $jamMasuk->diffInMinutes($now));
        $lemburMenit = max(0, $durasiMenit - 480); // > 8 jam kerja (480 menit)

        $absensi->update([
            'jam_keluar' => $now,
            'foto_keluar' => $fotoPath,
            'latitude_keluar' => $request->latitude,
            'longitude_keluar' => $request->longitude,
            'jam_kerja_menit' => $durasiMenit,
            'lembur_menit' => $lemburMenit,
        ]);

        // 4. Auto-close shift kasir jika user memiliki shift aktif
        $activeShift = ShiftKasir::where('user_id', $userId)
            ->where('status', 'aktif')
            ->latest()
            ->first();

        if ($activeShift) {
            $activeShift->update([
                'status' => 'tutup',
                'waktu_tutup' => $now,
                'catatan' => ($activeShift->catatan ? $activeShift->catatan . ' | ' : '') . 'Auto-close via clock-out absensi karyawan',
            ]);
        }

        $jam = floor($durasiMenit / 60);
        $menit = $durasiMenit % 60;

        return redirect()->route('absensi.index')->with('success', "Absen pulang berhasil. Total kerja: {$jam} jam {$menit} menit.");
    }

    public function riwayat(Request $request)
    {
        $userId = auth()->id();
        $bulan = (int) ($request->bulan ?? Carbon::today()->month);
        $tahun = (int) ($request->tahun ?? Carbon::today()->year);

        $query = Absensi::where('user_id', $userId)
            ->whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->orderBy('tanggal', 'desc');

        $riwayat = $query->get();

        $totalHadir = $riwayat->whereIn('status', ['hadir', 'terlambat'])->count();
        $totalTerlambat = $riwayat->where('status', 'terlambat')->count();
        $totalIzin = $riwayat->where('status', 'izin')->count();
        $totalSakit = $riwayat->where('status', 'sakit')->count();
        $totalCuti = $riwayat->where('status', 'cuti')->count();
        $totalAlpha = $riwayat->where('status', 'alpha')->count();
        $totalMenit = $riwayat->sum('jam_kerja_menit');
        $totalLemburMenit = $riwayat->sum('lembur_menit');

        return Inertia::render('Absensi/Riwayat', [
            'riwayat' => $riwayat,
            'filter' => [
                'bulan' => $bulan,
                'tahun' => $tahun,
            ],
            'rekap' => [
                'hadir' => $totalHadir,
                'terlambat' => $totalTerlambat,
                'izin' => $totalIzin,
                'sakit' => $totalSakit,
                'cuti' => $totalCuti,
                'alpha' => $totalAlpha,
                'total_jam_kerja' => round($totalMenit / 60, 1),
                'total_lembur_jam' => round($totalLemburMenit / 60, 1),
            ],
        ]);
    }

    public function formIzin()
    {
        $userId = auth()->id();

        $daftarIzin = PengajuanIzin::where('user_id', $userId)
            ->latest()
            ->paginate(15);

        return Inertia::render('Absensi/Izin', [
            'daftarIzin' => $daftarIzin,
        ]);
    }

    public function ajukanIzin(Request $request)
    {
        $userId = auth()->id();

        $request->validate([
            'tipe' => 'required|in:izin,sakit,cuti',
            'tanggal_mulai' => 'required|date|after_or_equal:today',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan' => 'required|string|min:10',
            'lampiran' => 'nullable|file|max:5120|mimes:pdf,jpg,jpeg,png',
        ], [
            'alasan.min' => 'Alasan pengajuan minimal 10 karakter.',
            'tanggal_mulai.after_or_equal' => 'Tanggal mulai minimal hari ini.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ]);

        $tglMulai = Carbon::parse($request->tanggal_mulai);
        $tglSelesai = Carbon::parse($request->tanggal_selesai);
        $totalHari = $tglMulai->diffInDays($tglSelesai) + 1;

        // Cek overlap dengan pengajuan lain yang statusnya pending atau approved
        $overlap = PengajuanIzin::where('user_id', $userId)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($q) use ($tglMulai, $tglSelesai) {
                $q->whereBetween('tanggal_mulai', [$tglMulai->toDateString(), $tglSelesai->toDateString()])
                  ->orWhereBetween('tanggal_selesai', [$tglMulai->toDateString(), $tglSelesai->toDateString()])
                  ->orWhere(function ($sub) use ($tglMulai, $tglSelesai) {
                      $sub->where('tanggal_mulai', '<=', $tglMulai->toDateString())
                          ->where('tanggal_selesai', '>=', $tglSelesai->toDateString());
                  });
            })
            ->exists();

        if ($overlap) {
            return back()->with('error', 'Anda sudah memiliki pengajuan izin yang sedang diproses atau disetujui pada rentang tanggal tersebut.');
        }

        $lampiranPath = null;
        if ($request->hasFile('lampiran')) {
            $lampiranPath = $request->file('lampiran')->store("izin/{$userId}", 'public');
        }

        $settings = PengaturanAbsensi::allKeyValues();
        $wajibApproval = ($settings['wajib_approval_izin'] ?? '1') === '1';

        $pengajuan = PengajuanIzin::create([
            'user_id' => $userId,
            'tipe' => $request->tipe,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'total_hari' => $totalHari,
            'alasan' => $request->alasan,
            'lampiran' => $lampiranPath,
            'status' => $wajibApproval ? 'pending' : 'approved',
            'approved_by' => $wajibApproval ? null : $userId,
            'approved_at' => $wajibApproval ? null : now(),
        ]);

        // Jika tidak perlu approval, langsung catat ke tabel absensi
        if (!$wajibApproval) {
            $curr = $tglMulai->copy();
            while ($curr->lessThanOrEqualTo($tglSelesai)) {
                Absensi::updateOrCreate(
                    ['user_id' => $userId, 'tanggal' => $curr->toDateString()],
                    [
                        'status' => $request->tipe,
                        'keterangan' => "Izin ({$request->tipe}): {$request->alasan}",
                        'is_approved' => 1,
                    ]
                );
                $curr->addDay();
            }
        }

        return redirect()->route('absensi.izin')->with('success', 'Pengajuan ' . ucfirst($request->tipe) . ' berhasil dikirim.');
    }

    // Helper: Haversine distance in meters
    private function calculateHaversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // meters

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    // Helper: Store base64 encoded photo from canvas capture
    private function storeBase64Image(string $base64Data, int $userId, string $type): ?string
    {
        try {
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $typeMatch)) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
                $extension = strtolower($typeMatch[1]);
                if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
                    $extension = 'jpg';
                }
            } else {
                $extension = 'jpg';
            }

            $decoded = base64_decode($base64Data);
            if ($decoded === false) {
                return null;
            }

            $fileName = "absensi/{$userId}/" . Carbon::today()->toDateString() . "_{$type}_" . Str::random(6) . ".{$extension}";
            Storage::disk('public')->put($fileName, $decoded);

            return $fileName;
        } catch (\Exception $e) {
            \Log::warning("Gagal menyimpan foto base64: " . $e->getMessage());
            return null;
        }
    }
}
