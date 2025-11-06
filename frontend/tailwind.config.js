/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        military: {
          green: {
            DEFAULT: '#4F6340',
            light: '#5a7348',
            dark: '#3d5030',
          },
          gold: {
            DEFAULT: '#B8A77F',
            dark: '#8B7355',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'rotate': 'rotate 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        rotate: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
