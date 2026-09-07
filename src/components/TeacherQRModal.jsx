import React, { useState, useEffect, useRef } from 'react';
import { QrCode, RefreshCw, X, ShieldCheck, Clock, Users, Database, MapPin, Radio, Copy, Check, Download } from 'lucide-react';
import QRCode from 'qrcode';

export default function TeacherQRModal({ isOpen, onClose, course, checkedInCount = 0, onCommitSession }) {
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);
  const FIVE_MINUTES_SECONDS = 300;
  const [timeLeft, setTimeLeft] = useState(FIVE_MINUTES_SECONDS);
  const [geoCoordinates] = useState({ lat: 13.0067, lng: 76.1022, radius: 50, locationName: 'Lab 402 - ISE Dept' });
  const qrCanvasRef = useRef(null);

  const generateNewToken = () => {
    const newToken = `${course?.code || 'CS101'}-5MIN-${Math.floor(1000 + Math.random() * 9000)}`;
    setToken(newToken);
    setTimeLeft(FIVE_MINUTES_SECONDS);
  };

  useEffect(() => {
    let timer = null;
    if (isOpen) {
      generateNewToken();

      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            generateNewToken();
            return FIVE_MINUTES_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  // Generate real scannable QR code whenever token updates
  useEffect(() => {
    if (token && qrCanvasRef.current) {
      const qrPayload = JSON.stringify({
        protocol: 'BLOCKATTEND-V1',
        courseId: course?.id || 'CS101',
        courseCode: course?.code || 'CS101',
        courseName: course?.name || 'Class Session',
        qrToken: token,
        timestamp: Date.now(),
        expiresAt: Date.now() + timeLeft * 1000,
        geo: geoCoordinates
      });

      QRCode.toCanvas(qrCanvasRef.current, qrPayload, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0369a1',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      }).catch(err => {
        console.error('QR rendering error:', err);
      });
    }
  }, [token, course, geoCoordinates]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${course?.code || 'COURSE'}-QR-${token}.png`;
    link.href = qrCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl border border-sky-200 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-sky-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-600 text-white shadow-sm">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Classroom Dynamic Real-Time QR Stream</h3>
              <p className="text-xs text-slate-600">Course: <span className="text-sky-900 font-bold">{course?.name}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 rounded hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-5">
          
          {/* Geofence & Timer Badge */}
          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-xs font-mono flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600 animate-pulse" />
              <div>
                <span className="text-slate-900 font-bold block">Classroom GPS Perimeter</span>
                <span className="text-[11px] text-slate-600">{geoCoordinates.lat}° N, {geoCoordinates.lng}° E • {geoCoordinates.locationName}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-sky-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm">
              <Radio className="w-3 h-3 text-white" /> Max 50m Radius
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Project this screen. Students can scan this real-time QR code using their camera to verify presence.
          </p>

          {/* Genuine QR Code Canvas Container */}
          <div className="relative inline-block p-4 rounded-2xl bg-white border-2 border-sky-200 shadow-lg">
            <canvas ref={qrCanvasRef} className="rounded-lg mx-auto" />

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded bg-sky-700 text-white font-mono text-xs font-bold tracking-wider shadow-sm">
                {token}
              </span>
              <button
                onClick={handleCopyToken}
                title="Copy Token"
                className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDownloadQR}
                title="Download QR Image"
                className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={generateNewToken}
                title="Refresh QR Now"
                className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5-Minute Countdown Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" /> 5-Minute Auto-Regeneration
              </span>
              <span className="text-sky-900 font-bold font-mono text-sm">{formatTime(timeLeft)} remaining</span>
            </div>
            <div className="w-full h-2 bg-sky-100 rounded-full overflow-hidden border border-sky-200">
              <div 
                className="h-full bg-sky-600 transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / FIVE_MINUTES_SECONDS) * 100}%` }}
              />
            </div>
          </div>

          {/* Stat & Mine Button */}
          <div className="pt-2 grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-600 text-white">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Scanned Students</span>
                <span className="text-base font-bold text-slate-900">{checkedInCount} Verified</span>
              </div>
            </div>

            <button
              onClick={onCommitSession}
              className="p-3 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all shadow-md flex items-center justify-center gap-2 text-xs"
            >
              <Database className="w-4 h-4 text-white" /> Mine Session Block
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
