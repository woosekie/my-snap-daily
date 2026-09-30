import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Laptop, Smartphone, HelpCircle, Usb } from 'lucide-react';
import { playPopSound } from '../utils/soundEffects';

export function DeviceSelectorModal({
  isOpen,
  onClose,
  selectedDeviceId,
  onSelectDevice,
  onOpenRemoteModal,
}) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      // First ensure permission is requested
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr) {
        console.warn('Camera permission check:', permErr);
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoInputs);
    } catch (err) {
      setError('Gagal membaca daftar perangkat kamera: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleDeviceChange = () => {
      fetchDevices();
    };
    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Camera size={20} />
            </div>
            <div>
              <h3>Pilih Sumber Kamera</h3>
              <p className="modal-subtitle">Gunakan kamera internal, USB webcam, atau kamera HP</p>
            </div>
          </div>
          <button className="icon-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Option: Phone Camera Wireless */}
          <div 
            className="companion-banner" 
            onClick={() => {
              playPopSound();
              onClose();
              onOpenRemoteModal();
            }}
          >
            <div className="companion-banner-icon">
              <Smartphone size={28} />
            </div>
            <div className="companion-banner-text">
              <h4>Gunakan Kamera HP Tanpa Kabel (Wireless)</h4>
              <p>Scan kode QR menggunakan HP (Android / iPhone) untuk streaming kamera HP langsung ke PC ini!</p>
            </div>
            <span className="badge-highlight">Rekomendasi ⭐</span>
          </div>

          <div className="section-divider">
            <span>atau pilih kamera yang tercolok di PC / Laptop</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={24} className="spin" />
              <span>Mencari perangkat kamera...</span>
            </div>
          ) : error ? (
            <div className="alert-box alert-error">
              <p>{error}</p>
              <button className="btn-secondary btn-sm" onClick={fetchDevices}>Coba Lagi</button>
            </div>
          ) : devices.length === 0 ? (
            <div className="empty-devices">
              <Laptop size={40} className="empty-icon" />
              <h4>Tidak ada kamera fisik terdeteksi di PC/Laptop ini</h4>
              <p>Jangan khawatir! Kamu bisa:</p>
              <ul className="guide-list">
                <li>
                  <strong>Opsi 1 (Paling Mudah):</strong> Klik tombol <strong>"Gunakan Kamera HP (Wireless)"</strong> di atas untuk scan QR via HP kamu.
                </li>
                <li>
                  <strong>Opsi 2:</strong> Hubungkan webcam eksternal via kabel USB ke laptop/PC.
                </li>
                <li>
                  <strong>Opsi 3:</strong> Gunakan aplikasi seperti <strong>DroidCam</strong> atau <strong>Iriun Webcam</strong> di PC & HP kamu melalui kabel USB / WiFi.
                </li>
              </ul>
              <button 
                className="btn-primary" 
                onClick={() => {
                  playPopSound();
                  onClose();
                  onOpenRemoteModal();
                }}
              >
                <Smartphone size={18} /> Hubungkan Kamera HP Sekarang
              </button>
            </div>
          ) : (
            <div className="devices-list">
              {devices.map((device, index) => {
                const isSelected = selectedDeviceId === device.deviceId;
                const label = device.label || `Kamera ${index + 1} (${device.deviceId.substring(0, 8)}...)`;
                const isUsb = label.toLowerCase().includes('usb') || label.toLowerCase().includes('external');
                const isVirtual = label.toLowerCase().includes('droid') || label.toLowerCase().includes('iriun') || label.toLowerCase().includes('obs');

                return (
                  <div
                    key={device.deviceId || index}
                    className={`device-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      playPopSound();
                      onSelectDevice(device.deviceId);
                      onClose();
                    }}
                  >
                    <div className="device-info">
                      <div className="device-type-icon">
                        {isVirtual ? <Smartphone size={18} /> : isUsb ? <Usb size={18} /> : <Camera size={18} />}
                      </div>
                      <div>
                        <div className="device-name">{label}</div>
                        <div className="device-sublabel">
                          {isVirtual ? 'Virtual / DroidCam' : isUsb ? 'Kamera Eksternal USB' : 'Kamera Perangkat'}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="device-check">
                        <Check size={18} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* DroidCam / External Tips */}
          <div className="info-card">
            <div className="info-card-header">
              <HelpCircle size={16} />
              <span>Tips Laptop/PC Tanpa Kamera</span>
            </div>
            <p>
              Jika kamu ingin menggunakan kabel USB, install aplikasi gratis <strong>DroidCam Client</strong> atau <strong>Iriun Webcam</strong> di PC dan ponselmu. Setelah terhubung, kamera ponsel akan otomatis muncul di daftar pilihan di atas!
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={fetchDevices} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Segarkan Daftar
          </button>
          <button className="btn-primary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
