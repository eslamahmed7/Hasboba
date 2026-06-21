/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Petroleum / Teal Dark Theme ──────────────────────────────────────
        bg: {
          base:    '#0b1315',   // خلفية التطبيق الأساسية
          deep:    '#0d1719',   // خلفية أعمق
          card:    '#132226',   // بطاقات
          card2:   '#162a2f',   // بطاقات داكنة أعمق
          modal:   '#0f1d20',   // خلفية الـ Bottom Sheet
          border:  '#1e3035',   // حواف البطاقات
          border2: '#243a3f',   // حواف أفتح
          input:   '#0f1d20',   // خلفية الإدخال
        },
        petroleum: {
          50:  '#e0f7f7',
          100: '#b3ecec',
          200: '#80e0e0',
          300: '#4dd4d4',
          400: '#26cacc',
          500: '#00adb5',   // اللون الرئيسي (Accent)
          600: '#009ba3',
          700: '#008891',
          800: '#00767e',
          900: '#00545a',
          950: '#003a3f',
          DEFAULT: '#00adb5',
          glow:  'rgba(0, 173, 181, 0.35)',
          glow2: 'rgba(0, 173, 181, 0.15)',
          soft:  'rgba(0, 173, 181, 0.08)',
        },
        income: {
          light:   '#34d399',
          DEFAULT: '#10b981',
          dark:    '#059669',
          glow:    'rgba(16, 185, 129, 0.3)',
        },
        expense: {
          light:   '#fb7185',
          DEFAULT: '#f43f5e',
          dark:    '#e11d48',
          glow:    'rgba(244, 63, 94, 0.3)',
        },
        // Keep old dark for legacy components
        dark: {
          900: '#0b1315',
          800: '#0d1719',
          700: '#132226',
          600: '#162a2f',
          500: '#1e3035',
        },
        // Keep old primary for fallback
        primary: {
          50:  '#e0f7f7',
          100: '#b3ecec',
          200: '#80e0e0',
          300: '#4dd4d4',
          400: '#26cacc',
          500: '#00adb5',
          600: '#009ba3',
          700: '#008891',
          800: '#00767e',
          900: '#00545a',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2.5xl': '20px',
        '3.5xl': '28px',
        '4xl':   '32px',
      },
      boxShadow: {
        'glow-teal':     '0 0 20px rgba(0,173,181,0.4), 0 0 40px rgba(0,173,181,0.2)',
        'glow-teal-sm':  '0 0 12px rgba(0,173,181,0.35)',
        'glow-income':   '0 0 20px rgba(16,185,129,0.4)',
        'glow-expense':  '0 0 20px rgba(244,63,94,0.4)',
        'card':          '0 4px 24px rgba(0,0,0,0.4)',
        'glass':         '0 8px 32px 0 rgba(0,0,0,0.5)',
        'nav':           '0 -4px 30px rgba(0,0,0,0.6)',
      },
      animation: {
        'pulse-glow':  'pulse-glow 2s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
        'slide-up':    'slide-up 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in':     'fade-in 0.2s ease-out',
        'scale-in':    'scale-in 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
