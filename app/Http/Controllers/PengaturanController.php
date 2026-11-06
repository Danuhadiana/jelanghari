<?php

namespace App\Http\Controllers;

use App\Models\Pengaturan;
use App\Models\Meja;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengaturanController extends Controller
{
    public function index()
    {
        if (in_array(auth()->user()?->role, ['pelanggan'])) {
            abort(403, 'Akses pengaturan hanya untuk manajemen toko dan pegawai.');
        }

        $allSettings = Pengaturan::all()->pluck('nilai', 'kunci')->toArray();
        $mejas = Meja::orderBy('nomor')->get();

        return Inertia::render('Pengaturan/Index', [
            'settings' => $allSettings,
            'mejas' => $mejas,
        ]);
    }

    public function update(Request $request)
    {
        if (in_array(auth()->user()?->role, ['pelanggan'])) {
            abort(403, 'Akses pengaturan hanya untuk manajemen toko dan pegawai.');
        }
        $data = $request->except(['_token', 'mejas']);

        // Sinkronisasi alias pengaturan identitas kafe
        if (isset($data['tagline'])) {
            $data['tagline_cafe'] = $data['tagline'];
        }
        if (isset($data['telepon'])) {
            $data['telepon_cafe'] = $data['telepon'];
        }
        if (isset($data['alamat'])) {
            $data['alamat_cafe'] = $data['alamat'];
        }
        if (isset($data['instagram']) && empty($data['instagram_url'])) {
            $data['instagram_url'] = 'https://instagram.com/' . ltrim($data['instagram'], '@');
        }
        if (isset($data['tiktok']) && empty($data['tiktok_url'])) {
            $data['tiktok_url'] = 'https://tiktok.com/@' . ltrim($data['tiktok'], '@');
        }

        foreach ($data as $key => $value) {
            $storedVal = is_array($value) ? json_encode($value) : (is_bool($value) ? ($value ? '1' : '0') : (string) $value);
            Pengaturan::updateOrCreate(
                ['kunci' => $key],
                ['nilai' => $storedVal]
            );
        }

        return redirect()->route('pengaturan.index')->with('success', 'Pengaturan sistem dan identitas kafe berhasil disimpan.');
    }

    public function storeMeja(Request $request)
    {
        $validated = $request->validate([
            'nomor' => 'required|string|unique:mejas,nomor',
            'nama' => 'nullable|string|max:50',
            'area' => 'required|string|max:50',
            'kapasitas' => 'nullable|integer|min:0',
        ]);

        $validated['kapasitas'] = isset($validated['kapasitas']) && $validated['kapasitas'] !== '' ? (int)$validated['kapasitas'] : 0;

        Meja::create($validated);

        return redirect()->route('pengaturan.index')->with('success', 'Meja berhasil ditambahkan.');
    }

    public function destroyMeja(Meja $meja)
    {
        if ($meja->status === 'terisi') {
            return back()->with('error', 'Meja sedang terisi pelanggan dan tidak dapat dihapus.');
        }

        $meja->delete();
        return redirect()->route('pengaturan.index')->with('success', 'Meja berhasil dihapus.');
    }

    public function updateMeja(Request $request, Meja $meja)
    {
        $validated = $request->validate([
            'nomor' => 'required|string|unique:mejas,nomor,' . $meja->id,
            'nama' => 'nullable|string|max:50',
            'area' => 'required|string|max:50',
            'kapasitas' => 'nullable|integer|min:0',
            'status' => 'nullable|string|in:kosong,terisi,reservasi',
        ]);

        $validated['kapasitas'] = isset($validated['kapasitas']) && $validated['kapasitas'] !== '' ? (int)$validated['kapasitas'] : 0;

        $meja->update($validated);

        return redirect()->route('pengaturan.index')->with('success', 'Data meja berhasil diperbarui.');
    }

    public function getPanduan()
    {
        $panduan = Pengaturan::where('kunci', 'buku_panduan_custom')->value('nilai');
        return response()->json([
            'success' => true,
            'data' => $panduan ? json_decode($panduan, true) : null,
        ]);
    }

    public function savePanduan(Request $request)
    {
        $data = $request->input('panduan');
        Pengaturan::updateOrCreate(
            ['kunci' => 'buku_panduan_custom'],
            ['nilai' => json_encode($data)]
        );

        return response()->json([
            'success' => true,
            'message' => 'Buku panduan dan glosarium berhasil diperbarui.',
        ]);
    }
}
