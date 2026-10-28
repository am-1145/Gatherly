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
        ivory: {
          25: '#FCFAF7',
          50: '#FAF7F2',
          100: '#F4EFE6',
          200: '#E8DFD1',
          300: '#D9CBB7',
        },
        charcoal: {
          50: '#F6F7F9',
          100: '#ECEEF1',
          200: '#D8DBE1',
          300: '#B2B7C2',
          400: '#838A98',
          500: '#5E6573',
          600: '#454B57',
          700: '#323741',
          800: '#20232A',
          900: '#14161B',
          950: '#0B0C0E',
        },
        sage: {
          50: '#F2F6F4',
          100: '#E1ECE5',
          200: '#C5D8CD',
          300: '#9EBEAC',
          400: '#739F85',
          500: '#4E8063',
          600: '#3D6850',
          700: '#325340',
          800: '#2A4335',
          900: '#24372D',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#F9ECE4',
          200: '#F3D6C8',
          300: '#E9B6A1',
          400: '#DC8E71',
          500: '#CF6B46',
          600: '#B85532',
          700: '#974327',
          800: '#7C3823',
          900: '#673121',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
