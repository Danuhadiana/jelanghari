import React, { useState, useEffect } from 'react';

interface AppSplashScreenProps {
    /** Force show splash regardless of sessionStorage (useful for testing or initial showcase) */
    forceShow?: boolean;
}

export default function AppSplashScreen({ forceShow = false }: AppSplashScreenProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const alreadyShown = sessionStorage.getItem('jh_splash_shown');

        if (!alreadyShown || forceShow) {
            setIsVisible(true);
            sessionStorage.setItem('jh_splash_shown', 'true');
        }

        const handleTriggerSplash = () => {
            setProgress(0);
            setIsExiting(false);
            setIsVisible(true);
        };

        window.addEventListener('jh:trigger-splash', handleTriggerSplash);
        return () => window.removeEventListener('jh:trigger-splash', handleTriggerSplash);
    }, [forceShow]);

    useEffect(() => {
        if (!isVisible || isExiting) return;

        const startTime = Date.now();
        const duration = 1200; // Durasi singkat & elegan (1.2 detik)

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min(100, Math.round((elapsed / duration) * 100));
            setProgress(pct);

            if (pct >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setIsExiting(true);
                    setTimeout(() => {
                        setIsVisible(false);
                    }, 500);
                }, 150);
            }
        }, 16);

        return () => clearInterval(interval);
    }, [isVisible, isExiting]);

    if (!isVisible) return null;

    return (
        <div
            onClick={() => {
                setIsExiting(true);
                setTimeout(() => setIsVisible(false), 250);
            }}
            className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center select-none bg-zinc-950 text-white cursor-pointer transition-opacity duration-500 ease-out ${
                isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            {/* Center Minimalist Brand */}
            <div className="flex flex-col items-center max-w-xs text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
                {/* Clean Logo with subtle fade & scale */}
                <div className="relative">
                    <img
                        src="/images/logo.png"
                        alt="Logo Jelang Hari"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-contain p-1 border border-zinc-800 bg-zinc-900 shadow-lg"
                    />
                </div>

                {/* Typography Minimalis Monokrom */}
                <div className="space-y-1">
                    <h1 className="text-base sm:text-lg font-bold tracking-[0.25em] text-white uppercase">
                        JELANG HARI
                    </h1>
                    <p className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-medium">
                        Coffee &bull; Workspace
                    </p>
                </div>

                {/* Hairline Progress Bar */}
                <div className="w-36 space-y-2 pt-1">
                    <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-75 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                        <span>Memuat</span>
                        <span>{progress}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
