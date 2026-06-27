export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                base: {
                    950: '#050816',
                    900: '#0b1020',
                    800: '#121a2d',
                    700: '#1c2740',
                },
                accent: {
                    100: '#d9e7ff',
                    200: '#b4caff',
                    300: '#7ca1ff',
                    400: '#4d82ff',
                    500: '#2f66ff',
                },
            },
            boxShadow: {
                glow: '0 25px 60px rgba(14, 22, 45, 0.45)',
                panel: '0 16px 40px rgba(3, 7, 18, 0.45)',
            },
            borderRadius: {
                '4xl': '2rem',
            },
            backgroundImage: {
                noise: "radial-gradient(circle at top, rgba(255,255,255,0.09), transparent 32%), radial-gradient(circle at bottom left, rgba(124,161,255,0.20), transparent 28%), radial-gradient(circle at 80% 20%, rgba(76,201,240,0.16), transparent 24%)",
            },
            fontFamily: {
                sans: ['"Segoe UI Variable"', '"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
