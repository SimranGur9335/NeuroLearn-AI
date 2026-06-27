/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: 'var(--background)',       // Graphite canvas
          card: 'var(--surface)',          // Card bg
          cardlight: 'var(--surface)',     // Inner hover
          border: 'var(--border)',         // Sleek border
          borderlight: 'var(--border)',    // Light border
          text: 'var(--text-primary)',     // Body text
          muted: 'var(--text-secondary)',   // Muted labels
          primary: 'var(--gradient-start)', // Royal Purple
          secondary: 'var(--gradient-middle)', // Electric Indigo
          accent: 'var(--accent)',     // Blue Accent
          success: 'var(--success)',    // Success Green
          danger: 'var(--error)',     // Red
          slate: '#64748b',      // Cool Slate
          neutral: '#e5e7eb',    // Neutral Gray
        },
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'sans-serif'],
        heading: ['Geist', 'Manrope', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      boxShadow: {
        'premium': 'var(--shadow-premium)',
        'premium-lg': 'var(--shadow-premium-lg)',
        'premium-glow': '0 0 15px rgba(124, 58, 237, 0.15)',
      },
      textColor: {
        slate: {
          900: '#0E0C5A',
          850: '#0E0C5A',
          800: '#312E81',
          700: '#475569',
          650: '#475569',
          600: '#475569',
          505: '#475569',
          500: '#64748B',
          455: '#64748B',
          450: '#64748B',
          400: '#94A3B8',
          350: '#94A3B8',
          300: '#475569',
          250: '#312E81',
          200: '#312E81',
          150: '#0E0C5A',
          100: '#0E0C5A',
        }
      },
      placeholderColor: {
        slate: {
          400: '#94A3B8',
          300: '#94A3B8',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 4px rgba(59, 130, 246, 0.1), 0 0 8px rgba(59, 130, 246, 0.05)' },
          '100%': { boxShadow: '0 0 12px rgba(59, 130, 246, 0.25), 0 0 18px rgba(59, 130, 246, 0.15)' }
        }
      }
    },
  },
  plugins: [],
}

