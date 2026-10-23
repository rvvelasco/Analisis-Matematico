/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface2) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        brand2: 'rgb(var(--brand2) / <alpha-value>)',
        ok: 'rgb(var(--ok) / <alpha-value>)',
        bad: 'rgb(var(--bad) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        afun: 'rgb(var(--a-fun) / <alpha-value>)',
        amat: 'rgb(var(--a-mat) / <alpha-value>)',
        avec: 'rgb(var(--a-vec) / <alpha-value>)',
        ader: 'rgb(var(--a-der) / <alpha-value>)',
        aint: 'rgb(var(--a-int) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter var"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter var"', 'ui-sans-serif', 'system-ui', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: { glow: '0 0 0 1px rgb(var(--brand) / .35), 0 8px 30px -8px rgb(var(--brand) / .45)' },
    },
  },
  plugins: [],
}
