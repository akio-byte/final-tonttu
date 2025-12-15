"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button } from './Button';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onBack: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let mounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });
        
        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        currentStream = mediaStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Ensure video plays
          videoRef.current.onloadedmetadata = () => {
             if (mounted && videoRef.current) {
               videoRef.current.play().catch(e => console.log("Auto-play prevented:", e));
             }
          };
        }
        setError('');
      } catch (err) {
        console.error("Camera Error:", err);
        if (mounted) {
          setError("Kameraa ei voitu avata. Tarkista että annoit käyttöoikeuden ja käytät HTTPS-yhteyttä.");
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Video dimensions not ready");
        return;
      }

      const size = Math.min(video.videoWidth, video.videoHeight);
      const xOffset = (video.videoWidth - size) / 2;
      const yOffset = (video.videoHeight - size) / 2;

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the context to match the mirrored video preview
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
        
        ctx.drawImage(video, xOffset, yOffset, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImage(dataUrl);
        // We don't stop the stream here so retake is instant
      }
    }
  };

  const retake = () => {
    setImage(null);
    if (videoRef.current && videoRef.current.srcObject) {
       videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-3xl font-serif text-nordic-gold mb-2 text-center">Ota kuva</h2>
      {error ? (
        <div className="bg-red-900/50 p-6 rounded-lg border border-red-500 text-center text-white">
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Yritä uudelleen</Button>
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
            <Button variant="primary" onClick={() => image && onCapture(image)}>Jatka</Button>
          </>
        )}
      </div>
    </div>
  );
};