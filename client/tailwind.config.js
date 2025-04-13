/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'bounce-in': 'bounce-in 0.5s',
        'progress-shrink': 'progress-shrink 3s linear forwards',
      },
      keyframes: {
        'bounce-in': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.8)',
          },
          '70%': { 
            opacity: '1',
            transform: 'scale(1.05)',
          },
          '100%': { 
            transform: 'scale(1)',
          },
        },
        'progress-shrink': {
          'from': {
            width: '100%',
          },
          'to': {
            width: '0%',
          },
        },
      }
    },
  plugins: [],
}
}

