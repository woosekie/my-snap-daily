import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';
import { Camera, Sparkles, Smartphone, Settings, Heart, HelpCircle, Layers, Image as ImageIcon } from 'lucide-react';
import { CameraView } from './components/CameraView';
import { DeviceSelectorModal } from './components/DeviceSelectorModal';
import { RemoteCameraModal } from './components/RemoteCameraModal';
import { RemotePhoneView } from './components/RemotePhoneView';
import { CustomizationStudio } from './components/CustomizationStudio';
import { FILTERS } from './utils/filters';
import { playPopSound } from './utils/soundEffects';

export default function App() {
  // Check if opened as mobile remote companion
  const [remoteRoomId, setRemoteRoomId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const remote = params.get('remote');
    if (remote) {
      setRemoteRoomId(remote);
    }
  }, []);

  // If opened via QR code on smartphone, render the remote companion view
  if (remoteRoomId) {
    return <RemotePhoneView remoteRoomId={remoteRoomId} />;
  }

  // --- PC / Laptop Photobooth State ---
  const [appStage, setAppStage] = useState('camera'); // 'camera' | 'studio'
  const [stream, setStream] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isCapturingSequence, setIsCapturingSequence] = useState(false);

  // Modals
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);

  // WebRTC PeerJS for Smartphone Companion
  const [peerRoomId, setPeerRoomId] = useState('');
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);
  const [remoteDeviceName, setRemoteDeviceName] = useState('');
  const peerRef = useRef(null);
  const remoteConnRef = useRef(null);
  const remoteCallRef = useRef(null);

  // Target photos count for Life4Cuts (default 4)
  const targetPhotoCount = 4;

  // Initialize unique room ID & PeerJS on PC
  useEffect(() => {
    const id = 'pb_' + Math.random().toString(36).substring(2, 8);
    setPeerRoomId(id);

    let peerInstance = null;
    try {
      peerInstance = new Peer(id);
      peerRef.current = peerInstance;

      peerInstance.on('open', (assignedId) => {
        console.log('Photobooth Peer ready on room:', assignedId);
      });

      // Handle incoming data channel connection from smartphone
      peerInstance.on('connection', (conn) => {
        remoteConnRef.current = conn;

        conn.on('open', () => {
          setIsRemoteConnected(true);
        });

        conn.on('data', (data) => {
          if (data.type === 'DEVICE_HELLO') {
            setRemoteDeviceName(data.deviceName || 'Smartphone');
          } else if (data.type === 'TRIGGER_SHUTTER') {
            // Trigger capture
            const snapBtn = document.querySelector('.btn-main-shutter');
            if (snapBtn && !snapBtn.disabled) {
              snapBtn.click();
            }
          } else if (data.type === 'START_TIMER') {
            const snapBtn = document.querySelector('.btn-main-shutter');
            if (snapBtn && !snapBtn.disabled) {
              snapBtn.click();
            }
          }
        });

        conn.on('close', () => {
          setIsRemoteConnected(false);
          setRemoteDeviceName('');
        });
      });

      // Handle incoming video stream call from smartphone
      peerInstance.on('call', (call) => {
        remoteCallRef.current = call;
        call.answer(); // Answer without sending local stream back

        call.on('stream', (remoteStream) => {
          setStream(remoteStream);
          setIsRemoteConnected(true);
        });

        call.on('close', () => {
          setIsRemoteConnected(false);
        });
      });

      peerInstance.on('error', (err) => {
        console.warn('Peer error on PC:', err);
      });
    } catch (e) {
      console.warn('PeerJS init failed:', e);
    }

    return () => {
      if (peerInstance) peerInstance.destroy();
    };
  }, []);

  // Initialize Local Camera (Internal, USB webcam, or Virtual Camera)
  const initLocalCamera = async (deviceId = null) => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      return newStream;
    } catch (err) {
      console.warn('Local camera not available or permission denied:', err);
      return null;
    }
  };

  useEffect(() => {
    // Only attempt local camera if remote camera is not already connected
    if (!isRemoteConnected) {
      initLocalCamera(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  // Handle switching camera device
  const handleSelectDevice = (deviceId) => {
    setSelectedDeviceId(deviceId);
    initLocalCamera(deviceId);
  };

  // Disconnect remote phone stream
  const handleDisconnectRemote = () => {
    if (remoteCallRef.current) remoteCallRef.current.close();
    if (remoteConnRef.current) remoteConnRef.current.close();
    setIsRemoteConnected(false);
    setRemoteDeviceName('');
    initLocalCamera(selectedDeviceId);
  };

  // Broadcast events to phone companion if connected
  const notifyRemote = (type, payload = {}) => {
    if (remoteConnRef.current && remoteConnRef.current.open) {
      remoteConnRef.current.send({ type, ...payload });
    }
  };

  const handlePhotoCaptured = (photoDataUrl) => {
    setCapturedPhotos(prev => {
      const updated = [...prev, photoDataUrl];
      notifyRemote('CAPTURE', { totalTaken: updated.length });
      return updated;
    });
  };

  const handleSequenceComplete = () => {
    setTimeout(() => {
      setAppStage('studio');
    }, 600);
  };

  const handleResetPhotos = () => {
    playPopSound();
    setCapturedPhotos([]);
    notifyRemote('RESET');
  };

  const handleRetakeAll = () => {
    playPopSound();
    setCapturedPhotos([]);
    setAppStage('camera');
    notifyRemote('RESET');
  };

  return (
    <div className="photobooth-app-root">
      {/* Top Global Navigation */}
      <header className="global-header">
        <div className="logo-group">
          <div className="logo-icon-box">
            <Sparkles size={22} className="logo-sparkle" />
          </div>
          <div>
            <h1 className="logo-title">SnapLumina</h1>
            <span className="logo-tagline">Korean Life4Cuts Photobooth</span>
          </div>
        </div>

        <div className="header-center-nav">
          <div className="stage-steps-pill">
            <div className={`step-item ${appStage === 'camera' ? 'active' : 'completed'}`}>
              <span className="step-num">1</span>
              <span>Ambil Foto</span>
            </div>
            <div className="step-arrow">➔</div>
            <div className={`step-item ${appStage === 'studio' ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span>Kustomisasi Frame</span>
            </div>
          </div>
        </div>

        <div className="header-right-tools">
          {/* Quick Wireless Phone Camera Trigger */}
          <button 
            className={`btn-header-remote ${isRemoteConnected ? 'connected' : ''}`}
            onClick={() => { playPopSound(); setIsRemoteModalOpen(true); }}
            title="Hubungkan HP sebagai Kamera Wireless"
          >
            <Smartphone size={16} />
            <span>{isRemoteConnected ? 'HP Terhubung' : 'Kamera HP (Wireless)'}</span>
            {isRemoteConnected && <span className="status-dot-active" />}
          </button>

          {/* Device settings */}
          <button 
            className="icon-btn-header"
            onClick={() => { playPopSound(); setIsDeviceModalOpen(true); }}
            title="Pengaturan Kamera / USB"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content-stage">
        {appStage === 'camera' ? (
          <CameraView
            stream={stream}
            isRemoteConnected={isRemoteConnected}
            remoteDeviceName={remoteDeviceName}
            onOpenDeviceModal={() => setIsDeviceModalOpen(true)}
            onOpenRemoteModal={() => setIsRemoteModalOpen(true)}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            targetPhotoCount={targetPhotoCount}
            capturedPhotos={capturedPhotos}
            onPhotoCaptured={handlePhotoCaptured}
            onSequenceComplete={handleSequenceComplete}
            isCapturingSequence={isCapturingSequence}
            setIsCapturingSequence={setIsCapturingSequence}
            onResetPhotos={handleResetPhotos}
            onProceedToStudio={() => setAppStage('studio')}
            onUploadPhoto={handlePhotoCaptured}
          />
        ) : (
          <CustomizationStudio
            photos={capturedPhotos}
            onRetakeAll={handleRetakeAll}
          />
        )}
      </main>

      {/* Device Selector Modal */}
      <DeviceSelectorModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={handleSelectDevice}
        onOpenRemoteModal={() => {
          setIsDeviceModalOpen(false);
          setIsRemoteModalOpen(true);
        }}
      />

      {/* Remote Smartphone Camera Modal */}
      <RemoteCameraModal
        isOpen={isRemoteModalOpen}
        onClose={() => setIsRemoteModalOpen(false)}
        roomId={peerRoomId}
        isRemoteConnected={isRemoteConnected}
        remoteDeviceName={remoteDeviceName}
        onDisconnectRemote={handleDisconnectRemote}
      />
    </div>
  );
}
