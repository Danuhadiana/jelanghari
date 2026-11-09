<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jelang Hari • Telemetry Monitor</title>
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :root {
            --bg: #09090b;
            --surface: #121215;
            --surface-hover: #18181c;
            --border: #222227;
            --border-subtle: #19191e;
            --text-primary: #f4f4f6;
            --text-secondary: #8c8d99;
            --text-tertiary: #52535d;
            --accent: #10b981;
        }

        body {
            background-color: var(--bg);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
            font-size: 13px;
            line-height: 1.5;
            min-height: 100vh;
            padding: 32px 16px;
        }

        .mono {
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
        }

        .container {
            max-width: 1040px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        /* ── HEADER ── */
        .header {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border);
        }

        .header-left {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .header-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: var(--text-secondary);
        }

        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--accent);
        }

        .header-title {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.01em;
        }

        .header-sub {
            font-size: 12px;
            color: var(--text-secondary);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* ── BUTTONS ── */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            background: var(--surface);
            border: 1px solid var(--border);
            color: var(--text-primary);
            transition: background 0.15s, border-color 0.15s, color 0.15s;
        }

        .btn:hover {
            background: var(--surface-hover);
            border-color: #33333d;
        }

        .btn-subtle {
            background: transparent;
            border-color: var(--border-subtle);
            color: var(--text-secondary);
        }

        .btn-subtle:hover {
            background: var(--surface);
            color: var(--text-primary);
        }

        /* ── METRICS (MINIMALIST TILES) ── */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
        }

        .metric-tile {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .metric-name {
            font-size: 11px;
            color: var(--text-secondary);
            font-weight: 500;
        }

        .metric-val {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            line-height: 1.1;
        }

        .metric-note {
            font-size: 11px;
            color: var(--text-tertiary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* ── SEARCH & FILTER CONTROLS ── */
        .filter-row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .search-wrap {
            flex: 1;
            min-width: 220px;
        }

        .search-input {
            width: 100%;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 7px 12px;
            color: #ffffff;
            font-size: 12px;
            outline: none;
            transition: border-color 0.15s;
        }

        .search-input::placeholder {
            color: var(--text-tertiary);
        }

        .search-input:focus {
            border-color: #3f3f4e;
        }

        .tabs {
            display: flex;
            gap: 4px;
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 3px;
            border-radius: 8px;
        }

        .tab-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.15s, background 0.15s;
        }

        .tab-btn:hover {
            color: #ffffff;
        }

        .tab-btn.active {
            background: #24242c;
            color: #ffffff;
        }

        /* ── TABLE ── */
        .table-wrap {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
        }

        .table-top {
            padding: 12px 18px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: var(--text-secondary);
        }

        .table-top strong {
            color: #ffffff;
        }

        .log-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 12px;
        }

        .log-table th {
            padding: 9px 18px;
            color: var(--text-tertiary);
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--border);
            background: #0e0e11;
        }

        .log-table td {
            padding: 11px 18px;
            border-bottom: 1px solid var(--border-subtle);
            vertical-align: middle;
            color: var(--text-primary);
        }

        .log-table tr:last-child td {
            border-bottom: none;
        }

        .log-table tr:hover td {
            background: rgba(255, 255, 255, 0.015);
        }

        /* Minimalist Badges */
        .badge-path {
            display: inline-block;
            background: #18181e;
            border: 1px solid #282833;
            color: #d4d4d8;
            padding: 2px 7px;
            border-radius: 5px;
            font-size: 11px;
        }

        .tag-ip {
            color: var(--text-secondary);
            font-size: 11px;
        }

        .sub-text {
            font-size: 10px;
            color: var(--text-tertiary);
        }

        /* ── MOBILE CARDS ── */
        .mobile-list {
            display: none;
            flex-direction: column;
        }

        .mobile-item {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-subtle);
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .mobile-item:last-child {
            border-bottom: none;
        }

        @media (max-width: 768px) {
            .metrics-grid { grid-template-columns: repeat(2, 1fr); }
            .log-table { display: none; }
            .mobile-list { display: flex; }
            body { padding: 20px 12px; }
        }

        /* ── MODAL ── */
        .modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 16px;
            z-index: 100;
        }

        .modal-box {
            background: #141418;
            border: 1px solid #2a2a34;
            border-radius: 12px;
            max-width: 460px;
            width: 100%;
            padding: 18px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .modal-title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            padding-bottom: 8px;
            font-size: 12px;
            font-weight: 600;
        }

        .modal-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
            font-size: 11px;
        }

        .modal-field {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .modal-field span {
            color: var(--text-tertiary);
            font-size: 10px;
            text-transform: uppercase;
        }

        .modal-field div {
            color: #ffffff;
            background: #09090b;
            padding: 6px 8px;
            border-radius: 6px;
            border: 1px solid var(--border);
            word-break: break-all;
        }

        .flash-msg {
            background: var(--surface);
            border: 1px solid var(--border);
            color: #d4d4d8;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 12px;
        }

        /* ── TELEGRAM CARD PANEL ── */
        .card-panel {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .card-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }

        .card-panel-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            color: #ffffff;
        }

        .tg-form {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 4px;
        }

        .tg-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        @media (max-width: 640px) {
            .tg-row {
                grid-template-columns: 1fr;
            }
        }

        .tg-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .tg-label {
            font-size: 11px;
            color: var(--text-secondary);
            font-weight: 500;
        }

        .tg-input {
            background: #09090b;
            border: 1px solid var(--border);
            color: #ffffff;
            font-size: 12px;
            padding: 8px 12px;
            border-radius: 6px;
            outline: none;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            transition: border-color 0.15s;
        }

        .tg-input:focus {
            border-color: #52535d;
        }

        .tg-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        .tg-guide {
            background: #0d0d11;
            border: 1px dashed var(--border);
            border-radius: 6px;
            padding: 12px 14px;
            font-size: 11px;
            color: var(--text-secondary);
            line-height: 1.6;
        }

        .tg-guide ol {
            margin-left: 18px;
            margin-top: 4px;
        }

        .tg-guide code {
            background: #18181c;
            color: #d4d4d8;
            padding: 2px 5px;
            border-radius: 4px;
            font-family: ui-monospace, monospace;
        }
    </style>
</head>
<body>

    <div class="container">

        <!-- ── HEADER ── -->
        <header class="header">
            <div class="header-left">
                <div class="header-tag mono">
                    <span class="status-dot"></span>
                    <span>Internal Telemetry</span>
                </div>
                <h1 class="header-title">Log Kunjungan Website</h1>
                <p class="header-sub">Mencatat aktivitas pembukaan web oleh klien dan staf secara senyap.</p>
            </div>

            <div class="header-actions">
                <button id="toggleBtn" onclick="toggleAutoRefresh()" class="btn btn-subtle" title="Jeda/lanjutkan auto refresh">
                    <span>Auto: <strong id="timerText" class="mono">15s</strong></span>
                </button>

                <button onclick="copySecretLink()" id="copyBtn" class="btn" title="Salin tautan ini">
                    <span id="copyBtnText">Salin URL</span>
                </button>

                <a href="{{ route('dev.monitor', ['key' => $secretKey]) }}" class="btn" title="Refresh data">
                    Refresh
                </a>

                <form action="{{ route('dev.monitor.clear') }}" method="POST" onsubmit="return confirm('Kosongkan riwayat log?')">
                    @csrf
                    <input type="hidden" name="key" value="{{ $secretKey }}">
                    <button type="submit" class="btn btn-subtle" style="color:#ef4444;" title="Reset log">
                        Reset
                    </button>
                </form>
            </div>
        </header>

        @if(session('status'))
            <div class="flash-msg" style="border-left: 3px solid #10b981;">{{ session('status') }}</div>
        @endif

        @if(session('error'))
            <div class="flash-msg" style="border-left: 3px solid #ef4444; color: #fca5a5;">{{ session('error') }}</div>
        @endif

        <!-- ── WHATSAPP ALERT PANEL (SOLUSI 2) ── -->
        <section class="card-panel">
            <div class="card-panel-header">
                <div class="card-panel-title">
                    <span class="status-dot" style="background-color: {{ $waConfigured ? '#10b981' : '#f59e0b' }};"></span>
                    <span>Notifikasi WhatsApp (Solusi 2 &bull; Senyap Real-time)</span>
                    <span class="badge" style="background: {{ $waConfigured ? '#052e16' : '#271c04' }}; color: {{ $waConfigured ? '#34d399' : '#f59e0b' }}; border: 1px solid {{ $waConfigured ? '#065f46' : '#78350f' }};">
                        {{ $waConfigured ? 'WhatsApp Aktif' : 'Belum Terhubung' }}
                    </span>
                </div>

                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn btn-subtle" onclick="toggleWaPanel()" id="waToggleBtn">
                        {{ $waConfigured ? 'Ubah Konfigurasi' : 'Setup WhatsApp' }}
                    </button>
                </div>
            </div>

            <div id="waPanelBody" style="display: {{ $waConfigured && !session('status') && !session('error') ? 'none' : 'block' }};">
                <form id="whatsappForm" action="{{ route('dev.monitor.whatsapp.save') }}" method="POST" class="tg-form">
                    @csrf
                    <input type="hidden" name="key" value="{{ $secretKey }}">

                    <div class="tg-row" style="grid-template-columns: 220px 1fr 1fr;">
                        <div class="tg-field">
                            <label class="tg-label">Gateway / Provider</label>
                            <select name="provider" id="wa_provider" class="tg-input" style="cursor: pointer;">
                                <option value="fonnte" {{ $waProvider === 'fonnte' ? 'selected' : '' }}>Fonnte (Rekomendasi Indonesia)</option>
                                <option value="callmebot" {{ $waProvider === 'callmebot' ? 'selected' : '' }}>CallMeBot (Alternatif Luar)</option>
                            </select>
                        </div>

                        <div class="tg-field">
                            <label class="tg-label">Nomor WhatsApp Anda</label>
                            <input 
                                type="text" 
                                name="phone" 
                                id="wa_phone" 
                                value="{{ $waPhone }}" 
                                placeholder="Contoh: 08123456789 atau 628..." 
                                class="tg-input"
                                autocomplete="off"
                            />
                        </div>

                        <div class="tg-field">
                            <label class="tg-label">API Token Fonnte / Key</label>
                            <input 
                                type="text" 
                                name="api_key" 
                                id="wa_api_key" 
                                value="{{ $waApiKey }}" 
                                placeholder="Masukkan Token Fonnte Anda" 
                                class="tg-input"
                                autocomplete="off"
                            />
                        </div>
                    </div>

                    <div class="tg-actions">
                        <button type="submit" class="btn btn-primary">
                            Simpan Kredensial WhatsApp
                        </button>

                        <button type="button" class="btn btn-subtle" onclick="triggerTestMessage()">
                            Tes Kirim Pesan ke WhatsApp
                        </button>
                    </div>
                </form>

                <div class="tg-guide" style="margin-top: 12px;">
                    <strong>Panduan Cepat Menghubungkan WhatsApp via Fonnte (Gratis & Paling Stabil):</strong>
                    <ol>
                        <li>Buka website resmi <a href="https://fonnte.com" target="_blank" style="color: #10b981; font-weight: 600; text-decoration: underline;">fonnte.com</a> lalu daftar akun gratis (tersedia kuota gratis 1.000 pesan/bulan).</li>
                        <li>Masuk ke dashboard Fonnte, buka menu <strong>Device</strong> &rarr; klik <strong>Connect Device</strong> &rarr; lalu scan QR code menggunakan WhatsApp di HP Anda (persis seperti WhatsApp Web).</li>
                        <li>Setelah tersambung, copy <strong>Token</strong> yang ada pada baris device Anda.</li>
                        <li>Masukkan nomor WhatsApp Anda dan Token tersebut pada form di atas, lalu klik <strong>Simpan</strong> & <strong>Tes Kirim Pesan</strong>.</li>
                    </ol>
                    <div style="margin-top: 8px; color: var(--text-tertiary); font-size: 11px;">
                        <em>Pilihan Alternatif (CallMeBot):</em> CallMeBot sering mengalami pembaruan nomor oleh pihak WhatsApp luar negeri (nomor terbarunya <code>+34 623 78 64 49</code>). Oleh karena itu, menggunakan <strong>Fonnte</strong> sangat disarankan karena menggunakan nomor WhatsApp Anda sendiri, server lokal Indonesia, dan 100% tidak pernah diblokir.
                    </div>
                </div>
            </div>
        </section>

        <!-- ── METRICS TILES ── -->
        <section class="metrics-grid">
            <div class="metric-tile">
                <span class="metric-name">Total Hits</span>
                <span class="metric-val mono">{{ number_format($totalVisits) }}</span>
                <span class="metric-note">Seluruh riwayat buka</span>
            </div>

            <div class="metric-tile">
                <span class="metric-name">Hari Ini</span>
                <span class="metric-val mono">{{ number_format($todayVisits) }}</span>
                <span class="metric-note">Kunjungan 24 jam</span>
            </div>

            <div class="metric-tile">
                <span class="metric-name">IP Unik</span>
                <span class="metric-val mono">{{ number_format($uniqueIps) }}</span>
                <span class="metric-note">Perangkat berbeda</span>
            </div>

            <div class="metric-tile">
                <span class="metric-name">Terakhir Buka</span>
                <span class="mono" style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 3px;">
                    {{ $latestVisit ? $latestVisit->created_at->timezone('Asia/Jakarta')->format('H:i:s') . ' WIB' : '-' }}
                </span>
                <span class="metric-note mono">{{ $latestVisit ? $latestVisit->url : '-' }}</span>
            </div>
        </section>

        <!-- ── FILTER & SEARCH ── -->
        <div class="filter-row">
            <div class="search-wrap">
                <input
                    type="text"
                    id="searchInput"
                    onkeyup="applyFilter()"
                    placeholder="Cari IP, perangkat (Realme, iPhone), halaman, user..."
                    class="search-input"
                />
            </div>

            <div class="tabs">
                <button onclick="setFilter('all')" id="btn-all" class="tab-btn active">Semua</button>
                <button onclick="setFilter('guest')" id="btn-guest" class="tab-btn">Tamu/Klien</button>
                <button onclick="setFilter('staff')" id="btn-staff" class="tab-btn">Staf</button>
                <button onclick="setFilter('mobile')" id="btn-mobile" class="tab-btn">HP</button>
                <button onclick="setFilter('desktop')" id="btn-desktop" class="tab-btn">Laptop</button>
            </div>
        </div>

        <!-- ── TABLE WRAPPER ── -->
        <div class="table-wrap">
            <div class="table-top">
                <div>
                    Riwayat Kunjungan &bull; <strong id="displayedCount" class="mono">{{ count($logs) }}</strong> entri
                </div>
                <div class="sub-text mono">Urutan waktu terbaru</div>
            </div>

            <!-- TABLE (DESKTOP) -->
            <table class="log-table">
                <thead>
                    <tr>
                        <th style="width: 100px;">Waktu</th>
                        <th>Halaman</th>
                        <th>Pengguna</th>
                        <th>Perangkat</th>
                        <th>IP Address</th>
                        <th style="width: 50px; text-align: center;">Detail</th>
                    </tr>
                </thead>
                <tbody id="logsTableBody">
                    @forelse($logs as $log)
                        @php
                            $isMobile = stripos($log->device_info, 'phone') !== false || stripos($log->device_info, 'android') !== false || stripos($log->device_info, 'ios') !== false || stripos($log->device_info, 'iphone') !== false;
                            $isStaff = in_array(strtolower($log->user_role ?? ''), ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'dapur']);
                            $filterType = $isStaff ? 'staff' : 'guest';
                            $filterDevice = $isMobile ? 'mobile' : 'desktop';
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
                                <div style="color: #ffffff; font-weight: 600;">
                                    {{ $log->created_at->timezone('Asia/Jakarta')->format('H:i:s') }}
                                </div>
                                <div class="sub-text">
                                    {{ $log->created_at->timezone('Asia/Jakarta')->format('d M') }}
                                </div>
                            </td>

                            <!-- Halaman -->
                            <td>
                                <span class="badge-path mono">{{ $log->url }}</span>
                            </td>

                            <!-- User / Akun -->
                            <td>
                                @if($isStaff)
                                    <div style="font-weight: 600; color: #ffffff;">{{ $log->user_name }}</div>
                                    <div class="sub-text mono" style="text-transform: uppercase;">{{ $log->user_role }}</div>
                                @else
                                    <div style="color: #d4d4d8;">Tamu / Klien</div>
                                    <div class="sub-text">Belum login</div>
                                @endif
                            </td>

                            <!-- Perangkat -->
                            <td>
                                <div style="color: #ffffff; font-weight: 500;">
                                    {{ $log->device_info ?? 'Unknown' }}
                                </div>
                                <div class="sub-text mono" style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {{ Str::limit($log->user_agent, 45) }}
                                </div>
                            </td>

                            <!-- IP -->
                            <td class="mono">
                                <span class="tag-ip">{{ $log->ip_address ?? '-' }}</span>
                            </td>

                            <!-- Tombol Detail -->
                            <td style="text-align: center;">
                                <button onclick="showDetail({{ json_encode($log) }})" class="btn btn-subtle" style="padding: 2px 7px; font-size: 11px;">
                                    Lihat
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" style="padding: 30px; text-align: center; color: var(--text-tertiary);">
                                Belum ada catatan kunjungan.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>

            <!-- LIST (MOBILE) -->
            <div id="logsMobileList" class="mobile-list">
                @forelse($logs as $log)
                    @php
                        $isMobile = stripos($log->device_info, 'phone') !== false || stripos($log->device_info, 'android') !== false || stripos($log->device_info, 'ios') !== false || stripos($log->device_info, 'iphone') !== false;
                        $isStaff = in_array(strtolower($log->user_role ?? ''), ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'dapur']);
                        $filterType = $isStaff ? 'staff' : 'guest';
                        $filterDevice = $isMobile ? 'mobile' : 'desktop';
                    @endphp
                    <div class="mobile-item log-card"
                        data-user="{{ strtolower($log->user_name . ' ' . $log->user_role) }}" 
                        data-url="{{ strtolower($log->url) }}" 
                        data-device="{{ strtolower($log->device_info ?? '') }}" 
                        data-ip="{{ $log->ip_address ?? '' }}"
                        data-category="{{ $filterType }}"
                        data-devicetype="{{ $filterDevice }}">

                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="badge-path mono" style="font-weight: 600;">{{ $log->url }}</span>
                            <span class="mono sub-text">{{ $log->created_at->timezone('Asia/Jakarta')->format('H:i:s') }}</span>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                            <span>{{ $isStaff ? $log->user_name : 'Tamu / Klien' }}</span>
                            <span class="mono tag-ip">{{ $log->ip_address }}</span>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-secondary); pt: 2px;">
                            <span class="sub-text">{{ $log->device_info }}</span>
                            <button onclick="showDetail({{ json_encode($log) }})" style="background: none; border: none; color: #a1a1aa; cursor: pointer; text-decoration: underline; font-size: 11px;">
                                Detail
                            </button>
                        </div>
                    </div>
                @empty
                    <div style="padding: 24px; text-align: center; color: var(--text-tertiary);">
                        Belum ada catatan kunjungan.
                    </div>
                @endforelse
            </div>
        </div>

        <footer style="text-align: center; font-size: 11px; color: var(--text-tertiary);" class="mono">
            Jelang Hari Internal Telemetry &bull; Private
        </footer>
    </div>

    <!-- ── POPUP DETAIL ── -->
    <div id="detailModal" class="modal">
        <div class="modal-box">
            <div class="modal-title-row">
                <span>Detail Telemetry</span>
                <button onclick="closeModal()" class="btn btn-subtle" style="padding: 2px 6px;">✕</button>
            </div>

            <div class="modal-content mono">
                <div class="modal-field">
                    <span>Waktu Akses</span>
                    <div id="modalTime"></div>
                </div>
                <div class="modal-field">
                    <span>Halaman (URL)</span>
                    <div id="modalUrl" style="font-weight: 600;"></div>
                </div>
                <div class="modal-field">
                    <span>Pengguna</span>
                    <div id="modalUser"></div>
                </div>
                <div class="modal-field">
                    <span>Perangkat</span>
                    <div id="modalDevice"></div>
                </div>
                <div class="modal-field">
                    <span>IP Address</span>
                    <div id="modalIp"></div>
                </div>
                <div class="modal-field">
                    <span>User-Agent</span>
                    <div id="modalUa" style="font-size: 10px; max-height: 80px; overflow-y: auto;"></div>
                </div>
            </div>

            <button onclick="closeModal()" class="btn" style="width: 100%; justify-content: center;">
                Tutup
            </button>
        </div>
    </div>

    <script>
        let countdown = 15;
        let isPaused = false;
        const timerText = document.getElementById('timerText');

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
            timerText.innerText = isPaused ? 'PAUSED' : (countdown = 15) + 's';
        }

        function copySecretLink() {
            navigator.clipboard.writeText(window.location.href);
            const btnText = document.getElementById('copyBtnText');
            btnText.innerText = 'Tersalin!';
            setTimeout(() => { btnText.innerText = 'Salin URL'; }, 1500);
        }

        let activeCategory = 'all';

        function setFilter(category) {
            activeCategory = category;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            const activeBtn = document.getElementById('btn-' + category);
            if (activeBtn) activeBtn.classList.add('active');
            applyFilter();
        }

        function applyFilter() {
            const query = (document.getElementById('searchInput').value || '').toLowerCase();
            const rows = document.querySelectorAll('.log-row');
            const cards = document.querySelectorAll('.log-card');
            let visibleCount = 0;

            const check = (el) => {
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

            rows.forEach(r => {
                if (check(r)) { r.style.display = ''; visibleCount++; }
                else { r.style.display = 'none'; }
            });

            cards.forEach(c => {
                if (check(c)) { c.style.display = 'flex'; }
                else { c.style.display = 'none'; }
            });

            const countEl = document.getElementById('displayedCount');
            if (countEl) countEl.innerText = visibleCount;
        }

        function showDetail(log) {
            document.getElementById('modalTime').innerText = new Date(log.created_at).toLocaleString('id-ID') + ' WIB';
            document.getElementById('modalUrl').innerText = log.method + ' ' + log.url;
            document.getElementById('modalUser').innerText = log.user_name + ' (' + (log.user_role || 'Guest') + ')';
            document.getElementById('modalDevice').innerText = log.device_info || 'Unknown';
            document.getElementById('modalIp').innerText = log.ip_address || '-';
            document.getElementById('modalUa').innerText = log.user_agent || '-';
            document.getElementById('detailModal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('detailModal').style.display = 'none';
        }

        function toggleWaPanel() {
            const panel = document.getElementById('waPanelBody');
            const btn = document.getElementById('waToggleBtn');
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
                btn.innerText = 'Tutup Panel';
            } else {
                panel.style.display = 'none';
                btn.innerText = '{{ $waConfigured ? "Ubah Konfigurasi" : "Setup WhatsApp" }}';
            }
        }

        function triggerTestMessage() {
            const form = document.getElementById('whatsappForm');
            form.action = "{{ route('dev.monitor.whatsapp.test') }}";
            form.submit();
        }
    </script>
</body>
</html>
