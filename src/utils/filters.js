// Filter presets for real-time video CSS & high-resolution Canvas rendering

export const FILTERS = [
  {
    id: 'normal',
    name: 'Natural Clean',
    icon: '✨',
    css: 'none',
    canvasFilter: 'none',
    colorGrading: null,
  },
  {
    id: 'korean-glow',
    name: 'Korean Soft Glow',
    icon: '🌸',
    css: 'brightness(1.08) contrast(0.96) saturate(1.12) sepia(0.08)',
    canvasFilter: 'brightness(1.08) contrast(0.96) saturate(1.12) sepia(0.08)',
    colorGrading: 'rgba(255, 230, 240, 0.08)',
  },
  {
    id: 'bw-contrast',
    name: 'Film B&W Noir',
    icon: '🎬',
    css: 'grayscale(1) contrast(1.35) brightness(0.95)',
    canvasFilter: 'grayscale(1) contrast(1.35) brightness(0.95)',
    colorGrading: null,
  },
  {
    id: 'vintage-90s',
    name: 'Vintage 90s',
    icon: '🎞️',
    css: 'sepia(0.35) contrast(1.15) brightness(0.98) saturate(1.2)',
    canvasFilter: 'sepia(0.35) contrast(1.15) brightness(0.98) saturate(1.2)',
    colorGrading: 'rgba(255, 210, 150, 0.07)',
  },
  {
    id: 'golden-hour',
    name: 'Golden Sunset',
    icon: '🌅',
    css: 'sepia(0.2) saturate(1.35) contrast(1.05) brightness(1.04) hue-rotate(-8deg)',
    canvasFilter: 'sepia(0.2) saturate(1.35) contrast(1.05) brightness(1.04) hue-rotate(-8deg)',
    colorGrading: 'rgba(255, 180, 50, 0.1)',
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Neon',
    icon: '🔮',
    css: 'contrast(1.25) saturate(1.45) hue-rotate(180deg) brightness(0.95)',
    canvasFilter: 'contrast(1.25) saturate(1.45) hue-rotate(180deg) brightness(0.95)',
    colorGrading: 'rgba(138, 43, 226, 0.1)',
  },
  {
    id: 'cool-mist',
    name: 'Cool Film Mist',
    icon: '❄️',
    css: 'hue-rotate(25deg) saturate(0.9) contrast(1.08) brightness(1.05)',
    canvasFilter: 'hue-rotate(25deg) saturate(0.9) contrast(1.08) brightness(1.05)',
    colorGrading: 'rgba(100, 200, 255, 0.08)',
  },
  {
    id: 'matte-mono',
    name: 'Matte Grayscale',
    icon: '☕',
    css: 'grayscale(1) contrast(0.9) brightness(1.1)',
    canvasFilter: 'grayscale(1) contrast(0.9) brightness(1.1)',
    colorGrading: 'rgba(240, 235, 225, 0.06)',
  },
];

export function getFilterById(id) {
  return FILTERS.find(f => f.id === id) || FILTERS[0];
}
