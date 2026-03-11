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
        display: ['Syne', 'sans-serif'],
        sans:    ['Outfit', 'sans-serif'],
      },
      colors: {
        /* Surfaces */
        bg:      '#080c14',
        bg2:     '#0d1220',
        bg3:     '#111827',
        bg4:     '#161e2e',

        /* Borders */
        border:  '#1e2d45',
        border2: '#2a3f5e',
        border3: '#364f76',

        /* Brand */
        indigo:  '#6366f1',
        indigo2: '#818cf8',
        indigo3: '#4f46e5',
        cyan:    '#22d3ee',
        cyan2:   '#06b6d4',

        /* Semantic */
        red:     '#f43f5e',
        orange:  '#f97316',
        yellow:  '#eab308',
        green:   '#22c55e',
        green2:  '#16a34a',

        /* Text */
        text:    '#f1f5f9',
        text2:   '#94a3b8',
        text3:   '#475569',

        /* Legacy compat — keep so existing dashboard components don't break */
        textmain: '#f1f5f9',
        dim:      '#475569',
        blue:     '#22d3ee',
      },
      animation: {
        'fade-up':      'fadeUp 0.5s ease both',
        'fade-in':      'fadeIn 0.4s ease both',
        'slide-right':  'slideRight 0.3s ease both',
        'scale-in':     'scaleIn 0.3s ease both',
        'blink':        'blink 1.2s step-end infinite',
        'pulse-indigo': 'pulseIndigo 2s ease-in-out infinite',
        'pulse-red':    'pulseRed 1.5s ease-in-out infinite',
        'pulse-green':  'pulseGreen 1.5s ease-in-out infinite',
        'spin-slow':    'spin 3s linear infinite',
        'shimmer':      'shimmer 4s linear infinite',
        'float':        'float 3s ease-in-out infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        /* Legacy compat */
        'glow-green':   'glowGreen 2s ease-in-out infinite',
        'slide-in':     'slideIn 0.3s ease',
        'flicker':      'flicker 8s infinite',
      },
      keyframes: {
        fadeUp:      { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:      { from: { opacity: 0 }, to: { opacity: 1 } },
        slideRight:  { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        scaleIn:     { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        blink:       { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
        pulseIndigo: { '0%,100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(99,102,241,0)' } },
        pulseRed:    { '0%,100%': { boxShadow: '0 0 0 0 rgba(244,63,94,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(244,63,94,0)' } },
        pulseGreen:  { '0%,100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(34,197,94,0)' } },
        shimmer:     { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        float:       { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        glowPulse:   { '0%,100%': { opacity: 0.5 }, '50%': { opacity: 1 } },
        /* Legacy compat */
        glowGreen:   { '0%,100%': { textShadow: '0 0 8px #22c55e' }, '50%': { textShadow: '0 0 20px #22c55e, 0 0 40px #16a34a' } },
        slideIn:     { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        flicker:     { '0%,95%,100%': { opacity: 1 }, '96%': { opacity: 0.4 }, '97%': { opacity: 1 }, '98%': { opacity: 0.6 } },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
      boxShadow: {
        'glow-indigo': '0 0 40px rgba(99,102,241,0.15), 0 0 80px rgba(99,102,241,0.05)',
        'glow-cyan':   '0 0 40px rgba(34,211,238,0.15)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.2)',
      },
    },
  },
  plugins: [],
};
