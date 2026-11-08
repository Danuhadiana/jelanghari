<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jelang Hari • Secret Visitor Telemetry</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-black">

    <div class="max-w-6xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
                <div class="flex items-center gap-2">
                    <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">Secret Dev Monitor</span>
                    <span class="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">Hidden Route</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-white mt-1">Live Visitor &amp; Client Activity Log</h1>
                <p class="text-xs text-zinc-400 mt-0.5">Memantau secara rahasia apakah klien/tamu sedang membuka web Jelang Hari beserta device yang digunakan.</p>
            </div>

            <div class="flex items-center gap-2">
                <a href="{{ route('dev.monitor', ['key' => $secretKey]) }}" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Refresh
                </a>
                <form action="{{ route('dev.monitor.clear') }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat log?')">
                    @csrf
                    <input type="hidden" name="key" value="{{ $secretKey }}">
                    <button type="submit" class="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-xs font-semibold text-rose-300 transition">
                        Reset Log
                    </button>
                </form>
            </div>
        </div>

        @if(session('status'))
            <div class="mt-4 p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                <span>{{ session('status') }}</span>
                <span class="font-mono text-[10px] text-emerald-500">Berhasil</span>
            </div>
        @endif

        <!-- Quick Stats Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
            <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span class="text-[11px] text-zinc-400 font-medium">Total Akses / Hits</span>
                <p class="text-2xl font-bold font-mono text-white mt-1">{{ number_format($totalVisits) }}</p>
            </div>
            <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span class="text-[11px] text-emerald-400 font-medium">Kunjungan Hari Ini</span>
                <p class="text-2xl font-bold font-mono text-emerald-400 mt-1">{{ number_format($todayVisits) }}</p>
            </div>
            <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span class="text-[11px] text-zinc-400 font-medium">Pengunjung Unik (IP)</span>
                <p class="text-2xl font-bold font-mono text-white mt-1">{{ number_format($uniqueIps) }}</p>
            </div>
            <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span class="text-[11px] text-zinc-400 font-medium">Aktivitas Terakhir</span>
                <p class="text-xs font-semibold font-mono text-zinc-300 mt-2 truncate">
                    {{ $latestVisit ? $latestVisit->created_at->timezone('Asia/Jakarta')->format('H:i:s') . ' WIB' : '-' }}
                </p>
                <span class="text-[10px] text-zinc-500 block truncate">{{ $latestVisit ? $latestVisit->url : 'Belum ada' }}</span>
            </div>
        </div>

        <!-- Log Table -->
        <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 class="text-sm font-bold text-white flex items-center gap-2">
                    <span>100 Log Kunjungan Terbaru</span>
                    <span class="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{{ count($logs) }} entri</span>
                </h2>
                <div class="text-[11px] font-mono text-zinc-500">
                    Auto-refresh: <span id="timer" class="text-emerald-400 font-bold">20s</span>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-zinc-900/90 text-zinc-400 font-mono text-[11px] border-b border-zinc-800">
                        <tr>
                            <th class="py-3 px-4">Waktu (WIB)</th>
                            <th class="py-3 px-4">Halaman (URL)</th>
                            <th class="py-3 px-4">Pengguna / Akun</th>
                            <th class="py-3 px-4">Perangkat &amp; Browser</th>
                            <th class="py-3 px-4">IP Address</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-800/60 font-mono">
                        @forelse($logs as $log)
                            <tr class="hover:bg-zinc-800/40 transition">
                                <td class="py-3 px-4 whitespace-nowrap text-zinc-300">
                                    <div class="font-semibold">{{ $log->created_at->timezone('Asia/Jakarta')->format('H:i:s') }}</div>
                                    <div class="text-[10px] text-zinc-500">{{ $log->created_at->timezone('Asia/Jakarta')->format('d M Y') }}</div>
                                </td>
                                <td class="py-3 px-4 font-sans font-medium text-white max-w-xs truncate">
                                    <div class="flex items-center gap-1.5">
                                        <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold {{ $log->method === 'POST' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400' }}">
                                            {{ $log->method }}
                                        </span>
                                        <span class="text-emerald-300 truncate" title="{{ $log->url }}">{{ $log->url }}</span>
                                    </div>
                                </td>
                                <td class="py-3 px-4 whitespace-nowrap font-sans">
                                    <div class="font-semibold {{ $log->user_role === 'owner' ? 'text-amber-400' : ($log->user_role === 'Guest' ? 'text-zinc-400' : 'text-emerald-400') }}">
                                        {{ $log->user_name }}
                                    </div>
                                    <div class="text-[10px] text-zinc-500 font-mono">{{ $log->user_role }}</div>
                                </td>
                                <td class="py-3 px-4 font-sans max-w-xs text-zinc-300">
                                    <div class="font-medium text-xs text-white truncate" title="{{ $log->device_info }}">
                                        {{ $log->device_info ?? 'Unknown' }}
                                    </div>
                                    <div class="text-[10px] text-zinc-500 font-mono truncate" title="{{ $log->user_agent }}">
                                        {{ $log->user_agent }}
                                    </div>
                                </td>
                                <td class="py-3 px-4 whitespace-nowrap text-zinc-400 text-[11px]">
                                    {{ $log->ip_address ?? '-' }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="py-12 text-center text-zinc-500 font-sans">
                                    Belum ada aktivitas kunjungan yang tercatat. Kunjungi website untuk mulai mencatat.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div class="mt-4 text-center text-[11px] text-zinc-600 font-mono">
            Jelang Hari Internal Telemetry • Hanya dapat diakses oleh Developer / Programmer melalui URL khusus berautentikasi.
        </div>
    </div>

    <script>
        let countdown = 20;
        const timerEl = document.getElementById('timer');
        setInterval(() => {
            countdown--;
            if (timerEl) timerEl.innerText = countdown + 's';
            if (countdown <= 0) {
                window.location.reload();
            }
        }, 1000);
    </script>
</body>
</html>
