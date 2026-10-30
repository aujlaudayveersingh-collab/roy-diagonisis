import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — medical blue + teal (flebo.in inspired, refined)
        brand: {
          50: '#eff7ff',
          100: '#dcedff',
          200: '#b9dbff',
          300: '#84c2ff',
          400: '#4aa2ff',
          500: '#1f81fb',
          600: '#0c63e0',
          700: '#0a4fb4',
          800: '#0d458f',
          900: '#103b73',
          950: '#0b2548',
        },
        teal: {
          50: '#edfdfa',
          100: '#d2faf4',
          200: '#a9f3e9',
          300: '#71e7d8',
          400: '#38d2c1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgb(15 23 42 / 0.06), 0 6px 24px -8px rgb(15 23 42 / 0.08)',
        card: '0 1px 3px rgb(15 23 42 / 0.04), 0 10px 30px -12px rgb(12 99 224 / 0.14)',
        lift: '0 18px 45px -20px rgb(12 99 224 / 0.35)',
        glow: '0 0 0 6px rgb(20 184 166 / 0.10)',
      },
      backgroundImage: {
        'grid-sky': 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.18) 1px, transparent 0)',
        'hero-fade':
          'linear-gradient(180deg, rgb(239 246 255) 0%, rgb(255 255 255) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgb(37 211 102 / 0.5)' },
          '70%': { boxShadow: '0 0 0 16px rgb(37 211 102 / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(37 211 102 / 0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.8s ease both',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.66, 0, 0, 1) infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
