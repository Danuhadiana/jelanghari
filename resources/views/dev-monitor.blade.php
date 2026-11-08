<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jelang Hari • Developer Telemetry &amp; Visitor Monitor</title>
    <style>
        /* ── RESET & BASE VARIABLES ── */
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :root {
            --bg-main: #090a0f;
            --bg-card: #12141d;
            --bg-card-hover: #181b26;
            --bg-subtle: #0d0f17;
            --border: #1f2333;
            --border-hover: #2e354d;
            --text-main: #f4f4f5;
            --text-muted: #9499ad;
            --text-dim: #5c627a;
            --emerald: #10b981;
            --emerald-bg: rgba(16, 185, 129, 0.12);
            --emerald-border: rgba(16, 185, 129, 0.3);
            --amber: #f59e0b;
            --amber-bg: rgba(245, 158, 11, 0.12);
            --blue: #3b82f6;
            --blue-bg: rgba(59, 130, 246, 0.12);
            --purple: #a855f7;
            --purple-bg: rgba(168, 85, 247, 0.12);
            --rose: #f43f5e;
            --rose-bg: rgba(244, 63, 94, 0.12);
        }

        body {
            background-color: var(--bg-main);
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 13px;
            line-height: 1.5;
            min-height: 100vh;
            padding: 24px 16px;
        }

        .mono {
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
        }

        /* Top decorative beam */
        .top-beam {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%);
            z-index: 100;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* ── HEADER ── */
        .header-panel {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 20px 24px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
        }

        .header-title-box {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .radar-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--emerald-bg);
            border: 1px solid var(--emerald-border);
            color: var(--emerald);
            padding: 3px 8px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.05em;
            width: fit-content;
        }

        .radar-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--emerald);
            box-shadow: 0 0 8px var(--emerald);
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
        }

        .header-h1 {
            font-size: 20px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.02em;
        }

        .header-sub {
            font-size: 12px;
            color: var(--text-muted);
        }

        .header-actions {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
        }

        /* ── BUTTONS ── */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 12px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
            text-decoration: none;
            border: 1px solid transparent;
            color: var(--text-main);
            background: var(--bg-subtle);
        }

        .btn svg {
            width: 14px;
            height: 14px;
            flex-shrink: 0;
        }

        .btn-default {
            background: #171a24;
            border-color: var(--border);
            color: #d1d5db;
        }
        .btn-default:hover {
            background: #202433;
            border-color: var(--border-hover);
            color: #ffffff;
        }

        .btn-primary {
            background: #059669;
            color: #ffffff;
            border-color: #10b981;
        }
        .btn-primary:hover {
            background: #10b981;
        }

        .btn-danger {
            background: var(--rose-bg);
            color: #f87171;
            border-color: rgba(244, 63, 94, 0.25);
        }
        .btn-danger:hover {
            background: rgba(244, 63, 94, 0.25);
            color: #ffffff;
        }

        /* ── STATS GRID ── */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 14px;
        }

        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 16px 18px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .stat-label {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.1;
        }

        .stat-sub {
            font-size: 11px;
            color: var(--text-dim);
        }

        /* ── FILTER & SEARCH BAR ── */
        .control-bar {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 12px 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
            justify-content: space-between;
        }

        .search-box {
            position: relative;
            flex: 1;
            min-width: 240px;
        }

        .search-input {
            width: 100%;
            background: #0b0d14;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 8px 12px 8px 34px;
            color: #ffffff;
            font-size: 12px;
            outline: none;
            transition: border-color 0.15s ease;
        }

        .search-input:focus {
            border-color: var(--emerald);
        }

        .search-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 14px;
            height: 14px;
            color: var(--text-dim);
            pointer-events: none;
        }

        .filter-tabs {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }

        .filter-pill {
            background: #0d0f17;
            border: 1px solid var(--border);
            color: var(--text-muted);
            padding: 5px 11px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
        }

        .filter-pill:hover {
            color: #ffffff;
            border-color: var(--border-hover);
        }

        .filter-pill.active {
            background: var(--emerald-bg);
            border-color: var(--emerald-border);
            color: var(--emerald);
        }

        /* ── DATA TABLE & CARD VIEW ── */
        .table-panel {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            overflow: hidden;
        }

        .table-header {
            padding: 14px 20px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .table-header-title {
            font-weight: 700;
            color: #ffffff;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .badge-count {
            background: #1c202e;
            color: #c4c8d8;
            font-size: 10px;
            padding: 2px 7px;
            border-radius: 9999px;
            font-weight: 600;
        }

        .log-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        .log-table th {
            background: #0b0d14;
            color: var(--text-dim);
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 10px 16px;
            border-bottom: 1px solid var(--border);
        }

        .log-table td {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(31, 35, 51, 0.6);
            vertical-align: middle;
        }

        .log-table tr:hover td {
            background: rgba(255, 255, 255, 0.02);
        }

        /* ── PILLS & LABELS ── */
        .pill {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
        }

        .method-get {
            background: var(--emerald-bg);
            color: var(--emerald);
            border: 1px solid var(--emerald-border);
            font-size: 9px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 4px;
        }

        .method-post {
            background: var(--amber-bg);
            color: var(--amber);
            border: 1px solid rgba(245, 158, 11, 0.3);
            font-size: 9px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 4px;
        }

        .url-pill {
            background: #161a26;
            border: 1px solid var(--border);
            color: #e2e8f0;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
        }

        .role-staff {
            color: #fde047;
            font-weight: 700;
        }

        .role-guest {
            color: var(--text-muted);
        }

        .ip-tag {
            background: #0a0b10;
            border: 1px solid var(--border);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            color: var(--text-muted);
        }

        /* ── RESPONSIVE MOBILE CARDS ── */
        .mobile-card-list {
            display: none;
            flex-direction: column;
        }

        .mobile-card {
            padding: 14px 16px;
            border-bottom: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .mobile-card:hover {
            background: rgba(255, 255, 255, 0.02);
        }

        @media (max-width: 768px) {
            .log-table { display: none; }
            .mobile-card-list { display: flex; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            body { padding: 16px 10px; }
            .header-panel { padding: 16px; }
            .header-h1 { font-size: 18px; }
        }

        /* ── MODAL ── */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 16px;
            z-index: 999;
        }

        .modal-card {
            background: #141722;
            border: 1px solid #2a3147;
            border-radius: 16px;
            max-width: 480px;
            width: 100%;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            padding-bottom: 10px;
        }

        .modal-body {
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 12px;
        }

        .modal-item-label {
            font-size: 10px;
            text-transform: uppercase;
            color: var(--text-dim);
            font-weight: 700;
        }

        .modal-item-val {
            color: #ffffff;
            font-weight: 500;
            word-break: break-all;
            background: #090a0f;
            padding: 8px 10px;
            border-radius: 8px;
            border: 1px solid var(--border);
            margin-top: 3px;
        }
    </style>
</head>
<body>

    <!-- Decorative Top Line -->
    <div class="top-beam"></div>

    <div class="container">

        <!-- ── HEADER PANEL ── -->
        <header class="header-panel">
            <div class="header-title-box">
                <div class="radar-badge">
                    <span class="radar-dot"></span>
                    <span>LIVE RADAR &bull; RAHASIA PROGRAMMER</span>
                </div>
                <h1 class="header-h1">Aktivitas Kunjungan Klien &amp; Tamu</h1>
                <p class="header-sub">
                    Pemantau senyap: mencatat waktu, halaman, perangkat (Realme, iPhone, PC), dan akun pengguna secara otomatis.
                </p>
            </div>

            <div class="header-actions">
                <!-- Auto-refresh button -->
                <button id="toggleBtn" onclick="toggleAutoRefresh()" class="btn btn-default" title="Jeda atau lanjutkan pembaruan otomatis">
                    <span id="refreshTimerDot" class="radar-dot" style="width:6px; height:6px;"></span>
                    <span>Auto-Refresh: <strong id="timerText" class="mono" style="color:var(--emerald);">15s</strong></span>
                </button>

                <!-- Copy Link button -->
                <button onclick="copySecretLink()" id="copyBtn" class="btn btn-default" title="Salin tautan monitor ini">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    <span id="copyBtnText">Salin URL</span>
                </button>

                <!-- Manual reload button -->
                <a href="{{ route('dev.monitor', ['key' => $secretKey]) }}" class="btn btn-primary" title="Muat ulang log sekarang">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    <span>Cek Data</span>
                </a>

                <!-- Reset button form -->
                <form action="{{ route('dev.monitor.clear') }}" method="POST" onsubmit="return confirm('Kosongkan semua rekaman riwayat log kunjungan?')">
                    @csrf
                    <input type="hidden" name="key" value="{{ $secretKey }}">
                    <button type="submit" class="btn btn-danger" title="Hapus riwayat log">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        <span>Reset</span>
                    </button>
                </form>
            </div>
        </header>

        <!-- Status Flash Message -->
        @if(session('status'))
            <div style="background: var(--emerald-bg); border: 1px solid var(--emerald-border); color: #34d399; padding: 12px 16px; border-radius: 12px; font-size: 12px;">
                {{ session('status') }}
            </div>
        @endif

        <!-- ── STATS METRICS ── -->
        <section class="stats-grid">
            <div class="stat-card">
                <span class="stat-label">Total Akses (Hits)</span>
                <div class="stat-value mono">{{ number_format($totalVisits) }}</div>
                <span class="stat-sub">Semua halaman dibuka</span>
            </div>

            <div class="stat-card" style="border-color: rgba(16, 185, 129, 0.25);">
                <span class="stat-label" style="color: var(--emerald);">Kunjungan Hari Ini</span>
                <div class="stat-value mono" style="color: var(--emerald);">{{ number_format($todayVisits) }}</div>
                <span class="stat-sub">Aktivitas 24 jam terakhir</span>
            </div>

            <div class="stat-card" style="border-color: rgba(99, 102, 241, 0.25);">
                <span class="stat-label" style="color: #818cf8;">Perangkat Unik (IP)</span>
                <div class="stat-value mono" style="color: #a5b4fc;">{{ number_format($uniqueIps) }}</div>
                <span class="stat-sub">Koneksi unik terdeteksi</span>
            </div>

            <div class="stat-card" style="border-color: rgba(245, 158, 11, 0.25);">
                <span class="stat-label" style="color: var(--amber);">Terakhir Aktif</span>
                <div class="mono" style="font-size: 16px; font-weight: 800; color: #fde047; margin-top: 4px;">
                    {{ $latestVisit ? $latestVisit->created_at->timezone('Asia/Jakarta')->format('H:i:s') . ' WIB' : '-' }}
                </div>
                <span class="stat-sub mono" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:block;">
                    {{ $latestVisit ? $latestVisit->url : 'Belum ada data' }}
                </span>
            </div>
        </section>

        <!-- ── SEARCH & FILTER CONTROLS ── -->
        <div class="control-bar">
            <div class="search-box">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input
                    type="text"
                    id="searchInput"
                    onkeyup="applyFilter()"
                    placeholder="Cari IP, perangkat (Realme, iPhone), halaman, akun..."
                    class="search-input"
                />
            </div>

            <div class="filter-tabs">
                <button onclick="setFilter('all')" id="btn-all" class="filter-pill active">Semua</button>
                <button onclick="setFilter('guest')" id="btn-guest" class="filter-pill">Tamu/Klien</button>
                <button onclick="setFilter('staff')" id="btn-staff" class="filter-pill">Staf</button>
                <button onclick="setFilter('mobile')" id="btn-mobile" class="filter-pill">📱 HP</button>
                <button onclick="setFilter('desktop')" id="btn-desktop" class="filter-pill">💻 Laptop</button>
            </div>
        </div>

        <!-- ── TABLE & LIST LOGS ── -->
        <div class="table-panel">
            <div class="table-header">
                <div class="table-header-title">
                    <span>100 Aktivitas Kunjungan Terbaru</span>
                    <span id="displayedCount" class="badge-count mono">{{ count($logs) }} entri</span>
                </div>
                <span style="font-size: 11px; color: var(--text-dim);" class="mono">
                    Urutan: Waktu terbaru &darr;
                </span>
            </div>

            <!-- DESKTOP TABLE -->
            <table class="log-table">
                <thead>
                    <tr>
                        <th style="width: 130px;">Waktu (WIB)</th>
                        <th>Halaman yang Dibuka</th>
                        <th>Pengguna / Akun</th>
                        <th>Perangkat &amp; Browser</th>
                        <th style="width: 140px;">IP Address</th>
                        <th style="width: 60px; text-align: center;">Info</th>
                    </tr>
                </thead>
                <tbody id="logsTableBody">
                    @forelse($logs as $log)
                        @php
                            $isMobile = stripos($log->device_info, 'phone') !== false || stripos($log->device_info, 'android') !== false || stripos($log->device_info, 'ios') !== false || stripos($log->device_info, 'iphone') !== false;
                            $isStaff = in_array(strtolower($log->user_role ?? ''), ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'dapur']);
                            $filterType = $isStaff ? 'staff' : 'guest';
                            $filterDevice = $isMobile ? 'mobile' : 'desktop';

                            $cleanUrl = $log->url;
                            $urlLabel = $cleanUrl;
                            $urlColor = '#94a3b8';
                            if ($cleanUrl === '/' || $cleanUrl === '') {
                                $urlLabel = '/ (Beranda Kafe)';
                                $urlColor = '#38bdf8';
                            } elseif (str_contains($cleanUrl, 'kds')) {
                                $urlLabel = '/kds (Kitchen Barista)';
                                $urlColor = '#fbbf24';
                            } elseif (str_contains($cleanUrl, 'kasir')) {
                                $urlLabel = '/kasir (POS Kasir)';
                                $urlColor = '#34d399';
                            } elseif (str_contains($cleanUrl, 'dashboard')) {
                                $urlLabel = '/dashboard (Admin)';
                                $urlColor = '#c084fc';
                            } elseif (str_contains($cleanUrl, 'absensi')) {
                                $urlLabel = '/absensi (Presensi)';
                                $urlColor = '#22d3ee';
                            }
                        @endphp
                        <tr class="log-row"
                            data-user="{{ strtolower($log->user_name . ' ' . $log->user_role) }}" 
                            data-url="{{ strtolower($log->url) }}" 
                            data-device="{{ strtolower($log->device_info ?? '') }}" 
                            data-ip="{{ $log->ip_address ?? '' }}"
                            data-category="{{ $filterType }}"
                            data-devicetype="{{ $filterDevice }}">
                            
                            <!-- Waktu -->
                            <td class="mono">
                                <div style="font-weight: 700; color: #ffffff; font-size: 12px;">
                                    {{ $log->created_at->timezone('Asia/Jakarta')->format('H:i:s') }}
                                </div>
                                <div style="font-size: 10px; color: var(--text-dim);">
                                    {{ $log->created_at->timezone('Asia/Jakarta')->format('d M Y') }}
                                </div>
                            </td>

                            <!-- Halaman / URL -->
                            <td>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span class="{{ $log->method === 'POST' ? 'method-post' : 'method-get' }} mono">
                                        {{ $log->method }}
                                    </span>
                                    <span class="url-pill mono" style="color: {{ $urlColor }};">
                                        {{ $urlLabel }}
                                    </span>
                                </div>
                            </td>

                            <!-- Akun -->
                            <td>
                                @if($isStaff)
                                    <div>
                                        <span class="role-staff" style="font-size: 12px;">{{ $log->user_name }}</span>
                                        <div class="mono" style="font-size: 10px; color: var(--amber); text-transform: uppercase;">
                                            {{ $log->user_role }}
                                        </div>
                                    </div>
                                @else
                                    <div>
                                        <span class="role-guest" style="font-size: 12px; font-weight: 600; color: #e4e4e7;">
                                            Tamu / Klien (Belum Login)
                                        </span>
                                        <div class="mono" style="font-size: 10px; color: var(--text-dim);">
                                            Calon Pelanggan
                                        </div>
                                    </div>
                                @endif
                            </td>

                            <!-- Perangkat -->
                            <td>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span>{{ $isMobile ? '📱' : '💻' }}</span>
                                    <strong style="color: #f4f4f5; font-size: 12px;">{{ $log->device_info ?? 'Unknown' }}</strong>
                                </div>
                                <div class="mono" style="font-size: 10px; color: var(--text-dim); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;">
                                    {{ Str::limit($log->user_agent, 45) }}
                                </div>
                            </td>

                            <!-- IP -->
                            <td class="mono">
                                <span class="ip-tag">{{ $log->ip_address ?? '127.0.0.1' }}</span>
                            </td>

                            <!-- Action Info Button -->
                            <td style="text-align: center;">
                                <button onclick="showDetail({{ json_encode($log) }})" class="btn btn-default" style="padding: 4px 6px; border-radius: 6px;" title="Lihat detail lengkap">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" style="padding: 40px; text-align: center; color: var(--text-dim);">
                                Belum ada kunjungan yang tercatat. Buka website untuk mulai merekam log.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>

            <!-- MOBILE CARD VIEW -->
            <div id="logsMobileList" class="mobile-card-list">
                @forelse($logs as $log)
                    @php
                        $isMobile = stripos($log->device_info, 'phone') !== false || stripos($log->device_info, 'android') !== false || stripos($log->device_info, 'ios') !== false || stripos($log->device_info, 'iphone') !== false;
                        $isStaff = in_array(strtolower($log->user_role ?? ''), ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'dapur']);
                        $filterType = $isStaff ? 'staff' : 'guest';
                        $filterDevice = $isMobile ? 'mobile' : 'desktop';
                    @endphp
                    <div class="mobile-card log-card"
                        data-user="{{ strtolower($log->user_name . ' ' . $log->user_role) }}" 
                        data-url="{{ strtolower($log->url) }}" 
                        data-device="{{ strtolower($log->device_info ?? '') }}" 
                        data-ip="{{ $log->ip_address ?? '' }}"
                        data-category="{{ $filterType }}"
                        data-devicetype="{{ $filterDevice }}">

                        <!-- Row 1: Method + URL + Time -->
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
                                <span class="{{ $log->method === 'POST' ? 'method-post' : 'method-get' }} mono">
                                    {{ $log->method }}
                                </span>
                                <span class="mono" style="font-weight: 700; color: #ffffff; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {{ $log->url }}
                                </span>
                            </div>
                            <span class="mono" style="font-size: 11px; color: var(--text-muted); flex-shrink: 0;">
                                {{ $log->created_at->timezone('Asia/Jakarta')->format('H:i:s') }}
                            </span>
                        </div>

                        <!-- Row 2: User / Status -->
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; font-size: 12px; color: {{ $isStaff ? '#fde047' : '#e4e4e7' }};">
                                {{ $isStaff ? $log->user_name . ' (' . strtoupper($log->user_role) . ')' : 'Tamu / Calon Pelanggan' }}
                            </span>
                            <span class="ip-tag mono">{{ $log->ip_address }}</span>
                        </div>

                        <!-- Row 3: Device & Detail Button -->
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); border-top: 1px solid rgba(31,35,51,0.5); padding-top: 6px;">
                            <span style="display: flex; align-items: center; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 240px;">
                                <span>{{ $isMobile ? '📱' : '💻' }}</span>
                                <span style="color: #cbd5e1;">{{ $log->device_info }}</span>
                            </span>
                            <button onclick="showDetail({{ json_encode($log) }})" style="color: var(--emerald); font-weight: 700; background: none; border: none; cursor: pointer;">
                                Detail &rarr;
                            </button>
                        </div>
                    </div>
                @empty
                    <div style="padding: 30px; text-align: center; color: var(--text-dim);">
                        Belum ada rekaman kunjungan.
                    </div>
                @endforelse
            </div>
        </div>

        <!-- FOOTER -->
        <footer style="text-align: center; font-size: 11px; color: var(--text-dim);" class="mono">
            Jelang Hari Internal Telemetry &bull; Terenkripsi &amp; rahasia khusus programmer.
        </footer>
    </div>

    <!-- ── POPUP DETAIL MODAL ── -->
    <div id="detailModal" class="modal-overlay">
        <div class="modal-card">
            <div class="modal-header">
                <h3 style="font-weight: 700; font-size: 14px; color: #ffffff; display: flex; align-items: center; gap: 6px;">
                    <span class="radar-dot" style="width:6px;height:6px;"></span>
                    <span>Detail Telemetry Pengunjung</span>
                </h3>
                <button onclick="closeModal()" class="btn btn-default" style="padding: 4px 8px;">✕</button>
            </div>

            <div class="modal-body mono">
                <div>
                    <span class="modal-item-label">Waktu Kunjungan</span>
                    <div id="modalTime" class="modal-item-val" style="color:#ffffff;"></div>
                </div>
                <div>
                    <span class="modal-item-label">Halaman (URL)</span>
                    <div id="modalUrl" class="modal-item-val" style="color:var(--emerald); font-weight: 700;"></div>
                </div>
                <div>
                    <span class="modal-item-label">Pengguna &amp; Role</span>
                    <div id="modalUser" class="modal-item-val" style="color:#fde047;"></div>
                </div>
                <div>
                    <span class="modal-item-label">Perangkat &amp; OS</span>
                    <div id="modalDevice" class="modal-item-val" style="color:#38bdf8;"></div>
                </div>
                <div>
                    <span class="modal-item-label">Alamat IP</span>
                    <div id="modalIp" class="modal-item-val"></div>
                </div>
                <div>
                    <span class="modal-item-label">User-Agent Lengkap</span>
                    <div id="modalUa" class="modal-item-val" style="font-size: 10px; color: #94a3b8; max-height: 90px; overflow-y: auto;"></div>
                </div>
                <div id="modalRefWrap">
                    <span class="modal-item-label">Referrer</span>
                    <div id="modalRef" class="modal-item-val" style="font-size: 10px;"></div>
                </div>
            </div>

            <button onclick="closeModal()" class="btn btn-default" style="width: 100%; justify-content: center;">
                Tutup
            </button>
        </div>
    </div>

    <!-- ── JAVASCRIPT MURNI (INLINE) ── -->
    <script>
        // 1. Auto Refresh Logic
        let countdown = 15;
        let isPaused = false;
        const timerText = document.getElementById('timerText');
        const timerDot = document.getElementById('refreshTimerDot');

        setInterval(() => {
            if (isPaused) return;
            countdown--;
            if (timerText) timerText.innerText = countdown + 's';
            if (countdown <= 0) {
                window.location.reload();
            }
        }, 1000);

        function toggleAutoRefresh() {
            isPaused = !isPaused;
            if (isPaused) {
                timerText.innerText = 'PAUSED';
                timerDot.style.background = '#6b7280';
                timerDot.style.boxShadow = 'none';
            } else {
                countdown = 15;
                timerText.innerText = countdown + 's';
                timerDot.style.background = 'var(--emerald)';
                timerDot.style.boxShadow = '0 0 8px var(--emerald)';
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

        // 3. Filter Category Logic
        let activeCategory = 'all';

        function setFilter(category) {
            activeCategory = category;
            document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById('btn-' + category);
            if (activeBtn) activeBtn.classList.add('active');
            applyFilter();
        }

        // 4. Live Search & Filter
        function applyFilter() {
            const query = (document.getElementById('searchInput').value || '').toLowerCase();
            const rows = document.querySelectorAll('.log-row');
            const cards = document.querySelectorAll('.log-card');
            let visibleCount = 0;

            const matches = (el) => {
                const user = el.getAttribute('data-user') || '';
                const url = el.getAttribute('data-url') || '';
                const device = el.getAttribute('data-device') || '';
                const ip = el.getAttribute('data-ip') || '';
                const cat = el.getAttribute('data-category') || '';
                const devType = el.getAttribute('data-devicetype') || '';

                let matchCat = true;
                if (activeCategory === 'guest') matchCat = (cat === 'guest');
                else if (activeCategory === 'staff') matchCat = (cat === 'staff');
                else if (activeCategory === 'mobile') matchCat = (devType === 'mobile');
                else if (activeCategory === 'desktop') matchCat = (devType === 'desktop');

                const matchQuery = query === '' || 
                    user.includes(query) || 
                    url.includes(query) || 
                    device.includes(query) || 
                    ip.includes(query);

                return matchCat && matchQuery;
            };

            rows.forEach(row => {
                if (matches(row)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            cards.forEach(card => {
                if (matches(card)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });

            const countEl = document.getElementById('displayedCount');
            if (countEl) countEl.innerText = visibleCount + ' entri';
        }

        // 5. Modal Detail
        function showDetail(log) {
            document.getElementById('modalTime').innerText = new Date(log.created_at).toLocaleString('id-ID') + ' WIB';
            document.getElementById('modalUrl').innerText = log.method + ' ' + log.url;
            document.getElementById('modalUser').innerText = log.user_name + ' (' + (log.user_role || 'Guest') + ')';
            document.getElementById('modalDevice').innerText = log.device_info || 'Unknown';
            document.getElementById('modalIp').innerText = log.ip_address || '-';
            document.getElementById('modalUa').innerText = log.user_agent || '-';
            
            const refEl = document.getElementById('modalRef');
            const refWrap = document.getElementById('modalRefWrap');
            if (log.referrer) {
                refEl.innerText = log.referrer;
                refWrap.style.display = 'block';
            } else {
                refWrap.style.display = 'none';
            }

            document.getElementById('detailModal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('detailModal').style.display = 'none';
        }
    </script>
</body>
</html>
