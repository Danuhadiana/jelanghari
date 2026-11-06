<?php

namespace App\Http\Controllers;

use App\Models\Reservasi;
use App\Models\Meja;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservasiController extends Controller
{
    /**
     * Tampilkan data manajemen reservasi untuk Owner & Manager.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        if ($user && in_array($user->role, ['pelanggan'])) {
            abort(403, 'Akses reservasi manajemen hanya untuk staf dan pemilik toko.');
        }

        $query = Reservasi::with(['meja', 'user'])->latest();

        // Filter status
        if ($request->filled('status') && $request->status !== 'semua') {
            $query->where('status', $request->status);
        }

        // Filter tanggal
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        // Search nama atau telepon
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_pemesan', 'like', "%{$search}%")
                  ->orWhere('telepon', 'like', "%{$search}%");
            });
        }

        $reservasis = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => Reservasi::count(),
            'menunggu' => Reservasi::where('status', 'menunggu')->count(),
            'dikonfirmasi' => Reservasi::where('status', 'dikonfirmasi')->count(),
            'selesai' => Reservasi::where('status', 'selesai')->count(),
            'dibatalkan' => Reservasi::where('status', 'dibatalkan')->count(),
            'hari_ini' => Reservasi::whereDate('tanggal', now()->toDateString())->count(),
        ];

        $mejas = Meja::where('is_aktif', true)->orderBy('nomor')->get();

        $settings = [
            'reservasi_aktif' => (string) Pengaturan::get('reservasi_aktif', '1'),
            'reservasi_jam_buka' => (string) Pengaturan::get('reservasi_jam_buka', '09:00'),
            'reservasi_jam_tutup' => (string) Pengaturan::get('reservasi_jam_tutup', '22:00'),
            'reservasi_min_dp' => (float) Pengaturan::get('reservasi_min_dp', 0),
            'reservasi_maks_durasi' => (int) Pengaturan::get('reservasi_maks_durasi', 2),
            'reservasi_syarat' => (string) Pengaturan::get('reservasi_syarat', 'Harap hadir tepat waktu. Meja akan ditahan maksimal 20 menit setelah jam reservasi.'),
            'reservasi_wa_admin' => (string) Pengaturan::get('reservasi_wa_admin', '0821-1594-1156'),
        ];

        return Inertia::render('Reservasi/Index', [
            'reservasis' => $reservasis,
            'stats' => $stats,
            'mejas' => $mejas,
            'settings' => $settings,
            'filters' => [
                'status' => $request->status ?? 'semua',
                'tanggal' => $request->tanggal ?? '',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Tambah reservasi manual oleh staf/owner.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pemesan' => 'required|string|max:100',
            'telepon' => 'required|string|max:20',
            'tanggal' => 'required|date',
            'jam' => 'required|string',
            'durasi_jam' => 'required|integer|min:1|max:12',
            'jumlah_orang' => 'required|integer|min:1|max:50',
            'meja_id' => 'nullable|exists:mejas,id',
            'status' => 'required|in:menunggu,dikonfirmasi,selesai,dibatalkan',
            'dp_nominal' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string|max:500',
            'catatan_admin' => 'nullable|string|max:500',
        ]);

        Reservasi::create($validated);

        return back()->with('success', 'Reservasi meja berhasil ditambahkan.');
    }

    /**
     * Update data reservasi (edit jadwal, meja, atau catatan oleh owner).
     */
    public function update(Request $request, Reservasi $reservasi)
    {
        $validated = $request->validate([
            'nama_pemesan' => 'required|string|max:100',
            'telepon' => 'required|string|max:20',
            'tanggal' => 'required|date',
            'jam' => 'required|string',
            'durasi_jam' => 'required|integer|min:1|max:12',
            'jumlah_orang' => 'required|integer|min:1|max:50',
            'meja_id' => 'nullable|exists:mejas,id',
            'status' => 'required|in:menunggu,dikonfirmasi,selesai,dibatalkan',
            'dp_nominal' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string|max:500',
            'catatan_admin' => 'nullable|string|max:500',
        ]);

        $reservasi->update($validated);

        return back()->with('success', 'Data reservasi berhasil diperbarui.');
    }

    /**
     * Cepat ubah status reservasi (Konfirmasi, Selesai, Batalkan).
     */
    public function updateStatus(Request $request, Reservasi $reservasi)
    {
        $request->validate([
            'status' => 'required|in:menunggu,dikonfirmasi,selesai,dibatalkan',
            'catatan_admin' => 'nullable|string|max:500',
        ]);

        $reservasi->update([
            'status' => $request->status,
            'catatan_admin' => $request->catatan_admin ?? $reservasi->catatan_admin,
        ]);

        return back()->with('success', "Status reservasi berhasil diubah menjadi {$request->status}.");
    }

    /**
     * Hapus data reservasi.
     */
    public function destroy(Reservasi $reservasi)
    {
        $reservasi->delete();
        return back()->with('success', 'Data reservasi berhasil dihapus.');
    }

    /**
     * Simpan konfigurasi aturan sistem reservasi oleh Owner.
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'reservasi_aktif' => 'required|in:0,1',
            'reservasi_jam_buka' => 'required|string',
            'reservasi_jam_tutup' => 'required|string',
            'reservasi_min_dp' => 'required|numeric|min:0',
            'reservasi_maks_durasi' => 'required|integer|min:1|max:12',
            'reservasi_syarat' => 'required|string',
            'reservasi_wa_admin' => 'required|string',
        ]);

        foreach ($request->only([
            'reservasi_aktif',
            'reservasi_jam_buka',
            'reservasi_jam_tutup',
            'reservasi_min_dp',
            'reservasi_maks_durasi',
            'reservasi_syarat',
            'reservasi_wa_admin',
        ]) as $k => $v) {
            Pengaturan::set($k, $v, 'reservasi', is_numeric($v) ? 'number' : 'string');
        }

        return back()->with('success', 'Pengaturan sistem reservasi berhasil disimpan.');
    }
}
