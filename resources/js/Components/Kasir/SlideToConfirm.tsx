import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronsRight, Loader2, Check, ShieldAlert } from 'lucide-react';

interface SlideToConfirmProps {
    onConfirm: () => boolean | void | Promise<boolean | void>;
    isSubmitting?: boolean;
    disabled?: boolean;
    text?: string;
    loadingText?: string;
    className?: string;
    resetKey?: any;
}

export default function SlideToConfirm({
    onConfirm,
    isSubmitting = false,
    disabled = false,
    text = "Geser ke kanan untuk Tutup Toko",
    loadingText = "Menutup Toko & Selesai Sesi...",
    className = "",
    resetKey
}: SlideToConfirmProps) {
    const [dragDistance, setDragDistance] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const dragStartX = useRef<number>(0);
    const currentDistRef = useRef<number>(0);

    const getMaxDistance = useCallback(() => {
        if (!containerRef.current || !thumbRef.current) return 0;
        const containerWidth = containerRef.current.clientWidth;
        const thumbWidth = thumbRef.current.clientWidth || 40;
        return Math.max(0, containerWidth - thumbWidth - 12);
    }, []);

    // Reset when resetKey changes
    useEffect(() => {
        setIsConfirmed(false);
        setDragDistance(0);
        currentDistRef.current = 0;
    }, [resetKey]);

    // Reset if isSubmitting turns false while still confirmed
    useEffect(() => {
        if (!isSubmitting && isConfirmed) {
            const timer = setTimeout(() => {
                setIsConfirmed(false);
                setDragDistance(0);
                currentDistRef.current = 0;
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isSubmitting]);

    // Window-level pointer tracking for 100% reliable dragging on tablet, touch & mouse
    useEffect(() => {
        if (!isDragging) return;

        const onPointerMove = (e: PointerEvent) => {
            const maxDist = getMaxDistance();
            if (maxDist <= 0) return;

            const delta = e.clientX - dragStartX.current;
            const clamped = Math.max(0, Math.min(delta, maxDist));

            currentDistRef.current = clamped;
            setDragDistance(clamped);
        };

        const onPointerUp = async (e: PointerEvent) => {
            setIsDragging(false);
            const maxDist = getMaxDistance();

            // Dragged past 75% threshold triggers confirmation
            if (maxDist > 0 && currentDistRef.current >= maxDist * 0.75) {
                setDragDistance(maxDist);
                currentDistRef.current = maxDist;
                setIsConfirmed(true);

                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    try { navigator.vibrate(50); } catch (_) {}
                }

                try {
                    const result = await onConfirm();
                    if (result === false) {
                        setIsConfirmed(false);
                        setDragDistance(0);
                        currentDistRef.current = 0;
                    }
                } catch (err) {
                    setIsConfirmed(false);
                    setDragDistance(0);
                    currentDistRef.current = 0;
                }
            } else {
                // Snap back smoothly
                setDragDistance(0);
                currentDistRef.current = 0;
            }
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);

        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
        };
    }, [isDragging, getMaxDistance, onConfirm]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (disabled || isSubmitting || isConfirmed) return;
        
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);

        const maxDist = getMaxDistance();
        // If clicking on the track directly (not thumb), calculate starting position
        if (containerRef.current && e.target === containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left - 6 - 20; // center thumb on click
            const clamped = Math.max(0, Math.min(clickX, maxDist));
            currentDistRef.current = clamped;
            setDragDistance(clamped);
            dragStartX.current = e.clientX - clamped;
        } else {
            dragStartX.current = e.clientX - currentDistRef.current;
        }
    };

    const maxDist = getMaxDistance();
    const progress = maxDist > 0 ? Math.min(1, dragDistance / maxDist) : 0;

    return (
        <div className="space-y-1.5 touch-none select-none">
            <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                className={`relative h-13 rounded-2xl bg-red-500/10 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 p-1.5 select-none overflow-hidden touch-none flex items-center transition-all cursor-pointer ${
                    isDragging 
                        ? 'border-red-400 dark:border-red-600 shadow-md ring-2 ring-red-500/20' 
                        : 'shadow-xs'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            >
                {/* Dynamic Progress Fill with Professional Red Gradient */}
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-xl pointer-events-none"
                    style={{
                        width: `calc(${dragDistance}px + 44px)`,
                        transition: isDragging ? 'none' : 'width 0.25s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                />

                {/* Shimmer / Static Center Text */}
                <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none px-12 text-center"
                    style={{ opacity: isSubmitting ? 0 : Math.max(0, 1 - progress * 1.8) }}
                >
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-xs tracking-wide">
                        <span>{text}</span>
                        <div className="flex items-center -space-x-1 text-red-500 dark:text-red-400">
                            <span className="text-[12px] font-black">›</span>
                            <span className="text-[12px] font-black">›</span>
                            <span className="text-[12px] font-black">›</span>
                        </div>
                    </div>
                </div>

                {/* Submitting Loading Overlay */}
                {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white font-bold text-xs gap-2 z-20">
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{loadingText}</span>
                    </div>
                )}

                {/* Draggable Slider Thumb (Professional Red) */}
                <div
                    ref={thumbRef}
                    onPointerDown={handlePointerDown}
                    className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-red-600/30 cursor-grab active:cursor-grabbing transition-transform select-none touch-none ${
                        isConfirmed 
                            ? 'bg-red-700 ring-2 ring-red-300 scale-95' 
                            : 'bg-red-600 hover:bg-red-500 active:scale-95'
                    }`}
                    style={{
                        transform: `translateX(${dragDistance}px)`,
                        transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isConfirmed ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <ChevronsRight className={`w-4 h-4 transition-transform ${isDragging ? 'translate-x-0.5' : ''}`} />
                    )}
                </div>
            </div>

            {/* Micro Helper Note */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-red-700/80 dark:text-red-400/80 text-center">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Geser tuas merah ke kanan penuh untuk konfirmasi penutupan toko</span>
            </div>
        </div>
    );
}
