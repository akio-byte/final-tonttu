"use client";

import React, { useState, useEffect } from 'react';
import { AppStep, UserState } from './types';
import { generateElfName, generateElfPortrait } from './services/geminiService';
import { CameraCapture } from './components/CameraCapture';
import { Certificate } from './components/Certificate';
import { Button } from './components/Button';

// SVG Icons
const SnowflakeIcon = () => (
  <svg className="w-8 h-8 animate-spin-slow text-nordic-snow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m-9-9h18m-2.8-6.2L8.2 16.8M5.2 8.2l13.6 7.6" />
  </svg>
);

const LOADING_MESSAGES = [
  "Teroitetaan korvia...",
  "Lähetetään kuvaa Korvatunturille...",
  "Keitetään riisipuuroa...",
  "Kysytään Joulupukilta lupaa...",
  "Lisätään ripaus taikapölyä...",
  "Ommellaan tonttulakkia...",
  "Viilataan nimiehdotuksia..."
];

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  
  const [userData, setUserData] = useState<UserState>({
    originalName: '',
    originalPhotoBase64: null,
    elfName: null,
    elfPhotoBase64: null,
  });

  // Rotate loading messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    } else {
      setLoadingMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userData.originalName.trim().length > 0) {
      setStep(AppStep.CAMERA);
    }
  };

  const handlePhotoCapture = (photo: string) => {
    setUserData(prev => ({ ...prev, originalPhotoBase64: photo }));
    handleProcessing(userData.originalName, photo);
  };

  const handleProcessing = async (name: string, photo: string) => {
    setStep(AppStep.PROCESSING);
    setLoading(true);
    setError(null);

    try {
      // Parallel execution for speed
      const [generatedName, generatedPhoto] = await Promise.all([
        generateElfName(name),
        generateElfPortrait(photo)
      ]);

      setUserData(prev => ({
        ...prev,
        elfName: generatedName,
        elfPhotoBase64: generatedPhoto
      }));

      setStep(AppStep.RESULT);
    } catch (err) {
      console.error(err);
      setError("Jokin meni pieleen pajalla. Tontut ovat ymmällään. Yritä uudelleen.");
      setStep(AppStep.INTRO);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setUserData({
      originalName: '',
      originalPhotoBase64: null,
      elfName: null,
      elfPhotoBase64: null,
    });
    setStep(AppStep.INTRO);
    setError(null);
  };

  // Background component
  const Background = () => (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-gradient-to-b from-nordic-dark to-nordic-blue">
      {/* Stars/Snow */}
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white opacity-20 animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Background />
      
      {/* Intro Step */}
      {step === AppStep.INTRO && (
        <div className="max-w-2xl text-center space-y-8 animate-fade-in p-8 bg-nordic-dark/50 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="font-festive text-7xl text-nordic-red drop-shadow-lg">TonttuTekijä</h1>
          <h2 className="font-serif text-2xl text-nordic-gold tracking-wide">Tonttugeneraattori</h2>
          <p className="text-xl leading-relaxed text-nordic-snow/90">
            Tervetuloa maagiseen kioskiin! Syötä nimesi ja ota kuva selvittääksesi, miltä näyttäisit Korvatunturin tonttuna.
          </p>
          <Button onClick={() => setStep(AppStep.NAME_INPUT)} className="text-xl px-12 py-4">
            Aloita taika
          </Button>
          {error && <p className="text-red-400 mt-4 bg-red-900/50 p-2 rounded">{error}</p>}
        </div>
      )}

      {/* Name Input Step */}
      {step === AppStep.NAME_INPUT && (
        <form onSubmit={handleNameSubmit} className="w-full max-w-lg space-y-8 animate-fade-in p-8 bg-nordic-dark/50 backdrop-blur-sm rounded-3xl border border-white/10">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-serif text-nordic-gold">Mikä on nimesi?</h2>
            <p className="text-gray-300">Kirjoita etunimesi</p>
          </div>
          <input
            type="text"
            required
            maxLength={30}
            className="w-full bg-nordic-blue/50 border-2 border-nordic-snow/30 rounded-xl px-6 py-4 text-2xl text-center focus:outline-none focus:border-nordic-gold transition-colors placeholder-white/20"
            placeholder="esim. Matti"
            value={userData.originalName}
            onChange={(e) => setUserData(prev => ({ ...prev, originalName: e.target.value }))}
          />
          <div className="flex gap-4">
             <Button type="button" variant="outline" onClick={() => setStep(AppStep.INTRO)} fullWidth>Takaisin</Button>
             <Button type="submit" fullWidth disabled={!userData.originalName.trim()}>Seuraava</Button>
          </div>
        </form>
      )}

      {/* Camera Step */}
      {step === AppStep.CAMERA && (
        <CameraCapture 
          onCapture={handlePhotoCapture}
          onBack={() => setStep(AppStep.NAME_INPUT)}
        />
      )}

      {/* Processing Step */}
      {step === AppStep.PROCESSING && (
        <div className="text-center space-y-6 animate-pulse p-12 bg-nordic-dark/30 rounded-3xl backdrop-blur-sm">
          <div className="relative inline-block mb-4">
             <div className="w-32 h-32 border-t-4 border-b-4 border-nordic-red rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <SnowflakeIcon />
             </div>
          </div>
          <h2 className="text-3xl font-serif text-nordic-gold min-h-[80px] flex items-center justify-center transition-all duration-500">
            {LOADING_MESSAGES[loadingMsgIndex]}
          </h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">(Tämä vaatii hieman joulutaikaa ja saattaa kestää hetken)</p>
        </div>
      )}

      {/* Result Step */}
      {step === AppStep.RESULT && userData.elfName && userData.elfPhotoBase64 && (
        <Certificate 
          originalName={userData.originalName}
          elfName={userData.elfName}
          elfPhoto={userData.elfPhotoBase64}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default App;