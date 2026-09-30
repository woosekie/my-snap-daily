import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { 
  Download, 
  Printer, 
  RotateCcw, 
  Sparkles, 
  Palette, 
  Layout, 
  Type, 
  Smile, 
  Share2, 
  Trash2, 
  QrCode,
  Check,
  Smartphone
} from 'lucide-react';
import { FRAME_THEMES, LAYOUTS, STICKER_PACKS, renderPhotostrip } from '../utils/canvasRenderer';
import { playPopSound, playSuccessChime } from '../utils/soundEffects';

export function CustomizationStudio({
  photos,
  onRetakeAll,
  onRetakeSingle,
}) {
  const [activeLayoutId, setActiveLayoutId] = useState('classic-4');
  const [activeThemeId, setActiveThemeId] = useState('dark-onyx');
  const [customTitle, setCustomTitle] = useState('SNAP LUMINA');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [stickers, setStickers] = useState([]);
  const [isRendering, setIsRendering] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrShareUrl, setQrShareUrl] = useState('');
  const [activeTab, setActiveTab] = useState('theme'); // 'theme', 'layout', 'text', 'stickers'

  // Trigger celebration confetti on mount
  useEffect(() => {
    playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  // Update canvas preview whenever parameters change
  useEffect(() => {
    let isCancelled = false;

    async function updatePreview() {
      setIsRendering(true);
      try {
        const canvas = await renderPhotostrip({
          photos,
          layoutId: activeLayoutId,
          frameThemeId: activeThemeId,
          customTitle,
          customSubtitle,
          stickers,
        });

        if (!isCancelled) {
          const dataUrl = canvas.toDataURL('image/png');
          setPreviewDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Render error:', err);
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    }

    updatePreview();

    return () => {
      isCancelled = true;
    };
  }, [photos, activeLayoutId, activeThemeId, customTitle, customSubtitle, stickers]);

  // Add sticker to canvas center
  const addSticker = (emoji) => {
    playPopSound();
    const newSticker = {
      id: Date.now() + Math.random(),
      emoji,
      x: 30 + Math.random() * 40, // 30% to 70% width
      y: 20 + Math.random() * 60, // 20% to 80% height
      size: 56,
      rotation: (Math.random() - 0.5) * 30,
    };
    setStickers([...stickers, newSticker]);
  };

  const removeSticker = (id) => {
    playPopSound();
    setStickers(stickers.filter(s => s.id !== id));
  };

  const clearAllStickers = () => {
    playPopSound();
    setStickers([]);
  };

  // Download High-Res PNG
  const downloadHighRes = async () => {
    playPopSound();
    confetti({ particleCount: 50, spread: 60 });

    const canvas = await renderPhotostrip({
      photos,
      layoutId: activeLayoutId,
      frameThemeId: activeThemeId,
      customTitle,
      customSubtitle,
      stickers,
    });

    const link = document.createElement('a');
    link.download = `snaplumina-photobooth-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  // Print Photostrip
  const handlePrint = () => {
    playPopSound();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Photostrip SnapLumina</title>
          <style>
            @page { size: auto; margin: 0; }
            body { 
              margin: 0; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              background: #fff;
            }
            img { 
              max-height: 96vh; 
              max-width: 96vw; 
              object-fit: contain; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
            }
          </style>
        </head>
        <body>
          <img src="${previewDataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Generate QR code for mobile share
  const openShareModal = async () => {
    playPopSound();
    setShowShareModal(true);
    try {
      // In local/demo, generate QR with the current origin
      const shareUrl = window.location.href.split('?')[0];
      const qr = await QRCode.toDataURL(shareUrl, { width: 260, margin: 2 });
      setQrShareUrl(qr);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="customization-studio">
      {/* Studio Header */}
      <div className="studio-header glass-panel">
        <div className="studio-title-group">
          <button className="btn-ghost" onClick={onRetakeAll}>
            <RotateCcw size={16} /> Foto Ulang
          </button>
          <h2>Custom Studio Photobooth</h2>
        </div>

        <div className="studio-header-actions">
          <button className="btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Cetak
          </button>
          <button className="btn-primary" onClick={downloadHighRes}>
            <Download size={16} /> Unduh Photostrip HD
          </button>
        </div>
      </div>

      <div className="studio-main-grid">
        {/* Left Side: Controls & Editor */}
        <div className="studio-controls-panel glass-panel">
          {/* Navigation Tabs */}
          <div className="studio-tabs">
            <button
              className={`studio-tab ${activeTab === 'theme' ? 'active' : ''}`}
              onClick={() => { playPopSound(); setActiveTab('theme'); }}
            >
              <Palette size={16} /> Frame
            </button>
            <button
              className={`studio-tab ${activeTab === 'layout' ? 'active' : ''}`}
              onClick={() => { playPopSound(); setActiveTab('layout'); }}
            >
              <Layout size={16} /> Layout
            </button>
            <button
              className={`studio-tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => { playPopSound(); setActiveTab('text'); }}
            >
              <Type size={16} /> Teks
            </button>
            <button
              className={`studio-tab ${activeTab === 'stickers' ? 'active' : ''}`}
              onClick={() => { playPopSound(); setActiveTab('stickers'); }}
            >
              <Smile size={16} /> Stiker
            </button>
          </div>

          <div className="studio-tab-content">
            {/* Tab: Frame Themes */}
            {activeTab === 'theme' && (
              <div className="themes-tab-body">
                <h4>Pilih Warna / Tema Frame</h4>
                <div className="theme-swatches-grid">
                  {FRAME_THEMES.map(theme => {
                    const isSelected = activeThemeId === theme.id;
                    return (
                      <div
                        key={theme.id}
                        className={`theme-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => { playPopSound(); setActiveThemeId(theme.id); }}
                      >
                        <div
                          className="theme-preview-color"
                          style={{
                            background: theme.bg,
                            border: `2px solid ${theme.border}`,
                          }}
                        >
                          {isSelected && <Check size={16} color={theme.text} />}
                        </div>
                        <span className="theme-card-name">{theme.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Layouts */}
            {activeTab === 'layout' && (
              <div className="layouts-tab-body">
                <h4>Pilih Format Strip</h4>
                <div className="layouts-list">
                  {Object.values(LAYOUTS).map(layout => {
                    const isSelected = activeLayoutId === layout.id;
                    return (
                      <div
                        key={layout.id}
                        className={`layout-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => { playPopSound(); setActiveLayoutId(layout.id); }}
                      >
                        <div className="layout-card-info">
                          <h5>{layout.name}</h5>
                          <p>{layout.description}</p>
                        </div>
                        {isSelected && <Check size={18} className="text-highlight" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Text & Labels */}
            {activeTab === 'text' && (
              <div className="text-tab-body">
                <h4>Kustomisasi Tulisan</h4>
                <div className="input-group">
                  <label>Judul Header Photostrip:</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder="Contoh: SNAP LUMINA / BESTIES 2026"
                    className="input-field"
                    maxLength={32}
                  />
                </div>

                <div className="input-group">
                  <label>Subjudul / Tanggal / Lokasi:</label>
                  <input
                    type="text"
                    value={customSubtitle}
                    onChange={e => setCustomSubtitle(e.target.value)}
                    placeholder="Otomatis tanggal hari ini jika kosong"
                    className="input-field"
                    maxLength={40}
                  />
                </div>
              </div>
            )}

            {/* Tab: Stickers */}
            {activeTab === 'stickers' && (
              <div className="stickers-tab-body">
                <div className="stickers-header">
                  <h4>Tempel Stiker Lucu</h4>
                  {stickers.length > 0 && (
                    <button className="btn-ghost btn-sm text-danger" onClick={clearAllStickers}>
                      <Trash2 size={14} /> Hapus Semua
                    </button>
                  )}
                </div>

                <div className="stickers-palette">
                  {STICKER_PACKS.map(emoji => (
                    <button
                      key={emoji}
                      className="sticker-btn"
                      onClick={() => addSticker(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {stickers.length > 0 && (
                  <div className="active-stickers-list">
                    <h5>Stiker Aktif ({stickers.length}):</h5>
                    <div className="active-stickers-tags">
                      {stickers.map((st, i) => (
                        <div key={st.id} className="active-sticker-pill">
                          <span>{st.emoji} #{i + 1}</span>
                          <button onClick={() => removeSticker(st.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Strip Preview with Authentic Studio Shadow */}
        <div className="studio-preview-viewport">
          <div className="preview-canvas-holder">
            {isRendering && (
              <div className="rendering-spinner">
                <Sparkles size={24} className="spin" />
              </div>
            )}
            {previewDataUrl ? (
              <div className="photostrip-paper-card">
                <img
                  src={previewDataUrl}
                  alt="Photostrip Preview"
                  className="photostrip-final-image"
                />
              </div>
            ) : (
              <div className="preview-loading">Menyiapkan frame...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
