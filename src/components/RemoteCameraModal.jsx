import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Smartphone, X, Copy, Check, ExternalLink, Wifi, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { playPopSound } from '../utils/soundEffects';

export function RemoteCameraModal({
  isOpen,
  onClose,
  roomId,
  isRemoteConnected,
  remoteDeviceName,
  onDisconnectRemote,
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && roomId) {
      const url = `${window.location.origin}${window.location.pathname}?remote=${roomId}`;
      setRemoteUrl(url);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f0f14',
          light: '#ffffff',
        },
      })
        .then(data => setQrDataUrl(data))
        .catch(err => console.error('Failed to generate QR code', err));
    }
  }, [roomId]);

  const copyToClipboard = () => {
    playPopSound();
    navigator.clipboard.writeText(remoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card remote-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge glow-purple">
              <Smartphone size={20} />
            </div>
            <div>
              <h3>Gunakan HP Sebagai Kamera (Wireless)</h3>
              <p className="modal-subtitle">Solusi instan bila laptop/PC tidak memiliki webcam</p>
            </div>
          </div>
          <button className="icon-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="remote-connection-status-bar">
            {isRemoteConnected ? (
              <div className="status-indicator connected">
                <span className="pulse-dot green"></span>
                <span>🟢 <strong>Kamera HP Terhubung!</strong> {remoteDeviceName || 'Ponsel Aktif'}</span>
              </div>
            ) : (
              <div className="status-indicator waiting">
                <span className="pulse-dot orange"></span>
                <span>⏳ Menunggu HP terhubung... Scan QR code di bawah</span>
              </div>
            )}
          </div>

          <div className="remote-grid">
            <div className="qr-container">
              {qrDataUrl ? (
                <div className="qr-card">
                  <img src={qrDataUrl} alt="Scan QR Code" className="qr-image" />
                  <div className="qr-label">
                    <Wifi size={14} /> Scan dengan Kamera HP kamu
                  </div>
                </div>
              ) : (
                <div className="qr-skeleton">
                  <RefreshCw size={24} className="spin" />
                  <span>Membuat Kode QR...</span>
                </div>
              )}
            </div>

            <div className="remote-instructions">
              <h4>Cara Menggunakan:</h4>
              <ol className="steps-list">
                <li>
                  <span className="step-num">1</span>
                  <span>Buka aplikasi <strong>Kamera</strong> di HP kamu (iPhone / Android).</span>
                </li>
                <li>
                  <span className="step-num">2</span>
                  <span>Arahkan kamera ke <strong>Kode QR</strong> di samping dan tap tautan yang muncul.</span>
                </li>
                <li>
                  <span className="step-num">3</span>
                  <span>Izinkan akses kamera di browser HP. Kamera HP akan langsung streaming ke layar PC ini!</span>
                </li>
                <li>
                  <span className="step-num">4</span>
                  <span>HP kamu juga akan berfungsi sebagai <strong>remote shutter</strong> untuk memotret dari jauh.</span>
                </li>
              </ol>

              <div className="copy-link-group">
                <span className="copy-link-label">Atau buka link ini di browser HP:</span>
                <div className="copy-link-box">
                  <input type="text" readOnly value={remoteUrl} className="input-field-compact" />
                  <button className="btn-secondary btn-sm" onClick={copyToClipboard}>
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    {copied ? 'Tersalin!' : 'Salin'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-badges">
            <div className="feature-badge">
              <ShieldCheck size={16} className="text-highlight" />
              <span>Peer-to-Peer Terenkripsi WebRTC</span>
            </div>
            <div className="feature-badge">
              <Smartphone size={16} className="text-highlight" />
              <span>Bisa Ganti Kamera Depan/Belakang HP</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {isRemoteConnected && (
            <button className="btn-danger btn-sm" onClick={onDisconnectRemote}>
              Putuskan Koneksi HP
            </button>
          )}
          <button className="btn-primary" onClick={onClose}>
            {isRemoteConnected ? 'Gunakan Kamera HP Ini' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
}
