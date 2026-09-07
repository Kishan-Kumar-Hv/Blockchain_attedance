import React, { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle2, ShieldAlert, X, Sparkles, KeyRound, ArrowRight, MapPin, Radio, AlertTriangle, Camera, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';

export default function QRScannerModal({ isOpen, onClose, student, course, initialToken = '', onSuccess }) {
  const [manualToken, setManualToken] = useState(initialToken || '');
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verified, setVerified] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [txReceipt, setTxReceipt] = useState(null);
  const [studentDistance, setStudentDistance] = useState(14);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [detectedQRText, setDetectedQRText] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const isScanningRef = useRef(false);

  // Initialize camera and scanning loop
  useEffect(() => {
    let activeStream = null;

    if (isOpen) {
      setManualToken(initialToken || '');
      setScanning(false);
      setErrorMsg('');
      setVerified(false);
      setRejected(false);
      setTxReceipt(null);
      setStudentDistance(14);
      setDetectedQRText('');
      setCameraError('');
      setCameraLoading(true);
      setCameraActive(false);
      isScanningRef.current = true;

      const initCamera = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera API not supported in this browser.');
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
          });

          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().then(() => {
                setCameraActive(true);
                setCameraLoading(false);
                startContinuousQRScan();
              }).catch(e => {
                console.warn('Play error:', e);
                setCameraActive(true);
                setCameraLoading(false);
                startContinuousQRScan();
              });
            };
          } else {
            setCameraActive(true);
            setCameraLoading(false);
          }
        } catch (err) {
          console.warn('Camera access denied or failed:', err);
          setCameraActive(false);
          setCameraLoading(false);
          setCameraError(err.message || 'Camera access unavailable. You can use manual code input or click the scan area to simulate.');
        }
      };

      initCamera();
      // NOTE: DO NOT auto-execute attendance check on open. The student must scan with camera or click verify.
    }

    return () => {
      isScanningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  // Real-time camera QR scanning frame loop
  const startContinuousQRScan = () => {
    const scanFrame = () => {
      if (!isScanningRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data && isScanningRef.current) {
          // Draw bounding box around detected QR code in real-time
          drawQRBoundingBox(ctx, code.location);
          
          let parsedToken = code.data;
          try {
            const parsedObj = JSON.parse(code.data);
            if (parsedObj.qrToken) {
              parsedToken = parsedObj.qrToken;
            }
          } catch (e) {}

          setDetectedQRText(parsedToken);
          setManualToken(parsedToken);
          isScanningRef.current = false;
          executeAttendanceCheck(parsedToken);
          return;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  const drawQRBoundingBox = (ctx, location) => {
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    ctx.closePath();
    ctx.stroke();
  };

  const handleSimulatedScan = () => {
    const tokenToUse = manualToken.trim() || 'QR-DYNAMIC-GEO-' + Math.floor(1000 + Math.random() * 9000);
    executeAttendanceCheck(tokenToUse);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setErrorMsg('Please enter a valid session QR token code.');
      return;
    }
    executeAttendanceCheck(manualToken.toUpperCase());
  };

  const executeAttendanceCheck = (token) => {
    setScanning(true);
    setErrorMsg('');

    setTimeout(() => {
      setScanning(false);

      const isWithin50m = studentDistance <= 50;
      const receipt = {
        method: 'DYNAMIC_QR_GEOFENCE',
        token,
        distanceMeters: studentDistance,
        isWithinRadius: isWithin50m,
        timestamp: new Date().toLocaleTimeString(),
        txHash: '0x' + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };

      setTxReceipt(receipt);

      if (isWithin50m) {
        setVerified(true);
        setRejected(false);
        try {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}

        if (onSuccess) {
          onSuccess({
            ...receipt,
            status: 'PRESENT',
            score: `100% (GPS ${studentDistance}m)`
          });
        }
      } else {
        setVerified(false);
        setRejected(true);
        if (onSuccess) {
          onSuccess({
            ...receipt,
            status: 'ABSENT (OUTSIDE 50M GEOFENCE)',
            score: `FAILED (GPS ${studentDistance}m)`
          });
        }
      }
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl border border-sky-200 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-sky-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-600 text-white">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Real-Time Dynamic QR + Geofence Scanner</h3>
              <p className="text-xs text-slate-600">Course: <span className="text-sky-900 font-bold">{course?.name || 'Class Session'}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 rounded hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!verified && !rejected ? (
            <div className="space-y-4">
              
              {/* GPS Distance Range Simulator */}
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-600" /> Student GPS Radius Check
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    studentDistance <= 50 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {studentDistance} meters
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0m (Inside Class)</span>
                    <span className="text-slate-900 font-bold">50m Allowed Radius</span>
                    <span>150m (Outside)</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="5"
                    value={studentDistance}
                    onChange={(e) => setStudentDistance(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                <div className="text-[11px] font-mono flex items-center justify-between">
                  <span className="text-slate-600">Target: Lab 402 ISE</span>
                  <span className={studentDistance <= 50 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {studentDistance <= 50 ? '✓ Within 50m Allowed Zone' : '❌ Proxy Alert: Exceeds 50m'}
                  </span>
                </div>
              </div>

              {/* Real-Time Camera Viewfinder with jsQR Overlay */}
              <div className="relative overflow-hidden bg-slate-950 rounded-xl border border-sky-300 aspect-square flex items-center justify-center">
                
                {/* Always rendered video and canvas elements */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                <canvas 
                  ref={canvasRef} 
                  className={`absolute inset-0 w-full h-full pointer-events-none ${cameraActive ? 'block' : 'hidden'}`} 
                />

                {/* Loading camera state */}
                {cameraLoading && (
                  <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white space-y-2">
                    <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                    <span className="text-xs font-mono text-sky-200">Starting Camera Stream...</span>
                  </div>
                )}

                {/* Simulation Mode fallback if camera unavailable */}
                {!cameraLoading && !cameraActive && (
                  <div 
                    onClick={handleSimulatedScan}
                    className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-900 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-sky-600/20 border border-sky-400 flex items-center justify-center text-sky-400 mb-3">
                      <Camera className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-white mb-1">Tap to Simulate Real-Time Scan</span>
                    <p className="text-[11px] text-slate-400 max-w-xs">{cameraError || 'Point camera towards teacher projection screen'}</p>
                  </div>
                )}

                {/* Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-48 h-48 border-2 border-sky-400/60 rounded-2xl flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-sky-400 rounded-tl" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-sky-400 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-sky-400 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-sky-400 rounded-br" />

                    {/* Animated Scanning Laser Line */}
                    <div className="w-full h-1 bg-sky-400 shadow-[0_0_15px_#38bdf8] animate-scan-line" />
                  </div>
                </div>

                {/* Real-time scan indicator badge */}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-mono text-white flex items-center gap-1.5 border border-white/20 z-10">
                  <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span>{cameraActive ? 'CAMERA SCANNING LIVE' : 'SIMULATION MODE'}</span>
                </div>

                {detectedQRText && (
                  <div className="absolute bottom-3 inset-x-3 bg-emerald-600 text-white p-2 rounded-lg text-center font-mono text-xs font-bold shadow-lg animate-bounce z-10">
                    QR Captured: {detectedQRText}
                  </div>
                )}
              </div>

              {/* Manual Passcode input */}
              <form onSubmit={handleManualSubmit} className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="e.g. CS101-5MIN-8842"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sky-200 bg-white text-xs font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" /> {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={scanning}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {scanning ? 'Verifying Session & Geofence...' : 'Verify Session Code & Location'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>

            </div>
          ) : verified ? (
            /* SUCCESS GEOFENCE VERIFIED */
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Attendance Marked: PRESENT</h4>
              <p className="text-xs text-slate-600 font-medium">Student location verified within 50m classroom boundary.</p>

              <div className="w-full bg-sky-50/70 p-4 rounded-xl border border-sky-200 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Student Name:</span>
                  <span className="text-slate-900 font-bold">{student?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GPS Radius Distance:</span>
                  <span className="text-emerald-700 font-bold">{txReceipt?.distanceMeters} meters (Within 50m Zone)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Dynamic QR Token:</span>
                  <span className="text-slate-900 font-bold">{txReceipt?.token}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Transaction Hash:</span>
                  <span className="text-sky-900 font-bold truncate max-w-[170px]">{txReceipt?.txHash}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors text-xs shadow-md"
              >
                Close Receipt
              </button>
            </div>
          ) : (
            /* REJECTED GEOFENCE BOUNDARY */
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center mx-auto shadow-md">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <h4 className="text-lg font-bold text-rose-800">Proxy Attendance Blocked!</h4>
              <p className="text-xs text-slate-600 font-medium">Your GPS distance exceeds the maximum 50m classroom perimeter.</p>

              <div className="w-full bg-rose-50 p-4 rounded-xl border border-rose-200 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Student Name:</span>
                  <span className="text-slate-900 font-bold">{student?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Detected Distance:</span>
                  <span className="text-rose-700 font-bold">{txReceipt?.distanceMeters} meters away</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Maximum Allowed:</span>
                  <span className="text-slate-900 font-bold">50 meters</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Audit Result:</span>
                  <span className="text-rose-800 font-bold">REJECTED (GEOFENCE MISMATCH)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setRejected(false);
                  setStudentDistance(14);
                  isScanningRef.current = true;
                  startContinuousQRScan();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-colors text-xs shadow-md"
              >
                Retry Scan Within 50m Classroom Boundary
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
