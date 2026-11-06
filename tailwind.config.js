import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                zinc: {
                    750: '#323236',
                    850: '#1f1f23',
                },
                jh: {
                    black: '#0A0A0A',
                    charcoal: '#171717',
                    stone: '#F8F9FA',
                    marble: '#FFFFFF',
                    'gray-100': '#F1F3F5',
                    'gray-300': '#D1D5DB',
                    'gray-500': '#6B7280',
                    'gray-700': '#374151',
                    white: '#FFFFFF',
                    accent: '#10B981', // Hijau soft / emerald
                    'accent-light': '#D1FAE5',
                    'accent-dark': '#059669',
                    success: '#10B981',
                    warning: '#F59E0B',
                    danger: '#EF4444',
                    info: '#3B82F6',
                },
                border: '#F1F3F5',
                background: '#F8F9FA',
                card: '#FFFFFF',
            },
            fontFamily: {
                serif: ['"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
                sans:  ['"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
                mono:  ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            borderRadius: {
                card: '16px',
                btn: '10px',
                input: '8px',
            },
            boxShadow: {
                soft: '0 1px 3px rgba(0, 0, 0, 0.04)',
                card: '0 4px 12px -2px rgba(10, 10, 10, 0.04), 0 2px 4px -1px rgba(10, 10, 10, 0.02)',
            },
        },
    },
    plugins: [],
};
