/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        boho: {
          terra: '#C97C5D',
          sand: '#B7967A',
          sage: '#8B9D77',
          clay: '#E4B7A0',
          rust: '#A45C40',
          cream: '#F6E6DA',
          stone: '#3a4f97',
        }
      },
      backgroundImage: {
        'boho-pattern': `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' preserveAspectRatio='xMidYMid slice' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientTransform='rotate(45)'%3E%3Cstop offset='0' stop-color='%23E4B7A0' stop-opacity='.15'/%3E%3Cstop offset='1' stop-color='%23C97C5D' stop-opacity='.1'/%3E%3C/linearGradient%3E%3ClinearGradient id='b' gradientTransform='rotate(-45)'%3E%3Cstop offset='0' stop-color='%238B9D77' stop-opacity='.1'/%3E%3Cstop offset='1' stop-color='%23B7967A' stop-opacity='.15'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M0,50 Q25,45 50,50 T100,50 L100,100 Q75,95 50,100 T0,100 Z' fill='url(%23a)'/%3E%3Cpath d='M100,0 Q75,5 50,0 T0,0 L0,50 Q25,45 50,50 T100,50 Z' fill='url(%23b)'/%3E%3Cpath d='M20,30 Q40,20 60,30 T100,30' stroke='%23C97C5D' stroke-width='0.5' fill='none' opacity='0.1'/%3E%3Cpath d='M0,70 Q20,60 40,70 T80,70' stroke='%238B9D77' stroke-width='0.5' fill='none' opacity='0.1'/%3E%3Ccircle cx='85' cy='25' r='3' fill='%23B7967A' opacity='0.1'/%3E%3Ccircle cx='15' cy='75' r='3' fill='%23E4B7A0' opacity='0.1'/%3E%3Cpath d='M50,0 C60,20 40,20 50,40 C60,60 40,60 50,80 C60,100 40,100 50,120' stroke='%23B7967A' stroke-width='0.5' fill='none' opacity='0.1'/%3E%3C/svg%3E")`,
      },
      fontFamily: {
        boho: ['Domain Display', 'serif'],
        sans: ['Domain Display', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};