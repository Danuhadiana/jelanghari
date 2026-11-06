import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import React from 'react';
import AppSplashScreen from './Components/AppSplashScreen';

const appName = import.meta.env.VITE_APP_NAME || 'Jelang Hari POS';

class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("React GlobalErrorBoundary caught:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '100vh', padding: '40px 24px', background: '#09090b', color: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
                    <div style={{ maxWidth: '720px', margin: '40px auto', background: '#18181b', border: '1px solid #dc2626', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ color: '#ef4444', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                            Terjadi Kesalahan Tampilan Antarmuka
                        </h2>
                        <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '16px' }}>
                            {String(this.state.error?.message || this.state.error)}
                        </p>
                        <pre style={{ background: '#09090b', padding: '16px', borderRadius: '8px', color: '#f87171', fontSize: '11px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                            {this.state.error?.stack || 'No stack trace available'}
                        </pre>
                        <button 
                            type="button"
                            onClick={() => window.location.reload()} 
                            style={{ marginTop: '16px', padding: '8px 20px', background: '#059669', border: 'none', borderRadius: '8px', color: '#ffffff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                            Muat Ulang Halaman
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <GlobalErrorBoundary>
                <App {...props} />
                <AppSplashScreen />
            </GlobalErrorBoundary>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
