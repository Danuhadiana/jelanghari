import React, { PropsWithChildren } from 'react';
import { Head } from '@inertiajs/react';

interface AuthLayoutProps {
    title?: string;
}

export default function AuthLayout({ title = 'Masuk', children }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-jh-stone px-4 py-12 relative selection:bg-jh-black selection:text-jh-white">
            <Head title={`${title} - Jelang Hari`} />

            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0A0A0A_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="w-full max-w-[420px] relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-jh-black text-jh-white shadow-card mb-4 border border-jh-charcoal">
                        <span className="font-serif text-2xl font-semibold tracking-wider">JH</span>
                    </div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-jh-black">
                        Jelang Hari
                    </h1>
                    <p className="text-xs uppercase tracking-[0.2em] text-jh-gray-500 mt-1 font-medium">
                        Coffee &bull; Workspace &bull; Community
                    </p>
                </div>

                <div className="bg-jh-marble rounded-[16px] border border-jh-gray-100 shadow-card p-8">
                    {children}
                </div>

                <div className="text-center mt-8 text-xs text-jh-gray-500">
                    &copy; {new Date().getFullYear()} Jelang Hari POS &bull; Self-Hosted Point of Sale
                </div>
            </div>
        </div>
    );
}
