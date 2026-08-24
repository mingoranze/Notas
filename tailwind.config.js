/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1F2D3D',
        forest: '#5F7168',
        mustard: '#B39A59',
        stone: '#C7C1B8',
        mist: '#E7E1D9',
        ink: '#1F2D3D',
        paper: '#F5F1EC',
        surface: '#FCFAF7',
        line: '#D7CEC3',
        accent: {
          DEFAULT: '#5F7168',
          dark: '#415C54',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}
