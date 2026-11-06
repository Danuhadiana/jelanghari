import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    X, Calculator, Coins, RotateCcw, Check, Copy, 
    Delete, ArrowRight, CornerDownLeft, Sparkles, Plus, Minus
} from 'lucide-react';
import { rupiah } from '@/lib/format';

export interface KasirCalculatorViewProps {
    onApplyAmount?: (amount: number) => void;
    onClose?: () => void;
    initialAmount?: number;
    title?: string;
    className?: string;
}

export function KasirCalculatorView({
    onApplyAmount,
    onClose,
    initialAmount = 0,
    title = 'Kalkulator',
    className = ''
}: KasirCalculatorViewProps) {
    const [activeTab, setActiveTab] = useState<'calc' | 'denom'>('calc');
    const [copied, setCopied] = useState(false);

    // ── Standard Calculator State ──
    const [display, setDisplay] = useState('0');
    const [formula, setFormula] = useState('');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [isNewInput, setIsNewInput] = useState(true);

    // ── Denominations State ──
    const [denoms, setDenoms] = useState<Record<number, number>>({
        100000: 0,
        50000: 0,
        20000: 0,
        10000: 0,
        5000: 0,
        2000: 0,
        1000: 0,
    });
    const [koinTotal, setKoinTotal] = useState<number>(0);

    // Sync initial amount if passed
    useEffect(() => {
        if (initialAmount > 0) {
            setDisplay(String(initialAmount));
            setIsNewInput(true);
        }
    }, [initialAmount]);

    // Format display for readability (supports decimals)
    const formatDisplayNumber = useCallback((valStr: string) => {
        if (!valStr) return '0';
        if (valStr === '-' || valStr === '.') return valStr;
        
        const parts = valStr.split('.');
        const integerPart = parts[0];
        const decimalPart = parts.length > 1 ? `.${parts[1]}` : (valStr.endsWith('.') ? '.' : '');

        const num = parseFloat(integerPart);
        if (isNaN(num)) return valStr;

        const formattedInt = num.toLocaleString('id-ID');
        return `${formattedInt}${decimalPart}`;
    }, []);

    const roundPrecision = (num: number) => {
        return Math.round((num + Number.EPSILON) * 1000000) / 1000000;
    };

    // Calculator operations
    const handleDigit = (digit: string) => {
        if (isNewInput) {
            if (digit === '.') {
                setDisplay('0.');
            } else {
                setDisplay(digit);
            }
            setIsNewInput(false);
        } else {
            if (digit === '.') {
                if (!display.includes('.')) {
                    setDisplay(prev => prev + '.');
                }
            } else if (digit === '00' || digit === '000') {
                if (display !== '0') {
                    setDisplay(prev => prev + digit);
                }
            } else {
                setDisplay(prev => (prev === '0' ? digit : prev + digit));
            }
        }
    };

    const handleOperator = (nextOp: string) => {
        const currentNum = parseFloat(display) || 0;

        if (previousValue === null) {
            setPreviousValue(currentNum);
            setFormula(`${formatDisplayNumber(String(currentNum))} ${nextOp}`);
        } else if (operator && !isNewInput) {
            let res = previousValue;
            if (operator === '+') res = previousValue + currentNum;
            else if (operator === '-') res = previousValue - currentNum;
            else if (operator === '*') res = previousValue * currentNum;
            else if (operator === '/') res = currentNum !== 0 ? previousValue / currentNum : 0;
            
            res = roundPrecision(res);
            setPreviousValue(res);
            setDisplay(String(res));
            setFormula(`${formatDisplayNumber(String(res))} ${nextOp}`);
        } else {
            setFormula(`${formatDisplayNumber(String(previousValue))} ${nextOp}`);
        }

        setOperator(nextOp);
        setIsNewInput(true);
    };

    const handleEquals = () => {
        if (operator === null || previousValue === null) return;
        const currentNum = parseFloat(display) || 0;

        let res = previousValue;
        if (operator === '+') res = previousValue + currentNum;
        else if (operator === '-') res = previousValue - currentNum;
        else if (operator === '*') res = previousValue * currentNum;
        else if (operator === '/') res = currentNum !== 0 ? previousValue / currentNum : 0;

        res = roundPrecision(res);
        setFormula(`${formatDisplayNumber(String(previousValue))} ${operator} ${formatDisplayNumber(String(currentNum))} =`);
        setDisplay(String(res));
        setPreviousValue(null);
        setOperator(null);
        setIsNewInput(true);
    };

    const handleClearAll = () => {
        setDisplay('0');
        setFormula('');
        setPreviousValue(null);
        setOperator(null);
        setIsNewInput(true);
    };

    const handleClearEntry = () => {
        setDisplay('0');
        setIsNewInput(true);
    };

    const handleBackspace = () => {
        if (isNewInput) return;
        if (display.length <= 1 || (display.length === 2 && display.startsWith('-'))) {
            setDisplay('0');
            setIsNewInput(true);
        } else {
            setDisplay(prev => prev.slice(0, -1));
        }
    };

    const handleToggleSign = () => {
        const num = parseFloat(display) || 0;
        if (num === 0) return;
        setDisplay(String(-num));
    };

    const handlePercentage = () => {
        const num = parseFloat(display) || 0;
        const res = roundPrecision(num / 100);
        setDisplay(String(res));
        setIsNewInput(true);
    };

    const handleQuickAdd = (amount: number) => {
        const current = parseFloat(display) || 0;
        const next = isNewInput ? amount : current + amount;
        setDisplay(String(next));
        setIsNewInput(false);
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
                return;
            }

            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                handleDigit(e.key);
            } else if (e.key === '.' || e.key === ',') {
                e.preventDefault();
                handleDigit('.');
            } else if (e.key === '+') {
                e.preventDefault();
                handleOperator('+');
            } else if (e.key === '-') {
                e.preventDefault();
                handleOperator('-');
            } else if (e.key === '*' || e.key === 'x') {
                e.preventDefault();
                handleOperator('*');
            } else if (e.key === '/') {
                e.preventDefault();
                handleOperator('/');
            } else if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault();
                handleEquals();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                handleBackspace();
            } else if (e.key === 'Escape' && onClose) {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [display, previousValue, operator, isNewInput, onClose]);

    // Denominations Total
    const totalFromDenoms = useMemo(() => {
        let sum = Number(koinTotal) || 0;
        Object.entries(denoms).forEach(([denom, count]) => {
            sum += Number(denom) * (Number(count) || 0);
        });
        return sum;
    }, [denoms, koinTotal]);

    const handleResetDenoms = () => {
        setDenoms({
            100000: 0,
            50000: 0,
            20000: 0,
            10000: 0,
            5000: 0,
            2000: 0,
            1000: 0,
        });
        setKoinTotal(0);
    };

    const handleCopy = (val: number) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(String(val));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const currentCalcValue = parseFloat(display) || 0;

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${className}`}>
            {/* Header Kalkulator */}
            <div className="p-2.5 sm:p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
                        <Calculator className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-xs text-zinc-950 dark:text-zinc-100 leading-tight truncate">
                            {title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate">
                            Mendukung desimal &amp; pecahan kas
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0 ml-1"
                        title="Tutup Panel Kalkulator"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Tabs Switcher: Tab Kalkulator Standar vs Tab Pecahan */}
            <div className="p-1 sm:p-1.5 border-b border-zinc-200/70 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60 flex gap-1 sm:gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={() => setActiveTab('calc')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] sm:text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all truncate ${
                        activeTab === 'calc'
                            ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs border border-zinc-200/80 dark:border-zinc-700 font-bold'
                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                >
                    <Calculator className="w-3 h-3 text-zinc-600 dark:text-zinc-400 shrink-0" />
                    <span className="truncate">Kalkulator</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('denom')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] sm:text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all truncate ${
                        activeTab === 'denom'
                            ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs border border-zinc-200/80 dark:border-zinc-700 font-bold'
                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                >
                    <Coins className="w-3 h-3 text-zinc-600 dark:text-zinc-400 shrink-0" />
                    <span className="truncate">Hitung Pecahan</span>
                </button>
            </div>

            {/* ── TAB 1: KALKULATOR ── */}
            {activeTab === 'calc' && (
                <div className="flex-1 min-h-0 flex flex-col p-2.5 sm:p-3 overflow-y-auto overflow-x-hidden space-y-1.5 sm:space-y-2">
                    {/* Display Layar Kalkulator Minimalis (shrink-0 agar tidak pernah terpotong saat scroll) */}
                    <div className="shrink-0 bg-zinc-900 dark:bg-zinc-950 rounded-xl p-2.5 sm:p-3 border border-zinc-800 shadow-inner flex flex-col justify-end min-h-[64px] sm:min-h-[74px] md:min-h-[80px] relative group w-full">
                        <button
                            type="button"
                            onClick={() => handleCopy(currentCalcValue)}
                            className="absolute top-1.5 right-1.5 p-1 px-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] flex items-center gap-1 transition border border-zinc-700/60"
                            title="Salin nominal angka"
                        >
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Tersalin' : 'Salin'}</span>
                        </button>

                        {/* Formula Line */}
                        <div className="text-[10px] sm:text-[11px] font-mono text-zinc-400 truncate max-w-[85%] min-h-[14px] sm:min-h-[16px]">
                            {formula || (operator && previousValue !== null ? `${formatDisplayNumber(String(previousValue))} ${operator}` : '')}
                        </div>

                        {/* Active Display */}
                        <div className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-white truncate max-w-full mt-0.5">
                            {formatDisplayNumber(display)}
                        </div>
                    </div>

                    {/* Quick Add Presets (Grid 4 kolom serasi, tidak pernah terpotong secara horizontal) */}
                    <div className="grid grid-cols-4 gap-1 w-full shrink-0 text-[10px] sm:text-[10.5px]">
                        {[10000, 20000, 50000, 100000].map(amt => (
                            <button
                                key={amt}
                                type="button"
                                onClick={() => handleQuickAdd(amt)}
                                className="w-full py-1 px-0.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 font-mono font-semibold text-center border border-zinc-200/80 dark:border-zinc-700/80 transition active:scale-95 truncate"
                            >
                                +{amt / 1000}k
                            </button>
                        ))}
                    </div>

                    {/* Tombol Keypad Grid 4 Kolom */}
                    <div className="grid grid-cols-4 gap-1 sm:gap-1.5 flex-1 min-h-0 w-full select-none text-xs">
                        {/* Row 1 */}
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-zinc-100 hover:bg-rose-50 dark:bg-zinc-800 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-zinc-200/80 dark:border-zinc-700/80 font-bold transition active:scale-95 flex items-center justify-center min-w-0"
                            title="Clear All"
                        >
                            AC
                        </button>
                        <button
                            type="button"
                            onClick={handleClearEntry}
                            className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 font-bold transition active:scale-95 flex items-center justify-center min-w-0"
                            title="Clear Entry"
                        >
                            CE
                        </button>
                        <button
                            type="button"
                            onClick={handleBackspace}
                            className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center transition active:scale-95 min-w-0"
                            title="Hapus Satu Digit (Backspace)"
                        >
                            <Delete className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOperator('/')}
                            className={`h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl font-bold transition active:scale-95 border flex items-center justify-center min-w-0 ${
                                operator === '/' 
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-2xs' 
                                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-700/80'
                            }`}
                        >
                            ÷
                        </button>

                        {/* Row 2 */}
                        {[7, 8, 9].map(n => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => handleDigit(String(n))}
                                className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 flex items-center justify-center min-w-0"
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleOperator('*')}
                            className={`h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl font-bold transition active:scale-95 border flex items-center justify-center min-w-0 ${
                                operator === '*' 
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-2xs' 
                                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-700/80'
                            }`}
                        >
                            ×
                        </button>

                        {/* Row 3 */}
                        {[4, 5, 6].map(n => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => handleDigit(String(n))}
                                className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 flex items-center justify-center min-w-0"
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleOperator('-')}
                            className={`h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl font-bold transition active:scale-95 border flex items-center justify-center min-w-0 ${
                                operator === '-' 
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-2xs' 
                                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-700/80'
                            }`}
                        >
                            −
                        </button>

                        {/* Row 4 */}
                        {[1, 2, 3].map(n => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => handleDigit(String(n))}
                                className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 flex items-center justify-center min-w-0"
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleOperator('+')}
                            className={`h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl font-bold transition active:scale-95 border flex items-center justify-center min-w-0 ${
                                operator === '+' 
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-2xs' 
                                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-700/80'
                            }`}
                        >
                            +
                        </button>

                        {/* Row 5: Desimal & Nol */}
                        <button
                            type="button"
                            onClick={handleToggleSign}
                            className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 font-bold transition active:scale-95 flex items-center justify-center min-w-0"
                            title="Positif / Negatif"
                        >
                            ±
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDigit('0')}
                            className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 flex items-center justify-center min-w-0"
                        >
                            0
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDigit('.')}
                            className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 font-mono font-black text-xs sm:text-sm shadow-2xs transition active:scale-95 flex items-center justify-center min-w-0"
                            title="Titik Desimal (.)"
                        >
                            ,
                        </button>
                        <button
                            type="button"
                            onClick={handleEquals}
                            className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center border border-zinc-900 dark:border-zinc-200 min-w-0"
                            title="Hitung Sama Dengan (=)"
                        >
                            =
                        </button>

                        {/* Row 6: Zero Multipliers & Percentage */}
                        <button
                            type="button"
                            onClick={() => handleDigit('00')}
                            className="h-7.5 sm:h-8.5 rounded-lg sm:rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 font-mono font-bold text-[10px] sm:text-[11px] transition active:scale-95 flex items-center justify-center min-w-0"
                        >
                            00
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDigit('000')}
                            className="h-7.5 sm:h-8.5 rounded-lg sm:rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 font-mono font-bold text-[10px] sm:text-[11px] transition active:scale-95 flex items-center justify-center min-w-0"
                        >
                            000
                        </button>
                        <button
                            type="button"
                            onClick={handlePercentage}
                            className="col-span-2 h-7.5 sm:h-8.5 rounded-lg sm:rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 font-bold text-[10px] sm:text-[11px] transition active:scale-95 flex items-center justify-center min-w-0"
                            title="Persentase (%)"
                        >
                            % Persen
                        </button>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-1 shrink-0">
                        {onApplyAmount ? (
                            <button
                                type="button"
                                onClick={() => {
                                    onApplyAmount(currentCalcValue);
                                    if (onClose) onClose();
                                }}
                                className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 min-w-0"
                            >
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Terapkan Rp {formatDisplayNumber(display)} ke Kas</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleCopy(currentCalcValue)}
                                className="w-full py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-95 min-w-0"
                            >
                                <Copy className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Salin Hasil Hitungan</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── TAB 2: HITUNG PECAHAN KAS FISIK ── */}
            {activeTab === 'denom' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/80">
                        <div className="space-y-1.5 pb-2">
                            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                <span>Uang Kertas</span>
                                <span>Subtotal</span>
                            </div>

                            {[
                                { val: 100000, label: 'Rp 100.000' },
                                { val: 50000, label: 'Rp 50.000' },
                                { val: 20000, label: 'Rp 20.000' },
                                { val: 10000, label: 'Rp 10.000' },
                                { val: 5000, label: 'Rp 5.000' },
                                { val: 2000, label: 'Rp 2.000' },
                                { val: 1000, label: 'Rp 1.000' },
                            ].map(({ val, label }) => {
                                const count = denoms[val] || 0;
                                const subtotal = val * count;
                                return (
                                    <div key={val} className="flex items-center justify-between gap-1.5 py-0.5">
                                        <div className="min-w-0">
                                            <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                                                {label}
                                            </span>
                                            <span className="font-mono text-[10px] text-zinc-400">
                                                = {rupiah(subtotal)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setDenoms(d => ({ ...d, [val]: Math.max(0, (d[val] || 0) - 1) }))}
                                                className="w-6 h-6 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center transition active:scale-95"
                                            >
                                                <Minus className="w-2.5 h-2.5" />
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={denoms[val] || ''}
                                                placeholder="0"
                                                onChange={(e) => {
                                                    const num = Math.max(0, parseInt(e.target.value) || 0);
                                                    setDenoms(d => ({ ...d, [val]: num }));
                                                }}
                                                className="w-12 text-center py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setDenoms(d => ({ ...d, [val]: (d[val] || 0) + 1 }))}
                                                className="w-6 h-6 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center transition active:scale-95"
                                            >
                                                <Plus className="w-2.5 h-2.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDenoms(d => ({ ...d, [val]: (d[val] || 0) + 5 }))}
                                                className="px-1.5 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-mono text-[9px] font-semibold transition active:scale-95"
                                            >
                                                +5
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Uang Koin */}
                        <div className="pt-2 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                <span>Total Uang Logam (Koin)</span>
                                <span className="font-mono text-zinc-600 dark:text-zinc-300">{rupiah(koinTotal)}</span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 font-bold">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={koinTotal || ''}
                                    placeholder="0 (Total uang receh/koin)"
                                    onChange={(e) => setKoinTotal(Math.max(0, parseFloat(e.target.value) || 0))}
                                    className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Denom Bottom Summary & Apply Bar */}
                    <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2 shrink-0">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Uang Fisik:</span>
                            <span className="font-mono font-black text-sm text-zinc-950 dark:text-white">
                                {rupiah(totalFromDenoms)}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleResetDenoms}
                                className="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1 font-semibold transition active:scale-95"
                                title="Reset semua lembaran uang"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset</span>
                            </button>

                            {onApplyAmount ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onApplyAmount(totalFromDenoms);
                                        if (onClose) onClose();
                                    }}
                                    className="flex-1 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 min-w-0"
                                >
                                    <Check className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">Terapkan ke Kas Laci</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleCopy(totalFromDenoms)}
                                    className="flex-1 py-2 px-3 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 min-w-0"
                                >
                                    <Copy className="w-3 h-3 shrink-0" />
                                    <span className="truncate">Salin ({rupiah(totalFromDenoms)})</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyAmount?: (amount: number) => void;
    initialAmount?: number;
    title?: string;
}

export default function KasirCalculatorDrawer({
    isOpen,
    onClose,
    onApplyAmount,
    initialAmount = 0,
    title = 'Kalkulator'
}: DrawerProps) {
    return (
        <div className={`fixed inset-0 z-50 transition-all duration-300 pointer-events-none ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div 
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* Slide-over Drawer dari sisi KANAN (khusus untuk global POS navbar) */}
            <div 
                className={`fixed inset-y-0 right-0 w-full sm:w-[340px] md:w-[360px] lg:w-[380px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out pointer-events-auto ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <KasirCalculatorView
                    onApplyAmount={onApplyAmount}
                    onClose={onClose}
                    initialAmount={initialAmount}
                    title={title}
                />
            </div>
        </div>
    );
}
