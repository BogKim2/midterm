/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'deep-night': '#0D1F1A',
        'prigio-green': '#1D9E75',
        'mint': '#5DCAA5',
        'ice': '#E1F5EE',
        'warm-amber': '#FAC775',
        'cream': '#F1EFE8',
        'text-secondary': '#5F5E5A',
        'border-default': '#D3D1C7',
        'danger': '#E24B4A',
      },
      fontFamily: {
        'logo': ['"Playfair Display"', 'Georgia', 'serif'],
        'sans': ['Pretendard Variable', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
