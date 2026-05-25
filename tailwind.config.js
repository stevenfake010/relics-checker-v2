/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--color-paper)',
        ink: 'var(--color-ink)',
        vermilion: {
          DEFAULT: 'var(--color-vermilion)',
          light: 'var(--color-vermilion-light)',
        },
        gold: 'var(--color-gold)',
        bronze: 'var(--color-bronze)',
        jade: 'var(--color-jade)',
        mist: 'var(--color-mist)',
        border: 'var(--color-border)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          alt: 'var(--color-surface-alt)',
        },
      },
    },
  },
  plugins: [],
}
