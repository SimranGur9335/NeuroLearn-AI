/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#030712',      // Deep slate/almost black for premium dark mode
          card: '#0f172a',      // Slate 900 for dashboard cards
          cardlight: '#1e293b', // Slate 800 for highlighted elements
          border: '#334155',    // Slate 700 for fine borders
          primary: '#6366f1',   // Electric Indigo
          secondary: '#06b6d4', // Neon Cyan
          accent: '#ec4899',    // Pink
          success: '#10b981',   // Forest Emerald
          warning: '#f59e0b',   // Warning Amber
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.4), 0 0 10px rgba(99, 102, 241, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
