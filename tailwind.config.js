/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#1a1a2e',
        'secondary-dark': '#16213e',
        'accent-dark': '#0f3460',
        'neon-blue': '#00d4ff',
        'neon-purple': '#9d4edd',
        'neon-green': '#00ff88',
        'text-primary': '#ffffff',
        'text-secondary': '#b8b8d1',
        'text-muted': '#6b7280',
        'glass-bg': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'shadow-soft': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'shadow-medium': '0 12px 24px rgba(0, 0, 0, 0.14)',
        'shadow-large': '0 16px 48px rgba(0, 0, 0, 0.16)',
        'purple-900': '#581c87',
        'purple-800': '#6b21a8',
        'purple-700': '#7c3aed',
        'purple-600': '#9333ea',
        'purple-500': '#a855f7',
      },
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse': 'pulse 1.5s infinite',
      },
      backdropBlur: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
