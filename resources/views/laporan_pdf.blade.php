<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Keuangan - Jelang Hari Coffee & Workspace</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0A0A0A;
            background-color: #FAFAF9;
            padding: 24px;
            font-size: 12px;
            line-height: 1.5;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: #FFFFFF;
            padding: 32px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #E7E5E4;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }
        .title {
            font-size: 20px;
            font-weight: 700;
            font-family: Georgia, serif;
            color: #0A0A0A;
            letter-spacing: -0.5px;
        }
        .subtitle {
            font-size: 11px;
            color: #78716C;
            margin-top: 2px;
        }
        .meta-box {
            text-align: right;
            font-size: 11px;
            color: #57534E;
        }
        .meta-box strong {
            color: #0A0A0A;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
        }
        .metric-card {
            background: #F5F5F4;
            border: 1px solid #E7E5E4;
            padding: 12px 14px;
            border-radius: 8px;
        }
        .metric-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 600;
            color: #78716C;
            letter-spacing: 0.5px;
        }
        .metric-value {
            font-size: 16px;
            font-weight: 700;
            font-family: monospace;
            color: #0A0A0A;
            margin-top: 4px;
        }
        .section-title {
            font-size: 13px;
            font-weight: 700;
            color: #0A0A0A;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 11px;
        }
        th {
            background: #F5F5F4;
            color: #44403C;
            font-weight: 600;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #D6D3D1;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #E7E5E4;
            color: #292524;
        }
        tr:nth-child(even) td {
            background-color: #FAFAF9;
        }
        .text-right {
            text-align: right;
        }
        .font-mono {
            font-family: monospace;
        }
        .action-bar {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .btn-print {
            background: #0A0A0A;
            color: #FFFFFF;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 12px;
        }
        .footer {
            margin-top: 32px;
            border-top: 1px solid #E7E5E4;
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #78716C;
        }
        @media print {
            body {
                background: #FFFFFF;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 0;
                max-width: 100%;
            }
            .action-bar {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="action-bar">
            <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
            <button class="btn-print" style="background: #78716C;" onclick="window.close()">Tutup</button>
        </div>

        <div class="header">
            <div>
                <div class="title">Jelang Hari Coffee & Workspace</div>
                <div class="subtitle">Laporan Rekapitulasi Penjualan & Keuangan Resmi</div>
            </div>
            <div class="meta-box">
                <div>Periode: <strong>{{ $startDate->format('d/m/Y') }} - {{ $endDate->format('d/m/Y') }}</strong></div>
                <div>Dicetak: {{ now()->translatedFormat('d F Y, H:i') }} WIB</div>
            </div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Total Omset</div>
                <div class="metric-value">Rp {{ number_format($summary['total_penjualan'], 0, ',', '.') }}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Transaksi</div>
                <div class="metric-value">{{ $summary['total_transaksi'] }} Struk</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Estimasi HPP (35%)</div>
                <div class="metric-value">Rp {{ number_format($summary['total_hpp'], 0, ',', '.') }}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Laba Kotor</div>
                <div class="metric-value">Rp {{ number_format($summary['laba_kotor'], 0, ',', '.') }}</div>
            </div>
        </div>

        <div class="section-title">Rincian Metode Pembayaran</div>
        <table>
            <thead>
                <tr>
                    <th>Metode Pembayaran</th>
                    <th class="text-right">Jumlah Transaksi</th>
                    <th class="text-right">Total Penerimaan (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @forelse($metodeBreakdown as $m)
                    <tr>
                        <td style="font-weight: 600; text-transform: uppercase;">{{ $m->metode_pembayaran ?: 'CASH' }}</td>
                        <td class="text-right">{{ $m->count }}x</td>
                        <td class="text-right font-mono" style="font-weight: 700;">Rp {{ number_format($m->total, 0, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="3" class="text-center" style="padding: 16px; color: #A8A29E;">Tidak ada data pembayaran.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="section-title">Daftar Transaksi Penjualan</div>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>No. Struk</th>
                    <th>Waktu</th>
                    <th>Pelanggan</th>
                    <th>Meja</th>
                    <th>Metode</th>
                    <th class="text-right">Subtotal</th>
                    <th class="text-right">Diskon</th>
                    <th class="text-right">Total Bersih</th>
                </tr>
            </thead>
            <tbody>
                @forelse($pesanans as $index => $p)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td class="font-mono" style="font-weight: 600;">{{ $p->nomor_pesanan }}</td>
                        <td>{{ $p->created_at->format('d/m H:i') }}</td>
                        <td>{{ $p->nama_pelanggan ?: 'Walk-in Guest' }}</td>
                        <td>{{ $p->meja ? $p->meja->nomor_meja : '-' }}</td>
                        <td style="text-transform: uppercase; font-size: 10px;">{{ $p->metode_pembayaran ?: 'cash' }}</td>
                        <td class="text-right font-mono">Rp {{ number_format($p->subtotal, 0, ',', '.') }}</td>
                        <td class="text-right font-mono">{{ $p->diskon > 0 ? '-Rp ' . number_format($p->diskon, 0, ',', '.') : '-' }}</td>
                        <td class="text-right font-mono" style="font-weight: 700;">Rp {{ number_format($p->total, 0, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 20px; color: #A8A29E;">
                            Tidak ada transaksi lunas pada periode ini.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            <div>Jelang Hari POS System • Dokumen Keuangan Internal</div>
            <div>Halaman 1 dari 1</div>
        </div>
    </div>
</body>
</html>
