module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0f172a',
          secondary: '#1e293b',
          card: 'rgba(30, 41, 59, 0.7)'
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          accent: '#38bdf8'
        },
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb'
        },
        secondary: '#1e293b',
        accent: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    }
  },
  plugins: []
}
