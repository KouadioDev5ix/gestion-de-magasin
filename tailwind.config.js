/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF0FF',
          100: '#E0E3FF',
          200: '#C6CBFF',
          300: '#A3A8FD',
          400: '#7F80F8',
          500: '#6461F0',
          600: '#4F46E5',
          700: '#4237C9',
          800: '#352EA2',
          900: '#2E2B80',
          950: '#1C1A4B',
        },
        ink: {
          DEFAULT: '#0B1220',
          soft: '#334155',
          muted: '#64748B',
          faint: '#94A3B8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          app: '#F5F6FA',
          sunken: '#EEF0F5',
          line: '#E6E8EF',
        },
        success: '#0F9D74',
        danger: '#E5484D',
        warning: '#F59E0B',
      },
      borderRadius: {
        '4xl': '28px',
      },
    },
  },
  plugins: [],
};
