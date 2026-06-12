/** Contiki Design System — Tailwind theme extension
 *  Mirrors prds/design-system.md. Import in your build or use via CDN config.
 */
module.exports = {
  content: ['./*.html', './**/*.html', './**/*.js'],
  theme: {
    extend: {
      colors: {
        // Brand
        go:     { DEFAULT: '#FF5900', alt: '#FF7300' }, // Contiki GO (primary orange)
        wander: { DEFAULT: '#1C4A3D', alt: '#1C6348' }, // Contiki WANDER (green)
        burst:  '#FFE100',                               // Contiki BURST (sale yellow)
        dusk:   '#0A0C0A',                               // Contiki DUSK (black)
        dawn:   '#FFFAF2',                               // Contiki DAWN (cream)
        // Supporting
        'ui-grey80': '#6B6B6B',
        'ui-border': '#E5E0D8',
        'card-dark': '#1C1C1C',
      },
      fontFamily: {
        // Production: Mencken + Halyard via Adobe Typekit. Dev fallback: Playfair + Inter.
        hero: ['"Mencken Std Head Compressed"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Halyard Display"', '"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Halyard Text"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        hero: '0.05em', // 20 tracking for GO WANDER lockup
      },
      lineHeight: {
        hero: '0.75',   // 75% leading for GO WANDER lockup
      },
      borderRadius: {
        card: '16px',
        media: '12px',
        pill: '100px',
      },
      backgroundImage: {
        'opacity-dark-gradient-ascending': 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        'opacity-dark-gradient-descending': 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        'opacity-light-gradient-ascending': 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)',
        'opacity-light-gradient-descending': 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)',
      },
      transitionTimingFunction: {
        modal: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
