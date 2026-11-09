<?php

namespace App\Http\Controllers;

use App\Models\VisitorLog;
use App\Services\WhatsAppAlertService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DeveloperTelemetryController extends Controller
{
    /**
     * Kunci akses rahasia khusus developer / programmer.
     */
    private const SECRET_KEY = 'jelanghari2026';

    /**
     * Tampilkan halaman log kunjungan rahasia.
     */
    public function index(Request $request, WhatsAppAlertService $wa)
    {
        // Akses hanya diizinkan jika menyertakan secret key ATAU login sebagai role 'owner'
        $providedKey = $request->query('key');
        $isOwner = auth()->check() && (auth()->user()->role === 'owner' || auth()->user()->role_slug === 'owner');

        if ($providedKey !== self::SECRET_KEY && !$isOwner) {
            abort(404); // Samarkan menjadi 404 agar tidak terdeteksi oleh klien
        }

        // Ambil 100 aktivitas kunjungan terbaru
        $logs = VisitorLog::latest()->take(100)->get();

        // Statistik ringkas
        $totalVisits = VisitorLog::count();
        $todayVisits = VisitorLog::whereDate('created_at', Carbon::today())->count();
        $uniqueIps = VisitorLog::distinct('ip_address')->count('ip_address');
        $latestVisit = VisitorLog::latest()->first();

        return response()->view('dev-monitor', [
            'logs' => $logs,
            'totalVisits' => $totalVisits,
            'todayVisits' => $todayVisits,
            'uniqueIps' => $uniqueIps,
            'latestVisit' => $latestVisit,
            'secretKey' => self::SECRET_KEY,
            'waProvider' => $wa->getProvider(),
            'waPhone' => $wa->getPhone(),
            'waApiKey' => $wa->getApiKey(),
            'waConfigured' => $wa->isConfigured(),
        ]);
    }

    /**
     * Simpan konfigurasi WhatsApp untuk alert real-time.
     */
    public function saveWhatsApp(Request $request, WhatsAppAlertService $wa)
    {
        $providedKey = $request->input('key') ?? $request->query('key');
        $isOwner = auth()->check() && (auth()->user()->role === 'owner' || auth()->user()->role_slug === 'owner');

        if ($providedKey !== self::SECRET_KEY && !$isOwner) {
            abort(404);
        }

        $provider = trim($request->input('provider', 'callmebot'));
        $phone = trim($request->input('phone', ''));
        $apiKey = trim($request->input('api_key', ''));

        $wa->saveSettings($provider, $phone, $apiKey);

        return redirect()->route('dev.monitor', ['key' => self::SECRET_KEY])
            ->with('status', 'Konfigurasi notifikasi WhatsApp berhasil disimpan.');
    }

    /**
     * Kirim pesan tes langsung ke WhatsApp untuk verifikasi.
     */
    public function testWhatsApp(Request $request, WhatsAppAlertService $wa)
    {
        $providedKey = $request->input('key') ?? $request->query('key');
        $isOwner = auth()->check() && (auth()->user()->role === 'owner' || auth()->user()->role_slug === 'owner');

        if ($providedKey !== self::SECRET_KEY && !$isOwner) {
            abort(404);
        }

        $provider = trim($request->input('provider', 'callmebot'));
        $phone = trim($request->input('phone', ''));
        $apiKey = trim($request->input('api_key', ''));

        $result = $wa->sendTestMessage($provider, $phone, $apiKey);

        if ($result['success']) {
            return redirect()->route('dev.monitor', ['key' => self::SECRET_KEY])
                ->with('status', $result['message']);
        } else {
            return redirect()->route('dev.monitor', ['key' => self::SECRET_KEY])
                ->with('error', $result['message']);
        }
    }

    /**
     * Bersihkan riwayat log (opsional untuk programmer).
     */
    public function clear(Request $request)
    {
        $providedKey = $request->input('key') ?? $request->query('key');
        $isOwner = auth()->check() && (auth()->user()->role === 'owner' || auth()->user()->role_slug === 'owner');

        if ($providedKey !== self::SECRET_KEY && !$isOwner) {
            abort(404);
        }

        VisitorLog::truncate();

        return redirect()->route('dev.monitor', ['key' => self::SECRET_KEY])
            ->with('status', 'Seluruh riwayat log kunjungan berhasil dibersihkan.');
    }
}
