/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        scensora: {
          rose: '#B76E79',
          gold: '#D4A574',
          cream: '#FAF7F4',
          ivory: '#F5EDE8',
          charcoal: '#1A1A1A',
          dark: '#0C0A09',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
      },
    },
  },
  plugins: [],
};
