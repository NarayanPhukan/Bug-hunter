/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono:    ['"JetBrains Mono"', 'Courier New', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Surfaces — deep slate */
        bg:      '#0a0a0f',
        bg2:     '#12121a',
        bg3:     '#1a1a25',
        bg4:     '#222230',

        /* Borders */
        border:  '#1f1f2e',
        border2: '#2a2a3d',
        border3: '#35354d',

        /* Brand — refined violet-blue */
        indigo:  '#7c5cfc',
        indigo2: '#9b82fc',
        indigo3: '#6344e8',
        primary: '#7c5cfc',
        primary2:'#9b82fc',
        primary3:'#6344e8',

        /* Accents */
        accent:  '#34d399',
        accent2: '#10b981',
        cyan:    '#22d3ee',
        cyan2:   '#06b6d4',

        /* Semantic */
        red:     '#ef4444',
        orange:  '#f97316',
        yellow:  '#eab308',
        green:   '#22c55e',
        green2:  '#16a34a',

        /* Text */
        text:    '#f0f0f5',
        text2:   '#a0a0b8',
        text3:   '#5a5a72',

        /* Legacy compat */
        textmain: '#f0f0f5',
        dim:      '#5a5a72',
        blue:     '#22d3ee',
      },
      animation: {
        'fade-up':       'fadeUp 0.45s ease both',
        'fade-in':       'fadeIn 0.35s ease both',
        'slide-right':   'slideRight 0.3s ease both',
        'scale-in':      'scaleIn 0.25s ease both',
        'blink':         'blink 1.2s step-end infinite',
        'pulse-indigo':  'pulsePrimary 2s ease-in-out infinite',
        'pulse-primary': 'pulsePrimary 2s ease-in-out infinite',
        'pulse-red':     'pulseRed 1.5s ease-in-out infinite',
        'pulse-green':   'pulseGreen 1.5s ease-in-out infinite',
        'spin-slow':     'spin 3s linear infinite',
        'shimmer':       'shimmer 4s linear infinite',
        'float':         'float 3s ease-in-out infinite',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
        'slide-in':      'slideIn 0.3s ease',
      },
      keyframes: {
        fadeUp:       { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        slideRight:   { from: { opacity: 0, transform: 'translateX(-12px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        scaleIn:      { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        blink:        { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
        pulsePrimary: { '0%,100%': { boxShadow: '0 0 0 0 rgba(124,92,252,0.35)' }, '50%': { boxShadow: '0 0 0 8px rgba(124,92,252,0)' } },
        pulseRed:     { '0%,100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.35)' }, '50%': { boxShadow: '0 0 0 8px rgba(239,68,68,0)' } },
        pulseGreen:   { '0%,100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.35)' }, '50%': { boxShadow: '0 0 0 8px rgba(34,197,94,0)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        float:        { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
        glowPulse:    { '0%,100%': { opacity: 0.5 }, '50%': { opacity: 1 } },
        slideIn:      { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(124,92,252,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.04) 1px, transparent 1px)",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
      boxShadow: {
        'glow-indigo':  '0 0 40px rgba(124,92,252,0.12), 0 0 80px rgba(124,92,252,0.04)',
        'glow-primary': '0 0 40px rgba(124,92,252,0.12), 0 0 80px rgba(124,92,252,0.04)',
        'glow-cyan':    '0 0 40px rgba(52,211,153,0.12)',
        'card':         '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover':   '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,92,252,0.15)',
      },
    },
  },
  plugins: [],
};
