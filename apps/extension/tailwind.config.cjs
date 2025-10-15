/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx,html}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/features/src/**/*.{ts,tsx}',
  ],
  safelist: [
    'duration-2s',
    'duration-3s',
    'duration-4s',
    'duration-5s',
    'duration-6s',
    'duration-7s',
  ],
  theme: { 
    extend: {
      transitionDuration: {
        '2s': '2s',
        '3s': '3s',
        '4s': '4s',
        '5s': '5s',
        '6s': '6s',
        '7s': '7s',
      },
      duration: {
        '2s': '2s',
        '3s': '3s',
        '4s': '4s',
        '5s': '5s',
        '6s': '6s',
        '7s': '7s',
      },
    } 
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.duration-2s': { transitionDuration: '2s' },
        '.duration-3s': { transitionDuration: '3s' },
        '.duration-4s': { transitionDuration: '4s' },
        '.duration-5s': { transitionDuration: '5s' },
        '.duration-6s': { transitionDuration: '6s' },
        '.duration-7s': { transitionDuration: '7s' },
      }
      addUtilities(newUtilities)
    }
  ],
}
