import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';
import { Camera, SwitchCamera, Sparkles, CheckCircle2, AlertCircle, Wifi, RefreshCw, Volume2, Shield } from 'lucide-react';
import { playCountdownBeep, playShutterSound, playPopSound } from '../utils/soundEffects';

export function RemotePhoneView({ remoteRoomId }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Menghubungkan ke Photobooth PC...');
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);
  const [photosCount, setPhotosCount] = useState(0);

  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const connRef = useRef(null);
  const callRef = useRef(null);

  // Initialize Camera
  const startCamera = async (mode) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      return newStream;
    } catch (err) {
      console.error('Camera error on phone:', err);
      setStatusMessage('Gagal mengakses kamera HP: ' + err.message);
      return null;
    }
  };

  // Toggle Front / Back camera
  const toggleFacingMode = async () => {
    playPopSound();
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    const newStream = await startCamera(newMode);

    // If already in a call, replace tracks
    if (callRef.current && newStream) {
      const videoTrack = newStream.getVideoTracks()[0];
      const senders = callRef.current.peerConnection.getSenders();
      const sender = senders.find(s => s.track && s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(videoTrack);
      }
    }
  };

  // Setup PeerJS connection to PC booth
  useEffect(() => {
    let peer = null;

    async function init() {
      const cameraStream = await startCamera(facingMode);
      if (!cameraStream) return;

      setStatusMessage('Menghubungkan ke jaringan...');
      peer = new Peer();
      peerRef.current = peer;

      peer.on('open', (id) => {
        setStatusMessage('Menghubungkan ke PC Photobooth...');
        
        // Connect data channel
        const conn = peer.connect(remoteRoomId);
        connRef.current = conn;

        conn.on('open', () => {
          setIsConnected(true);
          setStatusMessage('Terhubung ke Photobooth PC! 📸');
          conn.send({
            type: 'DEVICE_HELLO',
            deviceName: navigator.userAgent.includes('iPhone') ? 'iPhone Camera' : 'Android Camera',
          });
        });

        conn.on('data', (data) => {
          if (data.type === 'COUNTDOWN') {
            setCountdown(data.count);
            playCountdownBeep(data.count === 1);
            if (navigator.vibrate) navigator.vibrate(50);
          } else if (data.type === 'CAPTURE') {
            setCountdown(null);
            setFlash(true);
            playShutterSound();
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setTimeout(() => setFlash(false), 300);
            setPhotosCount(prev => prev + 1);
          } else if (data.type === 'RESET') {
            setPhotosCount(0);
            setCountdown(null);
          }
        });

        conn.on('close', () => {
          setIsConnected(false);
          setStatusMessage('Koneksi terputus dengan PC');
        });

        // Call PC with video stream
        const call = peer.call(remoteRoomId, cameraStream);
        callRef.current = call;
      });

      peer.on('error', (err) => {
        console.error('Peer error on phone:', err);
        setStatusMessage('Gagal koneksi WebRTC: ' + err.message);
      });
    }

    init();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (peer) peer.destroy();
    };
  }, [remoteRoomId]);

  // Remote Shutter trigger
  const triggerRemoteShutter = () => {
    playPopSound();
    if (connRef.current && isConnected) {
      connRef.current.send({ type: 'TRIGGER_SHUTTER' });
    }
  };

  const triggerRemoteCountdown = (seconds = 3) => {
    playPopSound();
    if (connRef.current && isConnected) {
      connRef.current.send({ type: 'START_TIMER', seconds });
    }
  };

  return (
    <div className="remote-phone-container">
      {flash && <div className="flash-overlay active" />}

      {/* Header bar */}
      <div className="phone-header">
        <div className="phone-brand">
          <Sparkles size={18} className="text-highlight" />
          <span>SnapLumina Companion</span>
        </div>
        <div className={`connection-pill ${isConnected ? 'connected' : 'disconnected'}`}>
          <Wifi size={14} />
          <span>{isConnected ? 'Terhubung' : 'Offline'}</span>
        </div>
      </div>

      {/* Main Video Viewfinder */}
      <div className="phone-viewfinder">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`phone-video ${facingMode === 'user' ? 'mirrored' : ''}`}
        />

        {countdown !== null && (
          <div className="countdown-display-phone">
            <span className="countdown-number-phone">{countdown}</span>
          </div>
        )}

        <div className="viewfinder-grid-lines">
          <div className="grid-line horizontal h1" />
          <div className="grid-line horizontal h2" />
          <div className="grid-line vertical v1" />
          <div className="grid-line vertical v2" />
        </div>

        <div className="phone-stream-badge">
          <span>● LIVE STREAMING KE PC</span>
        </div>
      </div>

      {/* Control panel */}
      <div className="phone-controls">
        <div className="phone-status-text">
          <p>{statusMessage}</p>
          {photosCount > 0 && (
            <span className="badge-photos-taken">{photosCount} Foto Terambil</span>
          )}
        </div>

        <div className="phone-shutter-bar">
          <button 
            className="btn-circle-secondary" 
            onClick={toggleFacingMode}
            title="Balik Kamera Depan / Belakang"
          >
            <SwitchCamera size={24} />
            <span className="btn-label">{facingMode === 'environment' ? 'Belakang' : 'Depan'}</span>
          </button>

          <button
            className={`btn-shutter-phone ${!isConnected ? 'disabled' : ''}`}
            onClick={triggerRemoteShutter}
            disabled={!isConnected}
            title="Jepret Foto Sekarang"
          >
            <div className="shutter-inner-phone">
              <Camera size={28} />
            </div>
          </button>

          <button 
            className="btn-circle-secondary" 
            onClick={() => triggerRemoteCountdown(3)}
            disabled={!isConnected}
            title="Timer 3 Detik"
          >
            <span className="timer-text">3s</span>
            <span className="btn-label">Timer</span>
          </button>
        </div>

        <div className="phone-footer-hint">
          <p>Arahkan kamera ke kamu & teman-teman. Tampilan ini langsung muncul di layar photobooth laptop/PC!</p>
        </div>
      </div>
    </div>
  );
}
