<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jelang Hari • Developer Telemetry &amp; Visitor Monitor</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    }
                }
            }
        }
    </script>
    <style>
        /* Custom subtle scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
    </style>
</head>
<body class="bg-[#09090b] text-zinc-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-black">

    <!-- Top Glow Line -->
    <div class="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        <!-- ── HEADER UTAMA ── -->
        <header class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
            <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        LIVE RADAR
                    </span>
                    <span class="text-xs font-mono text-zinc-500">ID: jelanghari-telemetry</span>
                </div>
                <h1 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Aktivitas Kunjungan Klien &amp; Tamu</span>
                </h1>
                <p class="text-xs text-zinc-400 max-w-2xl">
                    Log rahasia internal: memantau waktu kunjungan, halaman yang dibuka, perangkat HP/Laptop klien, dan akun pengguna secara senyap.
                </p>
            </div>

            <!-- Action Controls -->
            <div class="flex flex-wrap items-center gap-2">
                <!-- Auto-refresh pill -->
                <button id="toggleRefreshBtn" onclick="toggleAutoRefresh()" class="px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-zinc-300 transition flex items-center gap-2">
                    <span id="refreshDot" class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Refresh: <strong id="timerText" class="font-mono text-emerald-400">15s</strong></span>
                </button>

                <!-- Copy Secret Link -->
                <button onclick="copySecretLink()" id="copyBtn" class="px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-zinc-300 transition flex items-center gap-1.5" title="Salin link monitor rahasia">
                    <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <span id="copyBtnText">Salin URL</span>
                </button>

                <!-- Manual Reload -->
                <a href="{{ route('dev.monitor', ['key' => $secretKey]) }}" class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>Cek Sekarang</span>
                </a>

                <!-- Reset Log Form -->
                <form action="{{ route('dev.monitor.clear') }}" method="POST" onsubmit="return confirm('Kosongkan semua rekaman riwayat log kunjungan?')">
                    @csrf
                    <input type="hidden" name="key" value="{{ $secretKey }}">
                    <button type="submit" class="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-semibold text-rose-300 transition flex items-center gap-1" title="Hapus riwayat log">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        <span>Reset</span>
                    </button>
                </form>
            </div>
        </header>

        @if(session('status'))
            <div class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{{ session('status') }}</span>
                </div>
                <span class="text-[10px] font-mono text-emerald-400">Success</span>
            </div>
        @endif

        <!-- ── STATISTIK KARTU ── -->
        <section class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <!-- Total Hits -->
            <div class="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 relative overflow-hidden">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-zinc-400">Total Kunjungan</span>
                    <span class="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </span>
                </div>
                <p class="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-2">{{ number_format($totalVisits) }}</p>
                <span class="text-[10px] text-zinc-500 font-mono mt-1 block">Semua rekaman hit</span>
            </div>

            <!-- Hari Ini -->
            <div class="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 relative overflow-hidden">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-emerald-400">Hari Ini</span>
                    <span class="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                </div>
                <p class="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-2">{{ number_format($todayVisits) }}</p>
                <span class="text-[10px] text-zinc-500 font-mono mt-1 block">Akses dalam 24 jam</span>
            </div>

            <!-- Pengunjung Unik -->
            <div class="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 relative overflow-hidden">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-indigo-400">Perangkat Unik (IP)</span>
                    <span class="p-1.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </span>
                </div>
                <p class="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-300 mt-2">{{ number_format($uniqueIps) }}</p>
                <span class="text-[10px] text-zinc-500 font-mono mt-1 block">Koneksi unik terdeteksi</span>
            </div>

            <!-- Aktivitas Terkini -->
            <div class="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 relative overflow-hidden">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-amber-400">Aktivitas Terakhir</span>
                    <span class="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </span>
                </div>
                <p class="text-base sm:text-lg font-bold font-mono text-amber-300 mt-2 truncate">
                    {{ $latestVisit ? $latestVisit->created_at->timezone('Asia/Jakarta')->format('H:i:s') . ' WIB' : '-' }}
                </p>
                <span class="text-[10px] text-zinc-400 font-mono truncate block" title="{{ $latestVisit ? $latestVisit->url : '' }}">
                    {{ $latestVisit ? $latestVisit->url : 'Belum ada data' }}
                </span>
            </div>
        </section>

        <!-- ── FILTER & PENCARIAN CEPAT ── -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/70">
            <!-- Search Bar -->
            <div class="relative flex-1">
                <svg class="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input
                    type="text"
                    id="searchInput"
                    onkeyup="filterLogs()"
                    placeholder="Cari IP, perangkat (Realme, iPhone), halaman, atau nama user..."
                    class="w-full pl-9 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
            </div>

            <!-- Quick Filter Tabs -->
            <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                <button onclick="setFilter('all')" id="btn-all" class="filter-btn px-3 py-1.5 rounded-lg font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 transition">Semua</button>
                <button onclick="setFilter('guest')" id="btn-guest" class="filter-btn px-3 py-1.5 rounded-lg font-semibold bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition">Tamu/Klien</button>
                <button onclick="setFilter('staff')" id="btn-staff" class="filter-btn px-3 py-1.5 rounded-lg font-semibold bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition">Staf</button>
                <button onclick="setFilter('mobile')" id="btn-mobile" class="filter-btn px-3 py-1.5 rounded-lg font-semibold bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition">📱 HP</button>
                <button onclick="setFilter('desktop')" id="btn-desktop" class="filter-btn px-3 py-1.5 rounded-lg font-semibold bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition">💻 Laptop</button>
            </div>
        </div>

        <!-- ── DAFTAR LOG KUNJUNGAN ── -->
        <div class="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <!-- Table Header Bar -->
            <div class="p-4 border-b border-zinc-800/80 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <h2 class="text-sm font-bold text-white tracking-tight">Log Kunjungan Terbaru</h2>
                    <span id="displayedCount" class="text-[11px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-semibold">
                        {{ count($logs) }} entri
                    </span>
                </div>
                <span class="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                    Disortir berdasarkan waktu terbaru
                </span>
            </div>

            <!-- Table for Desktop -->
            <div class="hidden md:block overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] border-b border-zinc-800 uppercase tracking-wider">
                        <tr>
                            <th class="py-3 px-4">Waktu (WIB)</th>
                            <th class="py-3 px-4">Halaman yang Dibuka</th>
                            <th class="py-3 px-4">Identitas / Akun</th>
                            <th class="py-3 px-4">Perangkat &amp; Browser</th>
                            <th class="py-3 px-4">IP Address</th>
                            <th class="py-3 px-4 text-center">Info</th>
                        </tr>
                    </thead>
                    <tbody id="logsTableBody" class="divide-y divide-zinc-800/60">
                        @forelse($logs as $log)
                            @php
                                $isMobile = stripos($log->device_info, 'phone') !== false || stripos($log->device_info, 'android') !== false || stripos($log->device_info, 'ios') !== false || stripos($log->device_info, 'iphone') !== false;
                                $isStaff = in_array(strtolower($log->user_role ?? ''), ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'dapur']);
                                $filterType = $isStaff ? 'staff' : 'guest';
                                $filterDevice = $isMobile ? 'mobile' : 'desktop';
                            @endphp
                            <tr class="log-row hover:bg-zinc-800/30 transition group" 
                                data-user="{{ strtolower($log->user_name . ' ' . $log->user_role) }}" 
                                data-url="{{ strtolower($log->url) }}" 
                                data-device="{{ strtolower($log->device_info ?? '') }}" 
                                data-ip="{{ $log->ip_address ?? '' }}"
                                data-category="{{ $filterType }}"
                                data-devicetype="{{ $filterDevice }}">
                                
                                <!-- Waktu -->
                                <td class="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-300">
                                    <div class="font-bold text-white text-xs">
                                        {{ $log->created_at->timezone('Asia/Jakarta')->format('H:i:s') }}
                                        <span class="text-[10px] text-zinc-500 font-normal">WIB</span>
                                    </div>
                                    <div class="text-[10px] text-zinc-500 mt-0.5">
                                        {{ $log->created_at->timezone('Asia/Jakarta')->format('d M Y') }}
                                    </div>
                                </td>

                                <!-- URL / Halaman -->
                                <td class="py-3.5 px-4 font-medium text-white max-w-[200px] truncate">
                                    <div class="flex items-center gap-1.5">
                                        @if($log->method === 'POST')
                                            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">POST</span>
                                        @else
                                            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">GET</span>
                                        @endif
                                        
                                        @php
                                            $cleanUrl = $log->url;
                                            $badgeColor = 'bg-zinc-800 text-zinc-300 border-zinc-700';
                                            $pageName = $cleanUrl;
                                            if ($cleanUrl === '/' || $cleanUrl === '') {
                                                $badgeColor = 'bg-blue-500/10 text-blue-300 border-blue-500/30';
                                                $pageName = '/ (Beranda Kafe)';
                                            } elseif (str_contains($cleanUrl, 'kds')) {
                                                $badgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
                                                $pageName = '/kds (Kitchen Barista)';
                                            } elseif (str_contains($cleanUrl, 'kasir')) {
                                                $badgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
                                                $pageName = '/kasir (POS Kasir)';
                                            } elseif (str_contains($cleanUrl, 'dashboard')) {
                                                $badgeColor = 'bg-purple-500/10 text-purple-300 border-purple-500/30';
                                                $pageName = '/dashboard (Admin)';
                                            } elseif (str_contains($cleanUrl, 'absensi')) {
                                                $badgeColor = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
                                                $pageName = '/absensi (Presensi)';
                                            }
                                        @endphp
                                        <span class="inline-block px-2 py-0.5 rounded-md text-[11px] font-mono border {{ $badgeColor }} truncate" title="{{ $cleanUrl }}">
                                            {{ $pageName }}
                                        </span>
                                    </div>
                                </td>

                                <!-- User / Role -->
                                <td class="py-3.5 px-4 whitespace-nowrap">
                                    <div class="flex items-center gap-2">
                                        @if($isStaff)
                                            <span class="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center border border-amber-500/40">
                                                {{ strtoupper(substr($log->user_name, 0, 1)) }}
                                            </span>
                                            <div>
                                                <div class="font-bold text-amber-300 text-xs">{{ $log->user_name }}</div>
                                                <div class="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider">{{ $log->user_role }}</div>
                                            </div>
                                        @else
                                            <span class="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 font-bold text-[10px] flex items-center justify-center border border-zinc-700">
                                                T
                                            </span>
                                            <div>
                                                <div class="font-semibold text-zinc-300 text-xs">Tamu / Klien (Belum Login)</div>
                                                <div class="text-[10px] font-mono text-zinc-500">Calon Pelanggan</div>
                                            </div>
                                        @endif
                                    </div>
                                </td>

                                <!-- Device & Browser -->
                                <td class="py-3.5 px-4 max-w-xs text-zinc-300">
                                    <div class="flex items-center gap-1.5">
                                        @if($isMobile)
                                            <span class="p-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px]">📱</span>
                                        @else
                                            <span class="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[11px]">💻</span>
                                        @endif
                                        <span class="font-semibold text-xs text-zinc-200 truncate" title="{{ $log->device_info }}">
                                            {{ $log->device_info ?? 'Unknown Device' }}
                                        </span>
                                    </div>
                                    <div class="text-[10px] text-zinc-500 font-mono truncate mt-0.5 pl-6" title="{{ $log->user_agent }}">
                                        {{ Str::limit($log->user_agent, 45) }}
                                    </div>
                                </td>

                                <!-- IP Address -->
                                <td class="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-400 text-[11px]">
                                    <span class="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                                        {{ $log->ip_address ?? '127.0.0.1' }}
                                    </span>
                                </td>

                                <!-- Details View Button -->
                                <td class="py-3.5 px-4 text-center">
                                    <button onclick="showDetail({{ json_encode($log) }})" class="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition" title="Lihat detail lengkap user-agent & referer">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </button>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="py-12 text-center text-zinc-500">
                                    Belum ada catatan kunjungan. Buka web Jelang Hari untuk mulai mencatat.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <!-- Card View for Mobile Screens -->
            <div id="logsMobileList" class="block md:hidden divide-y divide-zinc-800/80">
                @forelse($logs as $log)
                    @php
                        $isMobile = stripos($log->device_info, 'phone') !== false || stripos($log->device_info, 'android') !== false || stripos($log->device_info, 'ios') !== false || stripos($log->device_info, 'iphone') !== false;
                        $isStaff = in_array(strtolower($log->user_role ?? ''), ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'dapur']);
                        $filterType = $isStaff ? 'staff' : 'guest';
                        $filterDevice = $isMobile ? 'mobile' : 'desktop';
                    @endphp
                    <div class="log-card p-4 space-y-2 hover:bg-zinc-800/20 transition"
                        data-user="{{ strtolower($log->user_name . ' ' . $log->user_role) }}" 
                        data-url="{{ strtolower($log->url) }}" 
                        data-device="{{ strtolower($log->device_info ?? '') }}" 
                        data-ip="{{ $log->ip_address ?? '' }}"
                        data-category="{{ $filterType }}"
                        data-devicetype="{{ $filterDevice }}">

                        <!-- Top row: Time + Method + URL -->
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-1.5 min-w-0">
                                <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold {{ $log->method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300' }}">
                                    {{ $log->method }}
                                </span>
                                <span class="font-mono text-xs font-bold text-white truncate">{{ $log->url }}</span>
                            </div>
                            <span class="text-[11px] font-mono text-zinc-400 shrink-0">
                                {{ $log->created_at->timezone('Asia/Jakarta')->format('H:i:s') }}
                            </span>
                        </div>

                        <!-- Mid row: User & Role -->
                        <div class="flex items-center justify-between text-xs">
                            <span class="font-semibold {{ $isStaff ? 'text-amber-300' : 'text-zinc-300' }}">
                                {{ $isStaff ? $log->user_name . ' (' . strtoupper($log->user_role) . ')' : 'Tamu / Calon Pelanggan' }}
                            </span>
                            <span class="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded">
                                {{ $log->ip_address }}
                            </span>
                        </div>

                        <!-- Bottom row: Device & Details -->
                        <div class="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                            <span class="flex items-center gap-1 truncate max-w-[240px]">
                                <span>{{ $isMobile ? '📱' : '💻' }}</span>
                                <span class="text-zinc-300 truncate">{{ $log->device_info }}</span>
                            </span>
                            <button onclick="showDetail({{ json_encode($log) }})" class="text-emerald-400 font-semibold hover:underline shrink-0">
                                Detail &rarr;
                            </button>
                        </div>
                    </div>
                @empty
                    <div class="p-8 text-center text-xs text-zinc-500">
                        Belum ada rekaman kunjungan.
                    </div>
                @endforelse
            </div>
        </div>

        <!-- Footer Notice -->
        <footer class="text-center text-xs text-zinc-600 font-mono pt-4">
            Jelang Hari Internal Telemetry • Terenkripsi &amp; hanya diketahui oleh Programmer melalui kunci rahasia.
        </footer>
    </div>

    <!-- ── MODAL DETAIL LENGKAP ── -->
    <div id="detailModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 class="font-bold text-white text-sm flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Detail Telemetry Pengunjung</span>
                </h3>
                <button onclick="closeModal()" class="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800">✕</button>
            </div>

            <div class="space-y-3 text-xs font-mono">
                <div>
                    <span class="text-zinc-500 block text-[10px] uppercase">Waktu Kunjungan</span>
                    <p id="modalTime" class="text-white font-semibold mt-0.5"></p>
                </div>
                <div>
                    <span class="text-zinc-500 block text-[10px] uppercase">Halaman (URL)</span>
                    <p id="modalUrl" class="text-emerald-400 font-bold mt-0.5 break-all"></p>
                </div>
                <div>
                    <span class="text-zinc-500 block text-[10px] uppercase">Pengguna &amp; Role</span>
                    <p id="modalUser" class="text-white mt-0.5"></p>
                </div>
                <div>
                    <span class="text-zinc-500 block text-[10px] uppercase">Perangkat &amp; OS</span>
                    <p id="modalDevice" class="text-teal-300 font-semibold mt-0.5"></p>
                </div>
                <div>
                    <span class="text-zinc-500 block text-[10px] uppercase">Alamat IP</span>
                    <p id="modalIp" class="text-zinc-300 mt-0.5"></p>
                </div>
                <div>
                    <span class="text-zinc-500 block text-[10px] uppercase">User-Agent Lengkap</span>
                    <p id="modalUa" class="text-zinc-400 text-[11px] bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 break-all leading-relaxed"></p>
                </div>
                <div id="modalRefWrap">
                    <span class="text-zinc-500 block text-[10px] uppercase">Referrer</span>
                    <p id="modalRef" class="text-zinc-400 break-all"></p>
                </div>
            </div>

            <div class="pt-2">
                <button onclick="closeModal()" class="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold text-xs transition">
                    Tutup
                </button>
            </div>
        </div>
    </div>

    <!-- ── JAVASCRIPT LOGIC ── -->
    <script>
        // 1. Auto-refresh counter
        let refreshSeconds = 15;
        let isPaused = false;
        const timerText = document.getElementById('timerText');
        const refreshDot = document.getElementById('refreshDot');

        setInterval(() => {
            if (isPaused) return;
            refreshSeconds--;
            if (timerText) timerText.innerText = refreshSeconds + 's';
            if (refreshSeconds <= 0) {
                window.location.reload();
            }
        }, 1000);

        function toggleAutoRefresh() {
            isPaused = !isPaused;
            if (isPaused) {
                timerText.innerText = 'PAUSED';
                refreshDot.classList.remove('animate-ping', 'bg-emerald-400');
                refreshDot.classList.add('bg-zinc-500');
            } else {
                refreshSeconds = 15;
                timerText.innerText = refreshSeconds + 's';
                refreshDot.classList.remove('bg-zinc-500');
                refreshDot.classList.add('animate-ping', 'bg-emerald-400');
            }
        }

        // 2. Salin URL Rahasia
        function copySecretLink() {
            navigator.clipboard.writeText(window.location.href);
            const btnText = document.getElementById('copyBtnText');
            btnText.innerText = 'Tersalin!';
            setTimeout(() => {
                btnText.innerText = 'Salin URL';
            }, 2000);
        }

        // 3. Filter Kategori (Semua, Tamu, Staf, HP, Laptop)
        let currentFilter = 'all';

        function setFilter(category) {
            currentFilter = category;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.className = 'filter-btn px-3 py-1.5 rounded-lg font-semibold bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition';
            });
            const activeBtn = document.getElementById('btn-' + category);
            if (activeBtn) {
                activeBtn.className = 'filter-btn px-3 py-1.5 rounded-lg font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 transition';
            }
            filterLogs();
        }

        // 4. Live Search & Filter Kombinasi
        function filterLogs() {
            const query = (document.getElementById('searchInput').value || '').toLowerCase();
            const rows = document.querySelectorAll('.log-row');
            const cards = document.querySelectorAll('.log-card');
            let visibleCount = 0;

            const checkMatch = (el) => {
                const user = el.getAttribute('data-user') || '';
                const url = el.getAttribute('data-url') || '';
                const device = el.getAttribute('data-device') || '';
                const ip = el.getAttribute('data-ip') || '';
                const category = el.getAttribute('data-category') || '';
                const deviceType = el.getAttribute('data-devicetype') || '';

                // Cek tab filter
                let matchesCategory = true;
                if (currentFilter === 'guest') matchesCategory = (category === 'guest');
                else if (currentFilter === 'staff') matchesCategory = (category === 'staff');
                else if (currentFilter === 'mobile') matchesCategory = (deviceType === 'mobile');
                else if (currentFilter === 'desktop') matchesCategory = (deviceType === 'desktop');

                // Cek query search
                const matchesSearch = query === '' || 
                    user.includes(query) || 
                    url.includes(query) || 
                    device.includes(query) || 
                    ip.includes(query);

                return matchesCategory && matchesSearch;
            };

            rows.forEach(row => {
                if (checkMatch(row)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            cards.forEach(card => {
                if (checkMatch(card)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });

            const countBadge = document.getElementById('displayedCount');
            if (countBadge) {
                countBadge.innerText = visibleCount + ' entri';
            }
        }

        // 5. Modal Detail
        function showDetail(log) {
            document.getElementById('modalTime').innerText = new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' }) + ' WIB';
            document.getElementById('modalUrl').innerText = log.method + ' ' + log.url;
            document.getElementById('modalUser').innerText = log.user_name + ' (' + (log.user_role || 'Guest') + ')';
            document.getElementById('modalDevice').innerText = log.device_info || 'Unknown Device';
            document.getElementById('modalIp').innerText = log.ip_address || '-';
            document.getElementById('modalUa').innerText = log.user_agent || '-';
            
            const refEl = document.getElementById('modalRef');
            const refWrap = document.getElementById('modalRefWrap');
            if (log.referrer) {
                refEl.innerText = log.referrer;
                refWrap.style.display = '';
            } else {
                refWrap.style.display = 'none';
            }

            const modal = document.getElementById('detailModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeModal() {
            const modal = document.getElementById('detailModal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }
    </script>
</body>
</html>
