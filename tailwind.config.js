/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,tsx}"],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'spin-slower': 'spin 30s linear infinite',
      },
      colors: {
        brand: {
          tan:         '#8d7e61',
          'tan-dark':  '#72674e',
          'tan-light': '#b39c72',
          green:       '#2E5C37',
          cream:       '#f7f6ef',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
