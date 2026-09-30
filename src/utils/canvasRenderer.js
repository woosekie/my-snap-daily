// High-Resolution Photobooth Canvas Rendering Engine
// Generates Korean Life4Cuts style photostrips, grids, and polaroids

export const FRAME_THEMES = [
  { id: 'dark-onyx', name: 'Midnight Onyx', bg: '#111218', text: '#ffffff', subtext: '#8a8d9f', border: '#262835' },
  { id: 'pure-white', name: 'Paper White', bg: '#ffffff', text: '#121216', subtext: '#6d7080', border: '#e8e8f0' },
  { id: 'cloud-cream', name: 'Warm Cream', bg: '#fdfbf7', text: '#2c2523', subtext: '#8f857d', border: '#ede4d8' },
  { id: 'pastel-pink', name: 'Sakura Blush', bg: '#ffe5ec', text: '#5c1b33', subtext: '#994a69', border: '#f7cad0' },
  { id: 'baby-blue', name: 'Cloud Sky', bg: '#dbeafe', text: '#1e3a8a', subtext: '#3b82f6', border: '#bfdbfe' },
  { id: 'lavender', name: 'Lilac Mist', bg: '#ede9fe', text: '#4c1d95', subtext: '#7c3aed', border: '#ddd6fe' },
  { id: 'mint-matcha', name: 'Matcha Foam', bg: '#dcfce7', text: '#14532d', subtext: '#16a34a', border: '#bbf7d0' },
  { id: 'butter-yellow', name: 'Soft Butter', bg: '#fef3c7', text: '#78350f', subtext: '#d97706', border: '#fde68a' },
  { id: 'cyber-dark', name: 'Cyber Violet', bg: 'linear-gradient(180deg, #180d2b 0%, #0a0614 100%)', text: '#00f5d4', subtext: '#ff3366', border: '#8a2be2' },
  { id: 'sunset-aura', name: 'Sunset Aura', bg: 'linear-gradient(180deg, #fbcfe8 0%, #fed7aa 100%)', text: '#831843', subtext: '#9a3412', border: '#f472b6' },
];

export const LAYOUTS = {
  'classic-4': {
    id: 'classic-4',
    name: 'Classic 4-Cut Strip',
    description: 'Iconic Korean vertical strip (4 photos)',
    photoCount: 4,
    aspectRatio: '1:3.2',
    canvasWidth: 800,
    canvasHeight: 2500,
    getSlots: (w, h) => {
      const padX = 50;
      const padTop = 130;
      const padBottom = 160;
      const gap = 30;
      const availableH = h - padTop - padBottom - (3 * gap);
      const photoH = availableH / 4;
      const photoW = w - (padX * 2);

      return [
        { x: padX, y: padTop, w: photoW, h: photoH },
        { x: padX, y: padTop + photoH + gap, w: photoW, h: photoH },
        { x: padX, y: padTop + (photoH + gap) * 2, w: photoW, h: photoH },
        { x: padX, y: padTop + (photoH + gap) * 3, w: photoW, h: photoH },
      ];
    },
  },
  'grid-2x2': {
    id: 'grid-2x2',
    name: '2x2 Grid Card',
    description: 'Modern square photo card (4 photos)',
    photoCount: 4,
    aspectRatio: '1:1.15',
    canvasWidth: 1400,
    canvasHeight: 1600,
    getSlots: (w, h) => {
      const padX = 60;
      const padTop = 140;
      const padBottom = 160;
      const gap = 30;
      const photoW = (w - (padX * 2) - gap) / 2;
      const availableH = h - padTop - padBottom - gap;
      const photoH = availableH / 2;

      return [
        { x: padX, y: padTop, w: photoW, h: photoH },
        { x: padX + photoW + gap, y: padTop, w: photoW, h: photoH },
        { x: padX, y: padTop + photoH + gap, w: photoW, h: photoH },
        { x: padX + photoW + gap, y: padTop + photoH + gap, w: photoW, h: photoH },
      ];
    },
  },
  'strip-3': {
    id: 'strip-3',
    name: '3-Cut Vertical',
    description: 'Minimalist 3 photos vertical strip',
    photoCount: 3,
    aspectRatio: '1:2.5',
    canvasWidth: 800,
    canvasHeight: 1950,
    getSlots: (w, h) => {
      const padX = 50;
      const padTop = 130;
      const padBottom = 160;
      const gap = 30;
      const availableH = h - padTop - padBottom - (2 * gap);
      const photoH = availableH / 3;
      const photoW = w - (padX * 2);

      return [
        { x: padX, y: padTop, w: photoW, h: photoH },
        { x: padX, y: padTop + photoH + gap, w: photoW, h: photoH },
        { x: padX, y: padTop + (photoH + gap) * 2, w: photoW, h: photoH },
      ];
    },
  },
  'polaroid-1': {
    id: 'polaroid-1',
    name: 'Single Polaroid',
    description: 'Large aesthetic single polaroid',
    photoCount: 1,
    aspectRatio: '1:1.3',
    canvasWidth: 1000,
    canvasHeight: 1300,
    getSlots: (w, h) => {
      const padX = 60;
      const padTop = 60;
      const photoW = w - (padX * 2);
      const photoH = photoW * 0.95;

      return [
        { x: padX, y: padTop, w: photoW, h: photoH },
      ];
    },
  },
};

export const STICKER_PACKS = [
  '❤️', '✨', '⭐', '🎀', '🌸', '🕶️', '🐱', '🐰', 
  '🍓', '🔥', '👑', '🎉', '🥂', '🍀', '🦋', '🧸',
  '✌️', '💕', '💫', '🧁', '🍒', '🌻', '🐶', '💖'
];

/**
 * Renders the photobooth strip onto a canvas and returns the canvas element
 */
export async function renderPhotostrip({
  photos = [],
  layoutId = 'classic-4',
  frameThemeId = 'dark-onyx',
  customTitle = 'SNAP LUMINA',
  customSubtitle = '',
  stickers = [],
  filterId = 'normal',
}) {
  const layout = LAYOUTS[layoutId] || LAYOUTS['classic-4'];
  const theme = FRAME_THEMES.find(t => t.id === frameThemeId) || FRAME_THEMES[0];

  const canvas = document.createElement('canvas');
  canvas.width = layout.canvasWidth;
  canvas.height = layout.canvasHeight;
  const ctx = canvas.getContext('2d');

  // 1. Draw Background
  if (theme.bg.startsWith('linear-gradient')) {
    // Parse gradient
    const grad = ctx.createLinearGradient(0, 0, 0, layout.canvasHeight);
    if (theme.id === 'cyber-dark') {
      grad.addColorStop(0, '#180d2b');
      grad.addColorStop(1, '#0a0614');
    } else {
      grad.addColorStop(0, '#fbcfe8');
      grad.addColorStop(1, '#fed7aa');
    }
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = theme.bg;
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper texture or border
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // 2. Draw Header
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.text;
  ctx.font = '800 28px "Outfit", "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText(customTitle.toUpperCase(), canvas.width / 2, 70);

  // Subtitle / Date in header
  ctx.fillStyle = theme.subtext;
  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '2px';
  const displayDate = customSubtitle || new Date().toISOString().split('T')[0].replace(/-/g, '.');
  ctx.fillText(displayDate, canvas.width / 2, 98);
  ctx.restore();

  // 3. Draw Photo Slots
  const slots = layout.getSlots(canvas.width, canvas.height);

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const photoDataUrl = photos[i];

    // Background placeholder for empty slot
    ctx.fillStyle = theme.id === 'pure-white' || theme.id === 'cloud-cream' ? '#f0f0f5' : '#1e1f2b';
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 12);
    ctx.fill();

    if (photoDataUrl) {
      try {
        const img = await loadImage(photoDataUrl);
        ctx.save();
        roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 12);
        ctx.clip();

        // Calculate aspect fill (cover)
        const imgAspect = img.width / img.height;
        const slotAspect = slot.w / slot.h;
        let drawW, drawH, drawX, drawY;

        if (imgAspect > slotAspect) {
          drawH = slot.h;
          drawW = slot.h * imgAspect;
          drawX = slot.x - (drawW - slot.w) / 2;
          drawY = slot.y;
        } else {
          drawW = slot.w;
          drawH = slot.w / imgAspect;
          drawX = slot.x;
          drawY = slot.y - (drawH - slot.h) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();

        // Slot subtle border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 2;
        roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 12);
        ctx.stroke();
      } catch (err) {
        console.error('Failed to draw photo on canvas:', err);
      }
    } else {
      // Empty slot placeholder text
      ctx.fillStyle = theme.subtext;
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Foto #${i + 1}`, slot.x + slot.w / 2, slot.y + slot.h / 2);
    }
  }

  // 4. Draw Footer Details (Korean Life4Cuts style barcode / branding)
  ctx.save();
  const footerY = canvas.height - 75;
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.text;
  ctx.font = '800 20px "Outfit", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('SNAP LUMINA PHOTO STUDIO', canvas.width / 2, footerY);

  // Decorative barcode aesthetic in footer
  drawSimulatedBarcode(ctx, canvas.width / 2 - 100, footerY + 16, 200, 24, theme.text);

  ctx.fillStyle = theme.subtext;
  ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('AUTHENTIC MEMORY STRIP • LIFE4CUTS EDITION', canvas.width / 2, footerY + 54);
  ctx.restore();

  // 5. Draw Stickers
  for (const sticker of stickers) {
    ctx.save();
    const stX = (sticker.x / 100) * canvas.width;
    const stY = (sticker.y / 100) * canvas.height;
    const size = sticker.size || 60;

    ctx.translate(stX, stY);
    if (sticker.rotation) {
      ctx.rotate((sticker.rotation * Math.PI) / 180);
    }

    ctx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 8;
    ctx.fillText(sticker.emoji, 0, 0);
    ctx.restore();
  }

  return canvas;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawSimulatedBarcode(ctx, x, y, width, height, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.65;
  let currX = x;
  const pattern = [2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1];
  const unit = width / 70;

  for (let i = 0; currX < x + width && i < pattern.length; i++) {
    const barW = pattern[i] * unit;
    if (i % 2 === 0) {
      ctx.fillRect(currX, y, Math.max(1.5, barW), height);
    }
    currX += barW + unit;
  }
  ctx.restore();
}
