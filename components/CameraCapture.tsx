import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from './Button';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onBack: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Kameraa ei voitu avata. Tarkista käyttöoikeudet.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Initial mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Calculate square crop
      const size = Math.min(video.videoWidth, video.videoHeight);
      const xOffset = (video.videoWidth - size) / 2;
      const yOffset = (video.videoHeight - size) / 2;

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror horizontally for self-view natural feel
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
        
        ctx.drawImage(
          video,
          xOffset, yOffset, size, size, // Source
          0, 0, size, size              // Dest
        );
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setImage(null);
    startCamera();
  };

  const confirm = () => {
    if (image) {
      onCapture(image);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-3xl font-serif text-nordic-gold mb-2 text-center">Ota kuva</h2>
      <p className="text-center text-gray-300 mb-4">Aseta kasvosi keskelle ja hymyile!</p>

      {error ? (
        <div className="bg-red-900/50 p-6 rounded-lg border border-red-500 text-center">
          <p className="mb-4">{error}</p>
          <Button onClick={startCamera}>Yritä uudelleen</Button>
        </div>
      ) : (
        <div className="relative w-full aspect-square max-w-[500px] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-nordic-gold/30">
          {!image ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <img src={image} alt="Captured" className="w-full h-full object-cover" />
          )}
          
          {/* Overlay Guide for face positioning */}
          {!image && (
             <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full m-12 pointer-events-none"></div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-4 mt-8">
        {!image ? (
          <>
            <Button variant="outline" onClick={onBack}>Takaisin</Button>
            <Button onClick={takePhoto}>Ota kuva</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={retake}>Ota uusi</Button>
            <Button variant="primary" onClick={confirm}>Muuta minut tontuksi!</Button>
          </>
        )}
      </div>
    </div>
  );
};