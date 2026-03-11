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
        mono:    ['Share Tech Mono', 'Courier New', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
        sans:    ['Inter', 'sans-serif'],
      },
      colors: {
        bg:       '#070a0f',
        bg2:      '#0b0f17',
        bg3:      '#0f1420',
        border:   '#1a2535',
        border2:  '#243044',
        green:    '#00ff88',
        green2:   '#00cc6a',
        red:      '#ff3355',
        yellow:   '#ffcc00',
        blue:     '#00aaff',
        dim:      '#5a7090',
        textmain: '#c8d8e8',
      },
      animation: {
        blink:       'blink 1s step-end infinite',
        scanline:    'scanline 8s linear infinite',
        'pulse-red': 'pulse-red 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'slide-in':  'slide-in 0.3s ease',
        'glow-green':'glow-green 2s ease-in-out infinite',
        flicker:     'flicker 8s infinite',
      },
      keyframes: {
        blink:        { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
        scanline:     { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
        'pulse-red':  { '0%,100%': { boxShadow: '0 0 0 0 rgba(255,51,85,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(255,51,85,0)' } },
        'slide-in':   { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'glow-green': { '0%,100%': { textShadow: '0 0 8px #00ff88' }, '50%': { textShadow: '0 0 20px #00ff88, 0 0 40px #00cc6a' } },
        flicker:      { '0%,95%,100%': { opacity: 1 }, '96%': { opacity: 0.4 }, '97%': { opacity: 1 }, '98%': { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
};
