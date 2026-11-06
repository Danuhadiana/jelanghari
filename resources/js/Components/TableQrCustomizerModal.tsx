import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { router } from '@inertiajs/react';
import {
    X,
    Printer,
    Download,
    Sparkles,
    Wifi,
    Check,
    Coffee,
    Layers,
    Sliders,
    Eye,
    ChevronDown,
    FileText,
    Copy,
    RefreshCw,
    Tag,
    Hash,
    Users,
    Save,
    CheckCircle2,
    Palette,
    FileEdit,
    AlertCircle,
    Loader2,
    Plus,
    Trash2,
    Edit2,
    Info
} from 'lucide-react';

export interface MejaItem {
    id: number;
    nomor: string;
    nama: string | null;
    area: string;
    kapasitas: number;
    status: string;
}

export type TemplateStyle = 'minimalist' | 'coffee' | 'golden' | 'obsidian';
export type CardFormat = 'a6' | 'square' | 'mini';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    meja: MejaItem | null;
    allMejas: MejaItem[];
    onSelectMeja: (m: MejaItem) => void;
    defaultCafeName?: string;
    defaultWifiSsid?: string;
    defaultWifiPassword?: string;
}

const DEFAULT_AREAS = [
    'Indoor',
    'Outdoor',
    'Workspace',
    'VIP Lounge',
    'Rooftop',
    'Bar Counter',
    'Terrace'
];

export default function TableQrCustomizerModal({
    isOpen,
    onClose,
    meja,
    allMejas,
    onSelectMeja,
    defaultCafeName = 'Jelang Hari Coffee & Workspace',
    defaultWifiSsid = 'JelangHari_Workspace',
    defaultWifiPassword = 'ngopidulu123'
}: Props) {
    if (!isOpen) return null;

    const fallbackMeja: MejaItem = {
        id: 1,
        nomor: '01',
        nama: 'Meja Utama (Demo)',
        area: 'Indoor',
        kapasitas: 4,
        status: 'tersedia'
    };

    const activeMeja: MejaItem = meja || (allMejas.length > 0 ? allMejas[0] : fallbackMeja);

    // ==========================================
    // 1. STATE FOR TABLE EDITING (Nomor, Kategori, Kapasitas)
    // ==========================================
    const [customNomor, setCustomNomor] = useState(activeMeja.nomor);
    const [customArea, setCustomArea] = useState(activeMeja.area || 'Indoor');
    const [customNama, setCustomNama] = useState(activeMeja.nama || '');
    const [customKapasitas, setCustomKapasitas] = useState<number | ''>(activeMeja.kapasitas !== undefined && activeMeja.kapasitas !== null ? activeMeja.kapasitas : 0);

    // List of manageable categories
    const [categories, setCategories] = useState<string[]>(() => {
        const uniqueFromTables = Array.from(new Set(allMejas.map(m => m.area).filter(Boolean)));
        const combined = Array.from(new Set([...DEFAULT_AREAS, ...uniqueFromTables]));
        return combined.length > 0 ? combined : DEFAULT_AREAS;
    });

    // Category editing & modal states
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [editingCategoryOld, setEditingCategoryOld] = useState<string | null>(null);
    const [editingCategoryNew, setEditingCategoryNew] = useState('');
    const [deleteCatModal, setDeleteCatModal] = useState<string | null>(null);
    const [alertModalMsg, setAlertModalMsg] = useState<string | null>(null);

    // Sync state when active meja changes
    useEffect(() => {
        setCustomNomor(activeMeja.nomor);
        setCustomArea(activeMeja.area || 'Indoor');
        setCustomNama(activeMeja.nama || '');
        setCustomKapasitas(activeMeja.kapasitas !== undefined && activeMeja.kapasitas !== null ? activeMeja.kapasitas : 0);
        setSaveSuccessMsg('');
    }, [activeMeja.id, activeMeja.nomor, activeMeja.area, activeMeja.kapasitas, activeMeja.nama]);

    // Database save states
    const [isSavingDb, setIsSavingDb] = useState(false);
    const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

    // ==========================================
    // 2. STATE FOR CUSTOMIZATION & STYLES
    // ==========================================
    const [template, setTemplate] = useState<TemplateStyle>('minimalist');
    const [format, setFormat] = useState<CardFormat>('a6');
    const [cafeName, setCafeName] = useState(defaultCafeName);
    const [headline, setHeadline] = useState('Scan untuk Pesan & Bayar');
    const [instruction, setInstruction] = useState('Buka kamera ponsel Anda untuk memesan menu langsung dari meja ini');
    const [showWifi, setShowWifi] = useState(true);
    const [wifiSsid, setWifiSsid] = useState(defaultWifiSsid);
    const [wifiPassword, setWifiPassword] = useState(defaultWifiPassword);
    const [footerNote, setFooterNote] = useState('Pesanan Anda akan diantar langsung oleh barista kami');

    // Load saved preferences if available
    useEffect(() => {
        try {
            const savedPrefs = localStorage.getItem('jh_qr_stand_prefs');
            if (savedPrefs) {
                const p = JSON.parse(savedPrefs);
                if (p.template) setTemplate(p.template);
                if (p.format) setFormat(p.format);
                if (p.headline) setHeadline(p.headline);
                if (p.instruction) setInstruction(p.instruction);
                if (p.footerNote) setFooterNote(p.footerNote);
                if (p.showWifi !== undefined) setShowWifi(p.showWifi);
            }
        } catch {}
    }, []);

    // ==========================================
    // 3. NAVIGATION TABS (Settings di Kanan)
    // ==========================================
    type ControlTab = 'table' | 'design' | 'content';
    const [controlTab, setControlTab] = useState<ControlTab>('table');
    const [mobileTab, setMobileTab] = useState<'preview' | 'controls'>('preview');
    const [isSplitScreen, setIsSplitScreen] = useState<boolean>(true);

    // Batch Print Modal View
    const [isBatchMode, setIsBatchMode] = useState(false);

    // QR Data URLs Cache
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [batchQrUrls, setBatchQrUrls] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Computed Display Values
    const displayNomor = customNomor.trim() || activeMeja.nomor || '01';
    const displayArea = customArea.trim() || activeMeja.area || 'Indoor';
    const displayKapasitas = customKapasitas === '' ? 0 : Number(customKapasitas) || 0;

    // Target Table Order URL (Dynamic based on edited customNomor)
    const getTableUrl = (nomor: string) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/?meja=${encodeURIComponent(nomor)}`;
    };

    const currentUrl = getTableUrl(displayNomor);

    // Generate Single QR Code dynamically
    useEffect(() => {
        let isMounted = true;
        QRCode.toDataURL(currentUrl, {
            width: 500,
            margin: 1,
            color: {
                dark: template === 'obsidian' ? '#18181b' : '#09090b',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
        }).then((url) => {
            if (isMounted) setQrDataUrl(url);
        }).catch((err) => {
            console.error('Gagal generate QR Code:', err);
        });

        return () => {
            isMounted = false;
        };
    }, [currentUrl, template]);

    // Generate All QRs when batch mode is active
    useEffect(() => {
        if (!isBatchMode) return;

        let isMounted = true;
        const generateAll = async () => {
            const map: Record<string, string> = {};
            for (const m of allMejas) {
                try {
                    const url = await QRCode.toDataURL(getTableUrl(m.nomor), {
                        width: 400,
                        margin: 1,
                        color: {
                            dark: template === 'obsidian' ? '#18181b' : '#09090b',
                            light: '#ffffff'
                        },
                        errorCorrectionLevel: 'H'
                    });
                    map[m.nomor] = url;
                } catch (e) {
                    console.error('Gagal generate QR meja', m.nomor, e);
                }
            }
            if (isMounted) setBatchQrUrls(map);
        };

        generateAll();

        return () => {
            isMounted = false;
        };
    }, [isBatchMode, allMejas, template]);

    // ==========================================
    // 4. KATEGORI ACTIONS (TAMBAH, EDIT, HAPUS)
    // ==========================================
    const handleAddCategory = () => {
        const trimmed = newCategoryInput.trim();
        if (!trimmed) return;
        if (!categories.includes(trimmed)) {
            setCategories(prev => [...prev, trimmed]);
            setCustomArea(trimmed);
        }
        setNewCategoryInput('');
        setIsAddingCategory(false);
    };

    const handleStartEditCategory = (cat: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCategoryOld(cat);
        setEditingCategoryNew(cat);
    };

    const handleSaveEditCategory = () => {
        if (!editingCategoryOld || !editingCategoryNew.trim()) return;
        const newCat = editingCategoryNew.trim();
        setCategories(prev => prev.map(c => c === editingCategoryOld ? newCat : c));
        if (customArea === editingCategoryOld) {
            setCustomArea(newCat);
        }
        setEditingCategoryOld(null);
        setEditingCategoryNew('');
    };

    const handleDeleteCategory = (catToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (categories.length <= 1) {
            setAlertModalMsg('Minimal harus ada 1 kategori area meja.');
            return;
        }
        setDeleteCatModal(catToDelete);
    };

    const handleConfirmDeleteCat = () => {
        if (!deleteCatModal) return;
        const catToDelete = deleteCatModal;
        const updated = categories.filter(c => c !== catToDelete);
        setCategories(updated);
        if (customArea === catToDelete) {
            setCustomArea(updated[0] || 'Indoor');
        }
        setDeleteCatModal(null);
    };

    // Save All changes (Table info to database + Design preferences to storage)
    const handleSaveAllChanges = () => {
        setIsSavingDb(true);
        setSaveSuccessMsg('');

        try {
            localStorage.setItem('jh_qr_stand_prefs', JSON.stringify({
                template,
                format,
                headline,
                instruction,
                footerNote,
                showWifi,
                cafeName,
                wifiSsid,
                wifiPassword
            }));
        } catch (e) {
            console.error('Error saving QR stand prefs', e);
        }

        if (activeMeja && activeMeja.id) {
            router.put(`/pengaturan/meja/${activeMeja.id}`, {
                nomor: displayNomor,
                area: displayArea,
                kapasitas: displayKapasitas,
                nama: customNama || null,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSavingDb(false);
                    setSaveSuccessMsg('Data meja & preferensi desain stand QR berhasil disimpan!');
                    setTimeout(() => setSaveSuccessMsg(''), 3500);
                },
                onError: () => {
                    setIsSavingDb(false);
                }
            });
        } else {
            setIsSavingDb(false);
            setSaveSuccessMsg('Preferensi desain stand QR berhasil disimpan!');
            setTimeout(() => setSaveSuccessMsg(''), 3500);
        }
    };

    const handleSaveToDatabase = handleSaveAllChanges;

    // Copy link handler
    const handleCopyLink = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(currentUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    // Export single card to High-Resolution Studio Quality PNG
    const handleDownloadPng = async () => {
        setIsGenerating(true);
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Standard dimensions (A6 ratio: 105 x 148 mm -> 1200 x 1692 px)
            let width = 1200;
            let height = 1692;
            let qrSize = 520;
            let margin = 56;

            if (format === 'square') {
                width = 1200;
                height = 1200;
                qrSize = 440;
                margin = 44;
            } else if (format === 'mini') {
                width = 900;
                height = 1350;
                qrSize = 410;
                margin = 40;
            }

            canvas.width = width;
            canvas.height = height;

            // Palette colors based on template
            let bgFill = '#ffffff';
            let primaryText = '#09090b';
            let secondaryText = '#71717a';
            let accentColor = '#059669';
            let badgeBg = '#f4f4f5';
            let borderColor = '#e4e4e7';
            let wifiBg = '#f4f4f5';
            let wifiText = '#18181b';

            if (template === 'coffee') {
                bgFill = '#fdf8f5';
                primaryText = '#2b1810';
                secondaryText = '#7c5a4b';
                accentColor = '#8c5332';
                badgeBg = '#f4e7dc';
                borderColor = '#decbc0';
                wifiBg = '#f4e7dc';
                wifiText = '#3e2216';
            } else if (template === 'golden') {
                bgFill = '#fffdf9';
                primaryText = '#26221f';
                secondaryText = '#7d7468';
                accentColor = '#b45309';
                badgeBg = '#fef3c7';
                borderColor = '#fcd34d';
                wifiBg = '#fef3c7';
                wifiText = '#78350f';
            } else if (template === 'obsidian') {
                bgFill = '#09090b';
                primaryText = '#fafafa';
                secondaryText = '#a1a1aa';
                accentColor = '#10b981';
                badgeBg = '#1c1917';
                borderColor = '#27272a';
                wifiBg = '#18181b';
                wifiText = '#fafafa';
            }

            // Canvas Text Wrapping Helper
            const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
                if (!text) return y;
                const words = text.split(' ');
                let line = '';
                let curY = y;
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && n > 0) {
                        ctx.fillText(line.trim(), x, curY);
                        line = words[n] + ' ';
                        curY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line.trim(), x, curY);
                return curY;
            };

            // 1. Draw Clean Background
            ctx.fillStyle = bgFill;
            ctx.fillRect(0, 0, width, height);

            // 2. Outer Border Frame (Double Modern Line)
            ctx.lineWidth = 4;
            ctx.strokeStyle = borderColor;
            ctx.beginPath();
            ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, 28);
            ctx.stroke();

            // Inner Accent Border
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = borderColor;
            ctx.beginPath();
            ctx.roundRect(margin + 12, margin + 12, width - (margin + 12) * 2, height - (margin + 12) * 2, 20);
            ctx.stroke();

            ctx.textAlign = 'center';

            // 3. Header Section
            let curY = format === 'square' ? margin + 56 : margin + 74;

            // Cafe Name
            ctx.fillStyle = secondaryText;
            ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(cafeName.toUpperCase(), width / 2, curY);

            curY += format === 'square' ? 56 : 64;

            // Table Number Badge
            const badgeW = format === 'square' ? 420 : 460;
            const badgeH = format === 'square' ? 88 : 100;
            const badgeX = (width - badgeW) / 2;
            ctx.fillStyle = badgeBg;
            ctx.beginPath();
            ctx.roundRect(badgeX, curY - (badgeH * 0.35), badgeW, badgeH, 20);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = borderColor;
            ctx.stroke();

            ctx.fillStyle = primaryText;
            ctx.font = `900 ${format === 'square' ? 46 : 52}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.fillText(`MEJA ${displayNomor}`, width / 2, curY + (format === 'square' ? 24 : 30));

            curY += format === 'square' ? 82 : 108;

            // Area Subtitle & Capacity
            ctx.fillStyle = accentColor;
            ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const capText = displayKapasitas > 0 ? ` · KAPASITAS ${displayKapasitas} ORANG` : '';
            ctx.fillText(`${displayArea.toUpperCase()}${capText}`, width / 2, curY);

            curY += format === 'square' ? 44 : 54;

            // 4. Headline
            ctx.fillStyle = primaryText;
            ctx.font = `800 ${format === 'square' ? 30 : 34}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            curY = wrapText(headline, width / 2, curY, width - 260, 40);

            curY += format === 'square' ? 24 : 32;

            // 5. QR Code Box
            const qrX = (width - qrSize) / 2;
            const qrY = curY;

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 24);
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = borderColor;
            ctx.stroke();

            // Draw QR Image
            const qrImg = new Image();
            qrImg.crossOrigin = 'anonymous';
            qrImg.src = qrDataUrl;
            await new Promise((resolve) => {
                qrImg.onload = resolve;
            });
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            curY = qrY + qrSize + (format === 'square' ? 36 : 46);

            // 6. Instruction Text
            ctx.fillStyle = secondaryText;
            ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            curY = wrapText(instruction, width / 2, curY, width - 240, 30);

            curY += format === 'square' ? 26 : 34;

            // 7. WiFi Pill Box
            if (showWifi) {
                const wifiW = format === 'square' ? 560 : 620;
                const wifiH = format === 'square' ? 64 : 72;
                const wifiX = (width - wifiW) / 2;
                ctx.fillStyle = wifiBg;
                ctx.beginPath();
                ctx.roundRect(wifiX, curY - 6, wifiW, wifiH, 18);
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = borderColor;
                ctx.stroke();

                ctx.fillStyle = wifiText;
                ctx.font = '700 21px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
                ctx.fillText(`WiFi: ${wifiSsid}   •   Pass: ${wifiPassword}`, width / 2, curY + (format === 'square' ? 32 : 37));
            }

            // 8. Footer Note
            if (footerNote) {
                ctx.fillStyle = secondaryText;
                ctx.font = '400 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText(footerNote, width / 2, height - margin - 26);
            }

            // Trigger Download
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `Stand-Meja-${displayNomor}-${format.toUpperCase()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error saat download PNG:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    // Print Single Stand Card
    const handlePrintSingle = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            {/* INLINE PRINT STYLES - MULTI-PAGE A4 & PDF READY (PRESERVES TEMPLATE COLORS ACCURATELY) */}
            <style>{`
                @media print {
                    @page {
                        size: auto;
                        margin: 8mm 10mm;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #jh-single-printable, #jh-single-printable * {
                        visibility: visible !important;
                    }
                    #jh-batch-printable, #jh-batch-printable * {
                        visibility: visible !important;
                    }
                    #jh-single-printable {
                        position: fixed !important;
                        left: 50% !important;
                        top: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                    }
                    #jh-batch-printable {
                        position: static !important;
                        left: auto !important;
                        top: auto !important;
                        width: 100% !important;
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 8mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .jh-batch-card {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        box-shadow: none !important;
                        margin-bottom: 4mm !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-5xl w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] h-[92vh]">
                {/* 1. MODAL HEADER */}
                <div className="px-4 sm:px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                            <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                                    {isBatchMode ? 'Cetak Semua Meja (Batch Print)' : `Kustom Stand QR - Meja ${displayNomor}`}
                                </h3>
                                {!isBatchMode && (
                                    <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                                        {displayArea}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                Pratinjau akrilik presisi di kiri &amp; pengaturan kostumisasi lengkap di kanan.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Tombol Simpan Perubahan Utama */}
                        <button
                            type="button"
                            onClick={handleSaveAllChanges}
                            disabled={isSavingDb}
                            className="px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 active:scale-95"
                            title="Simpan perubahan nomor meja & desain stand QR"
                        >
                            {isSavingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            <span className="hidden xs:inline">Simpan Perubahan</span>
                            <span className="xs:hidden">Simpan</span>
                        </button>

                        {/* Toggle Batch Mode */}
                        <button
                            type="button"
                            onClick={() => setIsBatchMode((prev) => !prev)}
                            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                                isBatchMode
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isBatchMode ? 'Mode Satuan' : 'Cetak Semua Meja'}</span>
                            <span className="sm:hidden">{isBatchMode ? 'Satuan' : 'Semua'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {saveSuccessMsg && (
                    <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-bold animate-fade">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>{saveSuccessMsg}</span>
                        </div>
                    </div>
                )}

                {/* 2. TABLET / MOBILE RESPONSIVE SEGMENTED SWITCHER DENGAN FITUR BAGI 2 LAYAR */}
                <div className="lg:hidden px-3 sm:px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 gap-2">
                    <div className="flex rounded-lg bg-zinc-200 dark:bg-zinc-800 p-0.5 flex-1">
                        <button
                            type="button"
                            onClick={() => { setMobileTab('preview'); setIsSplitScreen(false); }}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                !isSplitScreen && mobileTab === 'preview'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-zinc-600 dark:text-zinc-400'
                            }`}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Hasil Stand</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMobileTab('controls'); setIsSplitScreen(false); }}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                !isSplitScreen && mobileTab === 'controls'
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                    : 'text-zinc-600 dark:text-zinc-400'
                            }`}
                        >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Pengaturan</span>
                        </button>
                    </div>

                    {/* Tombol Split Screen Bagi Dua Layar (Sangat Nyaman untuk Tablet / Layar Sedang) */}
                    <button
                        type="button"
                        onClick={() => setIsSplitScreen(prev => !prev)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border flex items-center gap-1.5 shrink-0 ${
                            isSplitScreen
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
                        }`}
                        title="Bagi 2 Layar berdampingan untuk tablet"
                    >
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">{isSplitScreen ? 'Tampilan: Bagi 2 Layar (Aktif)' : 'Bagi 2 Layar'}</span>
                        <span className="sm:hidden">{isSplitScreen ? 'Bagi 2' : 'Bagi 2'}</span>
                    </button>
                </div>

                {/* 3. MODAL BODY (RESPONSIVE GRID DENGAN FITUR BAGI 2 LAYAR UNTUK TABLET) */}
                <div className={`flex-1 overflow-hidden grid grid-cols-1 ${isSplitScreen ? 'md:grid-cols-12' : 'lg:grid-cols-12'} min-h-0`}>
                    
                    {/* ========================================================
                        PANEL KIRI: HASIL STAND AKRILIK SPESIFIK & AKURAT
                        ======================================================== */}
                    <div className={`${isSplitScreen ? 'md:col-span-5 lg:col-span-6' : 'lg:col-span-6'} flex flex-col h-full min-h-0 bg-zinc-100/90 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 ${
                        !isSplitScreen && mobileTab === 'controls' ? 'hidden lg:flex' : 'flex'
                    }`}>
                        {/* 1. TOP MINI HEADER IN PREVIEW */}
                        <div className="px-4 sm:px-5 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                                    {isBatchMode ? 'Pratinjau Cetak Semua Meja' : 'Pratinjau Stand Akrilik'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                <span className="px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                    {format.toUpperCase()}
                                </span>
                                <span>•</span>
                                <span className="capitalize font-semibold text-zinc-600 dark:text-zinc-400">{template}</span>
                            </div>
                        </div>

                        {/* 2. SCROLLABLE PREVIEW CANVAS (RAPI, BEBAS OVERLAP, SINKRON DENGAN TABLET & DESKTOP) */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center justify-start gap-3">
                            {!isBatchMode ? (
                                <div className="flex flex-col items-center justify-start w-full my-auto py-1">
                                    {/* PREVIEW MOCKUP CONTAINER */}
                                    <div className="flex flex-col items-center justify-center w-full py-1">
                                        <div
                                            id="jh-single-printable"
                                            className={`transition-all duration-200 shadow-xl rounded-2xl border flex flex-col items-center text-center select-none relative ${
                                                format === 'square'
                                                    ? 'w-[270px] h-[270px] p-4 justify-between'
                                                    : format === 'mini'
                                                    ? 'w-[220px] sm:w-[230px] h-[340px] p-3.5 justify-between'
                                                    : 'w-[250px] sm:w-[265px] h-[355px] sm:h-[370px] p-3.5 sm:p-4 justify-between'
                                            } ${
                                                template === 'minimalist'
                                                    ? 'bg-white border-zinc-300 text-zinc-900 shadow-zinc-300/40 dark:shadow-none'
                                                    : template === 'coffee'
                                                    ? 'bg-[#fdf8f5] border-[#decbc0] text-[#2b1810] shadow-amber-950/20'
                                                    : template === 'golden'
                                                    ? 'bg-[#fffdf9] border-[#fcd34d] text-[#26221f] shadow-amber-500/10'
                                                    : 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-black/50'
                                            }`}
                                        >
                                            {/* Subtle acrylic shine highlight reflection */}
                                            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-2xl" />

                                            {/* Stand Header */}
                                            <div className="w-full space-y-1 relative z-10 shrink-0">
                                                <p className="text-[9px] tracking-widest uppercase font-bold opacity-75 truncate max-w-[220px] mx-auto">
                                                    {cafeName}
                                                </p>
                                                <div className={`inline-block px-3 py-0.5 rounded-xl border font-black text-xs sm:text-sm tracking-wide shadow-2xs ${
                                                    template === 'minimalist'
                                                        ? 'bg-zinc-100 border-zinc-200 text-zinc-900'
                                                        : template === 'coffee'
                                                        ? 'bg-[#f4e7dc] border-[#decbc0] text-[#2b1810]'
                                                        : template === 'golden'
                                                        ? 'bg-[#fef3c7] border-[#fcd34d] text-amber-950'
                                                        : 'bg-zinc-900 border-zinc-700 text-white'
                                                }`}>
                                                    MEJA {displayNomor}
                                                </div>
                                                <p className="text-[8.5px] font-semibold opacity-70">
                                                    {displayArea}{displayKapasitas > 0 ? ` · Kapasitas ${displayKapasitas} Orang` : ' · Kapasitas Bebas'}
                                                </p>
                                            </div>

                                            {/* Middle QR Code */}
                                            <div className="my-0.5 space-y-1 flex flex-col items-center relative z-10 shrink-0">
                                                <h4 className="text-[10.5px] sm:text-[11px] font-bold max-w-[210px] leading-tight">
                                                    {headline}
                                                </h4>

                                                <div className="p-1.5 bg-white rounded-xl shadow-xs border border-zinc-200/80 inline-block">
                                                    {qrDataUrl ? (
                                                        <img
                                                            src={qrDataUrl}
                                                            alt={`QR Code Meja ${displayNomor}`}
                                                            className={`${format === 'square' ? 'w-24 h-24' : 'w-24 h-24 sm:w-26 sm:h-26'} object-contain rounded-md`}
                                                        />
                                                    ) : (
                                                        <div className="w-24 h-24 flex items-center justify-center text-xs text-zinc-400">
                                                            Memuat QR...
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-[8.5px] max-w-[200px] opacity-75 leading-tight">
                                                    {instruction}
                                                </p>
                                            </div>

                                            {/* Footer Info / WiFi (Rapi, Tidak Terpotong) */}
                                            <div className="w-full space-y-1 pt-1.5 border-t border-current/10 relative z-10 shrink-0">
                                                {showWifi && (
                                                    <div className="text-[8px] sm:text-[8.5px] font-semibold py-1 px-2.5 rounded-lg bg-black/5 dark:bg-white/5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 leading-tight">
                                                        <div className="flex items-center gap-1">
                                                            <Wifi className="w-3 h-3 shrink-0 opacity-70" />
                                                            <span>WiFi: <b>{wifiSsid}</b></span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="opacity-30 hidden sm:inline">•</span>
                                                            <span>Pass: <b className="font-mono">{wifiPassword}</b></span>
                                                        </div>
                                                    </div>
                                                )}
                                                {footerNote && (
                                                    <p className="text-[8px] opacity-60 truncate max-w-[220px] mx-auto">
                                                        {footerNote}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Realistic 3D Acrylic Stand Base Slot Foot */}
                                        <div className="w-32 sm:w-36 h-2 rounded-sm bg-gradient-to-b from-zinc-300 via-zinc-200 to-zinc-400 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-800 shadow-md border-t border-white/60 dark:border-white/10 mx-auto -mt-0.5 relative z-0 flex items-center justify-center">
                                            <div className="w-20 h-0.5 bg-zinc-400/50 dark:bg-zinc-900/50 rounded-full" />
                                        </div>
                                    </div>

                                    {/* Direct URL & Quick Copy Bar */}
                                    <div className="mt-2.5 flex items-center gap-2 max-w-sm w-full bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] shrink-0 shadow-2xs">
                                        <span className="text-zinc-500 font-mono truncate flex-1 text-[10px] select-all">{currentUrl}</span>
                                        <button
                                            type="button"
                                            onClick={handleCopyLink}
                                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold transition shrink-0 flex items-center gap-1 text-[10px]"
                                        >
                                            {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedLink ? 'Tersalin' : 'Salin URL'}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* VIEW MODE: BATCH ALL TABLES PREVIEW - READY FOR MULTI-PAGE PRINT & PDF EXPORT */
                                <div className="w-full flex-1 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between mb-2 shrink-0">
                                        <div>
                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                                                Lembar Cetak Batch: {allMejas.length} Meja
                                            </span>
                                            <span className="text-[10px] text-zinc-500">
                                                Format siap cetak kertas A4 / Simpan PDF dengan garis putus-putus gunting rapi.
                                            </span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                            Multi-page A4 / PDF
                                        </span>
                                    </div>

                                    <div
                                        id="jh-batch-printable"
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-300 dark:border-zinc-800 flex-1 overflow-y-auto w-full text-zinc-950"
                                    >
                                        {allMejas.map((m) => {
                                            const mKapasitas = m.kapasitas && m.kapasitas > 0 ? `Kapasitas ${m.kapasitas} Orang` : 'Kapasitas Bebas';
                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`jh-batch-card border-2 border-dashed rounded-2xl p-4 flex flex-col items-center text-center space-y-2 relative transition-all ${
                                                        template === 'minimalist'
                                                            ? 'bg-white border-zinc-300 text-zinc-900 shadow-xs'
                                                            : template === 'coffee'
                                                            ? 'bg-[#fdf8f5] border-[#decbc0] text-[#2b1810]'
                                                            : template === 'golden'
                                                            ? 'bg-[#fffdf9] border-[#fcd34d] text-[#26221f]'
                                                            : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                                                    }`}
                                                >
                                                    {/* Scissor Marker */}
                                                    <div className="absolute top-1.5 right-2 text-[9px] text-zinc-400 font-mono no-print">
                                                        ✂ Garis Gunting
                                                    </div>

                                                    <span className="text-[9px] font-bold tracking-widest uppercase opacity-75 truncate max-w-[200px]">
                                                        {cafeName}
                                                    </span>
                                                    <div className={`px-3.5 py-1 rounded-xl font-mono font-black text-sm tracking-wide shadow-xs border ${
                                                        template === 'minimalist'
                                                            ? 'bg-zinc-100 border-zinc-200 text-zinc-900'
                                                            : template === 'coffee'
                                                            ? 'bg-[#f4e7dc] border-[#decbc0] text-[#2b1810]'
                                                            : template === 'golden'
                                                            ? 'bg-[#fef3c7] border-[#fcd34d] text-amber-950'
                                                            : 'bg-zinc-900 border-zinc-700 text-white'
                                                    }`}>
                                                        MEJA {m.nomor}
                                                    </div>
                                                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                                                        template === 'minimalist'
                                                            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                                            : template === 'coffee'
                                                            ? 'text-[#8c5332] bg-[#f4e7dc] border-[#decbc0]'
                                                            : template === 'golden'
                                                            ? 'text-amber-800 bg-amber-50 border-amber-200'
                                                            : 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                                                    }`}>
                                                        {m.area} · {mKapasitas}
                                                    </span>

                                                    <div className="p-2 bg-white rounded-xl border border-zinc-300 shadow-2xs my-1">
                                                        {batchQrUrls[m.nomor] ? (
                                                            <img
                                                                src={batchQrUrls[m.nomor]}
                                                                alt={`QR ${m.nomor}`}
                                                                className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                                                            />
                                                        ) : (
                                                            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-[10px] text-zinc-400">
                                                                Memuat QR...
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-[10.5px] font-bold leading-tight max-w-[210px]">
                                                        {headline}
                                                    </p>
                                                    <p className="text-[8.5px] opacity-75 leading-tight max-w-[190px]">
                                                        {instruction}
                                                    </p>

                                                    {showWifi && (
                                                        <div className={`w-full text-[8.5px] font-bold py-1 px-2 rounded-lg border mt-1 ${
                                                            template === 'minimalist'
                                                                ? 'bg-zinc-100 text-zinc-800 border-zinc-200'
                                                                : template === 'coffee'
                                                                ? 'bg-[#f4e7dc] text-[#3e2216] border-[#decbc0]'
                                                                : template === 'golden'
                                                                ? 'bg-[#fef3c7] text-[#78350f] border-[#fcd34d]'
                                                                : 'bg-zinc-900 text-zinc-100 border-zinc-800'
                                                        }`}>
                                                            WiFi: <b>{wifiSsid}</b> · Pass: <b>{wifiPassword}</b>
                                                        </div>
                                                    )}

                                                    {footerNote && (
                                                        <p className="text-[8px] opacity-60 truncate max-w-[200px] pt-0.5">
                                                            {footerNote}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. FIXED BOTTOM ACTION BAR (SELALU KELIHATAN, TIDAK TERTUTUP/MENGGANGGU PREVIEW) */}
                        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shrink-0 flex items-center gap-2.5 z-10">
                            {!isBatchMode ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleDownloadPng}
                                        disabled={isGenerating}
                                        className="flex-1 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
                                    >
                                        <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>{isGenerating ? 'Memproses...' : 'Unduh Gambar (PNG)'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handlePrintSingle}
                                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-[0.99]"
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span>Cetak Stand / PDF</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handlePrintSingle}
                                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-[0.99] cursor-pointer"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Printer className="w-4 h-4" />
                                        <span>Cetak Seluruh {allMejas.length} Meja (Print / Simpan PDF)</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-100 font-normal">
                                        Pilih opsi "Save as PDF" / "Simpan sebagai PDF" di dialog cetak untuk ekspor file PDF.
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ========================================================
                        PANEL KANAN: SETTING KOSTUMISASI LELUASA & LENGKAP
                        ======================================================== */}
                    <div className={`${isSplitScreen ? 'md:col-span-7 lg:col-span-6' : 'lg:col-span-6'} flex flex-col h-full min-h-0 bg-white dark:bg-zinc-900 ${
                        !isSplitScreen && mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
                    }`}>
                        {/* TAB CONTROLS NAVIGATION */}
                        <div className="px-4 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
                            <button
                                type="button"
                                onClick={() => setControlTab('table')}
                                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                                    controlTab === 'table'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 shadow-2xs'
                                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="truncate">1. Meja &amp; Kategori</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setControlTab('design')}
                                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                                    controlTab === 'design'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 shadow-2xs'
                                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="truncate">2. Tema &amp; Format</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setControlTab('content')}
                                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                                    controlTab === 'content'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 shadow-2xs'
                                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="truncate">3. WiFi &amp; Teks</span>
                            </button>
                        </div>

                        {/* TAB CONTENTS (LELUASA, RINGKAS & ERGONOMIS) */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                            
                            {/* TAB 1: MEJA, NOMOR & KATEGORI (DILENGKAPI EDIT & HAPUS KATEGORI) */}
                            {controlTab === 'table' && (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    {/* Selector Meja Cepat */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                                Pilih Meja yang Dikelola
                                            </label>
                                            <span className="text-[10px] text-zinc-400 font-medium">
                                                {allMejas.length} meja tersedia
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto p-1.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                            {allMejas.map((m) => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => onSelectMeja(m)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                                                        m.id === activeMeja.id
                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                                            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-emerald-400'
                                                    }`}
                                                >
                                                    {m.nomor}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* EDIT NOMOR MEJA */}
                                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 space-y-3">
                                        <div>
                                            <label className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                                                <span className="flex items-center gap-1.5">
                                                    <Hash className="w-3.5 h-3.5 text-emerald-600" />
                                                    Nomor Barcode / Meja
                                                </span>
                                                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                                    QR Otomatis Terhubung
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={customNomor}
                                                onChange={(e) => setCustomNomor(e.target.value)}
                                                placeholder="Contoh: 01, MEJA-02, VIP-1"
                                                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-2xs"
                                            />
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                                Ketik nomor meja baru, QR code di sebelah kiri akan langsung diperbarui realtime.
                                            </p>
                                        </div>

                                        {/* MANAJEMEN KATEGORI / AREA MEJA (BERSIH, RAPI, TANPA TUMPUKAN IKON) */}
                                        <div className="space-y-2 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                                                    Kategori / Area Meja
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingCategory(prev => !prev)}
                                                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span>{isAddingCategory ? 'Batal' : 'Tambah Kategori'}</span>
                                                </button>
                                            </div>

                                            {/* Form Tambah Kategori Baru */}
                                            {isAddingCategory && (
                                                <div className="flex items-center gap-2 p-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 animate-in fade-in">
                                                    <input
                                                        type="text"
                                                        value={newCategoryInput}
                                                        onChange={(e) => setNewCategoryInput(e.target.value)}
                                                        placeholder="Nama kategori baru (misal: Rooftop)..."
                                                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddCategory();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddCategory}
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                                                    >
                                                        Simpan
                                                    </button>
                                                </div>
                                            )}

                                            {/* Modal Edit Nama Kategori */}
                                            {editingCategoryOld && (
                                                <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-2 animate-in fade-in">
                                                    <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block">
                                                        Edit Nama Kategori: <u>{editingCategoryOld}</u>
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={editingCategoryNew}
                                                            onChange={(e) => setEditingCategoryNew(e.target.value)}
                                                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 text-xs"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleSaveEditCategory}
                                                            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingCategoryOld(null)}
                                                            className="px-2 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Daftar Kategori Chips Rapi & Elegan */}
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-1.5 p-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-28 overflow-y-auto">
                                                    {categories.map((cat) => {
                                                        const isSelected = customArea.toLowerCase() === cat.toLowerCase();
                                                        return (
                                                            <button
                                                                key={cat}
                                                                type="button"
                                                                onClick={() => setCustomArea(cat)}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition border ${
                                                                    isSelected
                                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 hover:bg-emerald-50/50'
                                                                }`}
                                                            >
                                                                <span>{cat}</span>
                                                                {isSelected && <Check className="w-3 h-3 text-white/90" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Action Bar untuk Kategori yang Sedang Dipilih */}
                                                <div className="flex items-center justify-between text-[11px] px-1 text-zinc-500">
                                                    <span>Area aktif: <b className="text-zinc-900 dark:text-zinc-100">{customArea}</b></span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleStartEditCategory(customArea, e)}
                                                            className="text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1 font-semibold"
                                                            title="Ubah nama kategori yang sedang dipilih"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                            <span>Ubah Nama</span>
                                                        </button>
                                                        <span>•</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDeleteCategory(customArea, e)}
                                                            className="text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 font-semibold"
                                                            title="Hapus kategori yang sedang dipilih"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            <span>Hapus Area</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* KAPASITAS TAMU & LABEL */}
                                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                                            <div>
                                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                                                    Kapasitas Tamu (Orang)
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    placeholder="0 (Kapasitas Bebas)"
                                                    value={customKapasitas}
                                                    onChange={(e) => setCustomKapasitas(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                                <span className="text-[9px] text-zinc-400 mt-0.5 block">
                                                    Isi 0 jika kapasitas tamu bebas / fleksibel
                                                </span>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                                                    Label Tambahan (Opsional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customNama}
                                                    onChange={(e) => setCustomNama(e.target.value)}
                                                    placeholder="Contoh: Dekat Jendela"
                                                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        {/* SIMPAN KE DATABASE BUTTON */}
                                        {activeMeja.id && (
                                            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                                <button
                                                    type="button"
                                                    onClick={handleSaveToDatabase}
                                                    disabled={isSavingDb}
                                                    className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                                                >
                                                    {isSavingDb ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                                                    ) : (
                                                        <Save className="w-3.5 h-3.5" />
                                                    )}
                                                    <span>{isSavingDb ? 'Menyimpan ke Meja...' : 'Simpan Nomor & Kategori ke Database'}</span>
                                                </button>

                                                {saveSuccessMsg && (
                                                    <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 animate-in fade-in">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                        <span>{saveSuccessMsg}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: TEMA VISUAL STAND & FORMAT UKURAN */}
                            {controlTab === 'design' && (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    {/* Template Picker */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                                            Pilih Tema Visual Stand
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setTemplate('minimalist')}
                                                className={`p-3 rounded-xl text-left border transition relative ${
                                                    template === 'minimalist'
                                                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                                                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-white border border-zinc-300 shadow-2xs" />
                                                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Minimalist</span>
                                                    </div>
                                                    {template === 'minimalist' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                                </div>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Putih bersih modern, frame akrilik bening</p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setTemplate('coffee')}
                                                className={`p-3 rounded-xl text-left border transition relative ${
                                                    template === 'coffee'
                                                        ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 ring-1 ring-amber-600'
                                                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-[#f4e7dc] border border-[#decbc0] shadow-2xs" />
                                                        <span className="font-bold text-xs text-amber-900 dark:text-amber-200">Warm Coffee</span>
                                                    </div>
                                                    {template === 'coffee' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                                                </div>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Nuansa kedai kopi artisan &amp; kraft alami</p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setTemplate('golden')}
                                                className={`p-3 rounded-xl text-left border transition relative ${
                                                    template === 'golden'
                                                        ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 ring-1 ring-amber-500'
                                                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-[#fef3c7] border border-[#fcd34d] shadow-2xs" />
                                                        <span className="font-bold text-xs text-amber-800 dark:text-amber-300">Golden Amber</span>
                                                    </div>
                                                    {template === 'golden' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                                                </div>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Aksen emas mewah berkelas &amp; eksklusif</p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setTemplate('obsidian')}
                                                className={`p-3 rounded-xl text-left border transition relative ${
                                                    template === 'obsidian'
                                                        ? 'border-emerald-500 bg-zinc-900 text-white ring-1 ring-emerald-500'
                                                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-zinc-950 border border-emerald-500 shadow-2xs" />
                                                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Obsidian Dark</span>
                                                    </div>
                                                    {template === 'obsidian' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                </div>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Desain gelap modern lounge kekinian</p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Format Stand Picker */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                                            Ukuran / Format Media Cetak
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormat('a6')}
                                                className={`py-2.5 px-2 rounded-xl text-center border text-xs font-semibold transition ${
                                                    format === 'a6'
                                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs'
                                                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                                }`}
                                            >
                                                Stand A6
                                                <span className="block text-[9px] opacity-75 font-normal">105 x 148 mm</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormat('square')}
                                                className={`py-2.5 px-2 rounded-xl text-center border text-xs font-semibold transition ${
                                                    format === 'square'
                                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs'
                                                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                                }`}
                                            >
                                                Stiker Persegi
                                                <span className="block text-[9px] opacity-75 font-normal">100 x 100 mm</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormat('mini')}
                                                className={`py-2.5 px-2 rounded-xl text-center border text-xs font-semibold transition ${
                                                    format === 'mini'
                                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs'
                                                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                                }`}
                                            >
                                                Mini Tent
                                                <span className="block text-[9px] opacity-75 font-normal">80 x 120 mm</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: IDENTITAS, WIFI & TEKS */}
                            {controlTab === 'content' && (
                                <div className="space-y-3.5 animate-in fade-in duration-150">
                                    <div>
                                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                            Nama Kafe di Header Stand
                                        </label>
                                        <input
                                            type="text"
                                            value={cafeName}
                                            onChange={(e) => setCafeName(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                            Judul Utama Stand (Headline)
                                        </label>
                                        <input
                                            type="text"
                                            value={headline}
                                            onChange={(e) => setHeadline(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                            Petunjuk Pemesanan
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={instruction}
                                            onChange={(e) => setInstruction(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                                        />
                                    </div>

                                    {/* WiFi Section */}
                                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 space-y-2.5">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                                    Tampilkan Info WiFi di Stand
                                                </span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={showWifi}
                                                onChange={(e) => setShowWifi(e.target.checked)}
                                                className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                                            />
                                        </label>

                                        {showWifi && (
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <div>
                                                    <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">Nama WiFi (SSID)</span>
                                                    <input
                                                        type="text"
                                                        value={wifiSsid}
                                                        onChange={(e) => setWifiSsid(e.target.value)}
                                                        className="w-full px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">Password WiFi</span>
                                                    <input
                                                        type="text"
                                                        value={wifiPassword}
                                                        onChange={(e) => setWifiPassword(e.target.value)}
                                                        className="w-full px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                            Catatan Kaki (Footer Note)
                                        </label>
                                        <input
                                            type="text"
                                            value={footerNote}
                                            onChange={(e) => setFooterNote(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FOOTER BAR CONTROLS: SIMPAN PERUBAHAN */}
                        <div className="p-3 sm:p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/90 shrink-0 flex items-center justify-between gap-3">
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Target Meja:</span> {displayNomor} ({displayArea})
                            </div>
                            <button
                                type="button"
                                onClick={handleSaveAllChanges}
                                disabled={isSavingDb}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 active:scale-95"
                            >
                                {isSavingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                <span>Simpan Perubahan</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* MODAL KONFIRMASI HAPUS KATEGORI AREA */}
                {deleteCatModal && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                        Hapus Kategori "{deleteCatModal}"?
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Kategori ini akan dihilangkan dari daftar pilihan area meja.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setDeleteCatModal(null)}
                                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDeleteCat}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus Kategori</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL ALERT POP-UP (MENGGANTIKAN BROWSER ALERT) */}
                {alertModalMsg && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                        Perhatian
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        {alertModalMsg}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setAlertModalMsg(null)}
                                    className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold"
                                >
                                    Mengerti
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
