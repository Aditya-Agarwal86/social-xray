import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Token Mapping
        app: 'var(--bg-app)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
          muted: 'var(--bg-surface-muted)',
          subtle: 'var(--bg-subtle)',
          hover: 'var(--bg-surface-hover)',
        },
        border: {
          DEFAULT: 'var(--border-app)',
          subtle: 'var(--border-subtle)',
          muted: 'var(--border-muted)',
          accent: 'var(--border-accent)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          subtle: 'var(--text-subtle)',
        },
        accent: {
          DEFAULT: 'var(--accent-primary)',
          surface: 'var(--accent-surface)',
          hover: 'var(--accent-hover)',
          contrast: 'var(--accent-contrast)',
        },

        // Backward compatibility carbon mappings to semantic slate/charcoal
        carbon: {
          950: '#0d1117',
          900: '#131722',
          850: '#161b26',
          800: '#1c2230',
          750: '#232c3d',
          700: '#2d374d',
          600: '#3d4b66',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f8fafc',
        },
        forensic: {
          cyan: '#0284c7',
          'cyan-muted': '#0369a1',
          amber: '#d97706',
          red: '#dc2626',
          emerald: '#059669',
          violet: '#6366f1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
