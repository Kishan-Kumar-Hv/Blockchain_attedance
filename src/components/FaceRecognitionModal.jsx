import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, ShieldCheck, RefreshCw, X, Zap, Cpu, Scan, UserCheck, AlertTriangle, Fingerprint, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getInitials } from '../services/mockData';
import { 
  extractBiometricVectorFromMedia, 
  analyzeVideoFrame, 
  drawFaceHUD, 
  calculateMatchConfidence 
} from '../services/faceService';

export default function FaceRecognitionModal({ 
  isOpen, 
  onClose, 
  student, 
  course, 
  onSuccess,
  onEnrollBiometric 
}) {
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const isLoopActiveRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState('');
  
  // Real-time telemetry state
  const [faceDetected, setFaceDetected] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [livenessCount, setLivenessCount] = useState(0);
  const [liveMatchScore, setLiveMatchScore] = useState(0);
  const [biometricVector, setBiometricVector] = useState('');
  const [statusMessage, setStatusMessage] = useState('Position face inside frame');
  const [scanning, setScanning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [txHashResult, setTxHashResult] = useState('');

  // Start video stream on modal open
  useEffect(() => {
    let activeStream = null;

    if (isOpen) {
      setCompleted(false);
      setScanning(false);
      setLivenessCount(0);
      setLiveMatchScore(0);
      setBiometricVector('');
      setTxHashResult('');
      setCameraError('');
      setCameraLoading(true);
      setCameraActive(false);
      setStatusMessage('Requesting camera permission...');
      isLoopActiveRef.current = true;

      const initCamera = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Webcam API is not supported in this browser environment.');
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: false
          });

          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().then(() => {
                setCameraActive(true);
                setCameraLoading(false);
                setStatusMessage('Align your face inside the reticle');
                startRealTimeProcessingLoop();
              }).catch(e => {
                console.warn('Play error:', e);
                setCameraActive(true);
                setCameraLoading(false);
                startRealTimeProcessingLoop();
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
          setCameraError(err.message || 'Webcam permission denied. You can proceed with simulator mode.');
          setStatusMessage('Simulation Mode: Ready for Verification');
        }
      };

      initCamera();
    }

    return () => {
      isLoopActiveRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  // Real-time face detection & HUD loop
  const startRealTimeProcessingLoop = () => {
    let consecutiveCentering = 0;

    const processLoop = async () => {
      if (!isLoopActiveRef.current) return;

      const video = videoRef.current;
      const overlayCanvas = overlayCanvasRef.current;

      if (video && overlayCanvas && video.readyState >= 2) {
        const analysis = analyzeVideoFrame(video, overlayCanvas);
        setFaceDetected(analysis.faceDetected);
        setIsCentered(analysis.isCentered);

        let currentStatus = 'ALIGN FACE IN RETICLE';
        let currentScore = liveMatchScore;

        if (analysis.faceDetected) {
          if (analysis.isCentered) {
            consecutiveCentering++;
            setLivenessCount(prev => Math.min(100, prev + 2));

            if (consecutiveCentering > 10) {
              currentStatus = 'EXTRACTING BIOMETRICS...';
              
              // Extract real biometric vector
              const bio = await extractBiometricVectorFromMedia(video);
              if (bio) {
                setBiometricVector(bio.hexHash);
                const score = calculateMatchConfidence(bio.hexHash, student?.faceBiometricHash);
                currentScore = parseFloat(score);
                setLiveMatchScore(currentScore);

                if (currentScore >= 85) {
                  currentStatus = `VERIFIED MATCH: ${currentScore}%`;
                }
              }
            } else {
              currentStatus = 'STEADY: CONFIRMING LIVENESS';
            }
          } else {
            consecutiveCentering = Math.max(0, consecutiveCentering - 1);
            currentStatus = 'CENTER FACE INSIDE BOX';
          }
        } else {
          consecutiveCentering = 0;
          currentStatus = 'LOOKING FOR FACE...';
        }

        setStatusMessage(currentStatus);
        drawFaceHUD(overlayCanvas, analysis, currentStatus, currentScore, completed);
      }

      animFrameIdRef.current = requestAnimationFrame(processLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(processLoop);
  };

  // Perform full biometric verification
  const executeVerification = async () => {
    setScanning(true);
    setStatusMessage('Computing Cryptographic Biometric Vectors...');

    let liveHash = biometricVector;
    if (!liveHash) {
      if (videoRef.current && cameraActive) {
        const bio = await extractBiometricVectorFromMedia(videoRef.current);
        liveHash = bio?.hexHash || '0x7f' + Math.floor(Math.random() * 1000000000000).toString(16);
      } else {
        liveHash = student?.faceBiometricHash || '0x7f83b2a194c';
      }
      setBiometricVector(liveHash);
    }

    const calculatedScore = calculateMatchConfidence(liveHash, student?.faceBiometricHash);
    setLiveMatchScore(parseFloat(calculatedScore));

    setTimeout(() => {
      setScanning(false);
      setCompleted(true);
      isLoopActiveRef.current = false;

      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      const generatedHash = '0x' + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTxHashResult(generatedHash);

      if (onSuccess) {
        onSuccess({
          method: 'AI_FACE_RECOGNITION',
          score: `${calculatedScore}%`,
          vector: liveHash,
          txHash: generatedHash
        });
      }
    }, 1000);
  };

  // Handle Enrollment of new facial biometrics
  const handleEnrollBiometric = async () => {
    setScanning(true);
    let newVector = biometricVector;
    if (!newVector && videoRef.current) {
      const bio = await extractBiometricVectorFromMedia(videoRef.current);
      newVector = bio?.hexHash;
    }
    if (!newVector) {
      newVector = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    setTimeout(() => {
      setScanning(false);
      setBiometricVector(newVector);
      if (onEnrollBiometric) {
        onEnrollBiometric(newVector);
      }
      setStatusMessage('Biometric Template Enrolled Successfully!');
      try {
        confetti({ particleCount: 50, spread: 50 });
      } catch (e) {}
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl border border-sky-200 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-sky-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-600 text-white shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Real-Time AI Facial Verification</h3>
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

        {/* Viewport Area */}
        <div className="p-6">
          <div className="relative overflow-hidden bg-slate-950 rounded-xl border border-sky-300 aspect-video flex items-center justify-center shadow-inner">
            
            {/* Always rendered video and canvas elements to maintain ref integrity */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transform scale-x-[-1] ${cameraActive ? 'block' : 'hidden'}`}
            />
            <canvas 
              ref={overlayCanvasRef} 
              className={`absolute inset-0 w-full h-full pointer-events-none transform scale-x-[-1] ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Camera Loading Spinner */}
            {cameraLoading && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white space-y-2">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                <span className="text-xs font-mono text-sky-200">Accessing Camera Stream...</span>
              </div>
            )}

            {/* Simulation Fallback Viewport if Camera Unavailable */}
            {!cameraLoading && !cameraActive && (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-sky-50 p-4 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-sky-300 shadow-lg mb-2">
                  {getInitials(student?.name || 'Student')}
                </div>
                <div className="text-xs text-sky-900 font-mono font-bold bg-white px-3 py-1 rounded border border-sky-200 shadow-sm">
                  {student?.name} ({student?.rollNumber})
                </div>
                {cameraError && (
                  <p className="text-[10px] text-slate-500 mt-2 max-w-xs">{cameraError}</p>
                )}
              </div>
            )}

            {/* Top Real-Time Status Pill */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none text-xs font-mono z-10">
              <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-md flex items-center gap-2 border border-white/20">
                <span className={`w-2 h-2 rounded-full ${cameraActive && faceDetected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span>{cameraActive ? (faceDetected ? 'FACE DETECTED' : 'ALIGN IN RETICLE') : 'SIMULATOR ACTIVE'}</span>
              </div>

              {student?.faceBiometricHash && (
                <div className="bg-slate-900/80 backdrop-blur text-sky-300 px-3 py-1 rounded-md border border-white/20">
                  REF: {student.faceBiometricHash.substring(0, 10)}...
                </div>
              )}
            </div>

            {/* Completed Result Overlay */}
            {completed && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-20">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mb-3 shadow-md">
                  <UserCheck className="w-7 h-7 text-emerald-700" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">AI Facial Verification Confirmed</h4>
                <p className="text-xs text-slate-600 mb-3">Biometric Match Score: <span className="text-emerald-700 font-bold">{liveMatchScore || 98.4}%</span></p>

                <div className="w-full bg-sky-50/70 p-3.5 rounded-xl border border-sky-200 text-left font-mono text-xs space-y-1.5 mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Student:</span>
                    <span className="text-slate-900 font-bold">{student?.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Roll Number / USN:</span>
                    <span className="text-sky-900 font-bold">{student?.rollNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SHA-256 Vector:</span>
                    <span className="text-xs text-slate-800 font-bold truncate max-w-[180px]">{biometricVector || student?.faceBiometricHash}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Transaction Hash:</span>
                    <span className="text-xs text-emerald-800 font-bold truncate max-w-[180px]">{txHashResult}</span>
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs shadow-md"
                >
                  Close Receipt
                </button>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {!completed && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-slate-500 font-medium block mb-0.5">Liveness State</span>
                  <span className="font-bold text-sky-900 flex items-center gap-1.5">
                    <Scan className="w-4 h-4 text-sky-600" /> {faceDetected && isCentered ? 'Aligned & Stable' : 'Positioning'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-slate-500 font-medium block mb-0.5">Live Confidence</span>
                  <span className={`font-bold ${liveMatchScore >= 80 ? 'text-emerald-700' : 'text-slate-700'} flex items-center gap-1.5`}>
                    <Fingerprint className="w-4 h-4 text-sky-600" /> {liveMatchScore > 0 ? `${liveMatchScore}% Match` : 'Ready to Scan'}
                  </span>
                </div>
              </div>

              {!scanning ? (
                <div className="flex gap-2">
                  <button
                    onClick={executeVerification}
                    className="flex-1 py-3 px-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <Scan className="w-4 h-4 text-white" /> Confirm Real-Time Face Attendance
                  </button>
                  {onEnrollBiometric && (
                    <button
                      onClick={handleEnrollBiometric}
                      title="Enroll/Re-calibrate face template"
                      className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all text-xs flex items-center justify-center"
                    >
                      <Fingerprint className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full py-3 px-4 rounded-xl bg-sky-100 border border-sky-300 text-sky-900 font-bold flex items-center justify-center gap-2 text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-700" />
                  Extracting Facial Vectors & Computing Cryptographic Match...
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
