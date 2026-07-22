/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#0D111A',
          DEFAULT: '#E42278',
          light: '#ED7BAB',
          lighter: '#F5D3DD',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F9F9F9',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(13, 17, 26, 0.06)',
        'glass-lg': '0 8px 40px rgba(13, 17, 26, 0.10)',
        'glow': '0 0 20px rgba(228, 34, 120, 0.15)',
        'glow-lg': '0 0 40px rgba(228, 34, 120, 0.20)',
        'card': '0 2px 12px rgba(13, 17, 26, 0.04)',
        'card-hover': '0 8px 30px rgba(13, 17, 26, 0.10)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
