import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  FlipHorizontal, 
  Grid3X3, 
  Sparkles, 
  Timer, 
  Smartphone, 
  Settings2, 
  RefreshCw,
  Image as ImageIcon,
  CheckCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { FILTERS } from '../utils/filters';
import { playCountdownBeep, playShutterSound, playPopSound } from '../utils/soundEffects';

export function CameraView({
  stream,
  isRemoteConnected,
  remoteDeviceName,
  onOpenDeviceModal,
  onOpenRemoteModal,
  activeFilter,
  onSelectFilter,
  targetPhotoCount = 4,
  capturedPhotos = [],
  onPhotoCaptured,
  onSequenceComplete,
  isCapturingSequence,
  setIsCapturingSequence,
  onResetPhotos,
  onProceedToStudio,
  onUploadPhoto,
}) {
  const videoRef = useRef(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [timerDuration, setTimerDuration] = useState(3); // 3, 5, 10 seconds
  const [currentCountdown, setCurrentCountdown] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);

  // Sync stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Capture single frame from video element
  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    // Handle mirror flip
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Apply active filter to canvas
    if (activeFilter.canvasFilter && activeFilter.canvasFilter !== 'none') {
      ctx.filter = activeFilter.canvasFilter;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply color grading overlay if any
    if (activeFilter.colorGrading) {
      ctx.fillStyle = activeFilter.colorGrading;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Start automated photobooth sequence (e.g. 4 photos with countdowns)
  const startAutomatedSequence = async () => {
    if (isCapturingSequence) return;
    setIsCapturingSequence(true);
    playPopSound();

    let photos = [...capturedPhotos];
    const totalToTake = targetPhotoCount - photos.length;

    for (let i = 0; i < totalToTake; i++) {
      const shotNumber = photos.length + 1;
      setCurrentShotIndex(shotNumber);

      // Countdown
      for (let sec = timerDuration; sec > 0; sec--) {
        setCurrentCountdown(sec);
        playCountdownBeep(false);
        await new Promise(r => setTimeout(r, 1000));
      }

      // Final cheese moment
      setCurrentCountdown('CHEESE! 📸');
      playCountdownBeep(true);
      await new Promise(r => setTimeout(r, 400));

      // Shutter & Flash
      setIsFlashing(true);
      playShutterSound();
      const photoData = captureFrame();

      if (photoData) {
        photos.push(photoData);
        onPhotoCaptured(photoData);
      }

      await new Promise(r => setTimeout(r, 200));
      setIsFlashing(false);
      setCurrentCountdown(null);

      // Small breather pause between shots
      if (i < totalToTake - 1) {
        await new Promise(r => setTimeout(r, 1200));
      }
    }

    setIsCapturingSequence(false);
    if (photos.length >= targetPhotoCount) {
      onSequenceComplete();
    }
  };

  // Single manual snap
  const takeSinglePhoto = () => {
    if (isCapturingSequence || capturedPhotos.length >= targetPhotoCount) return;

    let sec = timerDuration;
    if (sec === 0) {
      setIsFlashing(true);
      playShutterSound();
      const photoData = captureFrame();
      if (photoData) {
        onPhotoCaptured(photoData);
      }
      setTimeout(() => setIsFlashing(false), 200);
      return;
    }

    const interval = setInterval(() => {
      setCurrentCountdown(sec);
      playCountdownBeep(sec === 1);
      sec--;

      if (sec < 0) {
        clearInterval(interval);
        setCurrentCountdown('CHEESE! 📸');
        setTimeout(() => {
          setIsFlashing(true);
          playShutterSound();
          const photoData = captureFrame();
          if (photoData) {
            onPhotoCaptured(photoData);
          }
          setTimeout(() => {
            setIsFlashing(false);
            setCurrentCountdown(null);
          }, 250);
        }, 300);
      }
    }, 1000);
  };

  const generateDemoPhotos = () => {
    playPopSound();
    const themes = [
      { bg1: '#ff9a9e', bg2: '#fecfef', emoji: '✌️', tag: 'Pose 1 • Peace' },
      { bg1: '#a1c4fd', bg2: '#c2e9fb', emoji: '🕶️', tag: 'Pose 2 • Cool Chic' },
      { bg1: '#ffecd2', bg2: '#fcb69f', emoji: '🥰', tag: 'Pose 3 • Cheek Heart' },
      { bg1: '#d4fc79', bg2: '#96e6a1', emoji: '✨', tag: 'Pose 4 • Sparkle' },
    ];

    for (let i = 0; i < targetPhotoCount; i++) {
      const t = themes[i % themes.length];
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, t.bg1);
      grad.addColorStop(1, t.bg2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '130px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.emoji, canvas.width / 2, canvas.height / 2 - 25);

      ctx.fillStyle = '#222';
      ctx.font = 'bold 30px "Outfit", sans-serif';
      ctx.fillText(t.tag, canvas.width / 2, canvas.height / 2 + 100);

      onPhotoCaptured(canvas.toDataURL('image/jpeg', 0.95));
    }
    setTimeout(() => {
      onSequenceComplete();
    }, 400);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onPhotoCaptured(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="camera-booth-wrapper">
      {/* Top Bar Status & Controls */}
      <div className="booth-top-bar glass-panel">
        <div className="camera-source-indicator">
          {isRemoteConnected ? (
            <button className="source-pill remote-active" onClick={onOpenRemoteModal}>
              <span className="pulse-dot green" />
              <Smartphone size={16} />
              <span>HP Terhubung ({remoteDeviceName || 'Wireless'})</span>
            </button>
          ) : (
            <button className="source-pill" onClick={onOpenDeviceModal}>
              <span className="pulse-dot blue" />
              <Camera size={16} />
              <span>Ganti Kamera / Sambungkan HP</span>
            </button>
          )}

          <button className="btn-action-ghost" onClick={onOpenRemoteModal} title="Hubungkan HP sebagai Kamera">
            <Smartphone size={16} />
            <span className="hide-on-mobile">Kamera HP (Wireless)</span>
          </button>
        </div>

        <div className="booth-top-actions">
          {/* Mirror toggle */}
          <button 
            className={`icon-toggle-btn ${isMirrored ? 'active' : ''}`}
            onClick={() => { playPopSound(); setIsMirrored(!isMirrored); }}
            title="Mirror Balik Layar"
          >
            <FlipHorizontal size={18} />
          </button>

          {/* Grid lines toggle */}
          <button 
            className={`icon-toggle-btn ${showGrid ? 'active' : ''}`}
            onClick={() => { playPopSound(); setShowGrid(!showGrid); }}
            title="Tampilkan Garis Komposisi"
          >
            <Grid3X3 size={18} />
          </button>

          {/* Timer Selector */}
          <div className="timer-pill-group">
            {[3, 5, 10].map(seconds => (
              <button
                key={seconds}
                className={`timer-pill ${timerDuration === seconds ? 'active' : ''}`}
                onClick={() => { playPopSound(); setTimerDuration(seconds); }}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Viewfinder Frame */}
      <div className="viewfinder-container">
        {/* Flash Effect */}
        {isFlashing && <div className="flash-overlay active" />}

        {/* Big Countdown Overlay */}
        {currentCountdown !== null && (
          <div className="countdown-backdrop">
            <div className="countdown-glow-circle">
              <span className="countdown-big-text">{currentCountdown}</span>
            </div>
          </div>
        )}

        {/* Video Screen */}
        <div className="video-display-area">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`live-video-element ${isMirrored ? 'mirrored' : ''}`}
              style={{ filter: activeFilter.css }}
            />
          ) : (
            <div className="no-stream-placeholder">
              <Camera size={56} className="placeholder-icon pulse" />
              <h3>Kamera Belum Aktif</h3>
              <p>Laptop/PC kamu tidak memiliki kamera bawaan?</p>
              <div className="placeholder-actions">
                <button className="btn-primary" onClick={onOpenRemoteModal}>
                  <Smartphone size={18} /> Scan QR Hubungkan Kamera HP
                </button>
                <button className="btn-secondary" onClick={onOpenDeviceModal}>
                  <Camera size={18} /> Pilih USB / Virtual Webcam
                </button>
                <div className="placeholder-secondary-actions">
                  <label className="btn-ghost btn-sm btn-upload">
                    <ImageIcon size={16} /> Unggah Foto
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                  <button className="btn-ghost btn-sm" onClick={generateDemoPhotos}>
                    <Sparkles size={16} /> Mode Demo (4 Foto Contoh)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Composition Grid */}
          {showGrid && stream && (
            <div className="viewfinder-grid-lines">
              <div className="grid-line horizontal h1" />
              <div className="grid-line horizontal h2" />
              <div className="grid-line vertical v1" />
              <div className="grid-line vertical v2" />
            </div>
          )}

          {/* Active Filter Badge */}
          <div className="active-filter-badge">
            <span>{activeFilter.icon} {activeFilter.name}</span>
          </div>

          {/* Life4Cuts aspect guide frame */}
          <div className="aspect-ratio-guide" />
        </div>

        {/* Right Side / Floating Shot Tracker */}
        <div className="shot-strip-tracker glass-panel">
          <div className="tracker-header">
            <h4>Slot Foto</h4>
            <span className="tracker-count">{capturedPhotos.length} / {targetPhotoCount}</span>
          </div>

          <div className="tracker-slots">
            {Array.from({ length: targetPhotoCount }).map((_, idx) => {
              const photo = capturedPhotos[idx];
              return (
                <div key={idx} className={`tracker-slot ${photo ? 'filled' : ''}`}>
                  {photo ? (
                    <img src={photo} alt={`Foto ${idx + 1}`} className="tracker-thumb" />
                  ) : (
                    <div className="tracker-slot-empty">
                      <span>#{idx + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {capturedPhotos.length > 0 && (
            <div className="tracker-actions">
              <button className="btn-ghost btn-sm" onClick={onResetPhotos} title="Ulangi semua foto">
                <RotateCcw size={14} /> Ulang
              </button>
              {capturedPhotos.length >= targetPhotoCount && (
                <button className="btn-primary btn-sm pulse" onClick={onProceedToStudio}>
                  Edit Frame ➔
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="booth-bottom-bar glass-panel">
        {/* Filters Carousel */}
        <div className="filters-shelf">
          <span className="shelf-label">Filter:</span>
          <div className="filters-scroll">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`filter-chip ${activeFilter.id === f.id ? 'active' : ''}`}
                onClick={() => { playPopSound(); onSelectFilter(f); }}
              >
                <span className="filter-emoji">{f.icon}</span>
                <span className="filter-name">{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shutter Action Center */}
        <div className="shutter-action-center">
          <button
            className={`btn-main-shutter ${isCapturingSequence ? 'busy' : ''}`}
            onClick={startAutomatedSequence}
            disabled={isCapturingSequence || capturedPhotos.length >= targetPhotoCount}
            title={capturedPhotos.length >= targetPhotoCount ? 'Semua slot terisi' : 'Mulai Sesi Photobooth Otomatis'}
          >
            <div className="shutter-ring">
              <div className="shutter-core">
                <Camera size={34} />
              </div>
            </div>
          </button>
          
          <div className="shutter-label">
            {isCapturingSequence ? (
              <span className="shutter-status text-warning">📸 Mengambil foto...</span>
            ) : capturedPhotos.length >= targetPhotoCount ? (
              <span className="shutter-status text-success">✨ Lengkap! Siap edit frame</span>
            ) : (
              <span className="shutter-status">Ambil {targetPhotoCount - capturedPhotos.length} Foto Otomatis ({timerDuration}s)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
