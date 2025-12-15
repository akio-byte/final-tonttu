"use client";

import React, { useState, useEffect } from 'react';
import { CameraCapture } from '@/components/CameraCapture';
import { Button } from '@/components/Button';

enum AppStep {
  INTRO = 'INTRO',
  NAME_INPUT = 'NAME_INPUT',
  CAMERA = 'CAMERA',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

const LOADING_MESSAGES = [
  "Teroitetaan korvia...",
  "Lähetetään Korvatunturille...",
  "Sirotellaan tähtipölyä...",
  "Säädetään tonttulakin kulmaa...",
  "Kiillotetaan napit..."
];

export default function Home() {
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  
  const [result, setResult] = useState<{
    tonttunimi: string;
    imageUrl: string;
    pdfBase64: string;
  } | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === AppStep.PROCESSING) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleProcessing = async (capturedPhoto: string) => {
    setPhoto(capturedPhoto);
    setStep(AppStep.PROCESSING);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, photoBase64: capturedPhoto }),
      });

      if (!res.ok) throw new Error("API call failed");

      const data = await res.json();
      setResult(data);
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error(err);
      setError("Joulutaika pätki yhteyttä. Yritä uudelleen!");
      setStep(AppStep.INTRO);
    }
  };

  const downloadPdf = () => {
    if (!result?.pdfBase64) return;
    const link = document.createElement("a");
    link.href = result.pdfBase64;
    link.download = `Tonttutodistus-${name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const restart = () => {
    setName("");
    setPhoto(null);
    setResult(null);
    setStep(AppStep.INTRO);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Background Particles */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
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

      {step === AppStep.INTRO && (
        <div className="max-w-2xl text-center space-y-8 animate-fade-in p-8 bg-nordic-dark/50 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="font-festive text-6xl md:text-7xl text-nordic-red drop-shadow-lg">TonttuTekijä</h1>
          <p className="text-xl text-nordic-snow/90">
            Tervetuloa! Syötä nimesi ja ota kuva selvittääksesi tonttuminäsi.
          </p>
          {error && <p className="text-red-400 bg-red-900/20 p-2 rounded">{error}</p>}
          <Button onClick={() => setStep(AppStep.NAME_INPUT)} className="text-xl px-12 py-4">
            Aloita
          </Button>
        </div>
      )}

      {step === AppStep.NAME_INPUT && (
        <form 
          onSubmit={(e) => { e.preventDefault(); if (name.trim()) setStep(AppStep.CAMERA); }}
          className="w-full max-w-lg space-y-8 animate-fade-in p-8 bg-nordic-dark/50 backdrop-blur-sm rounded-3xl"
        >
          <h2 className="text-3xl font-serif text-nordic-gold text-center">Mikä on nimesi?</h2>
          <input
            type="text"
            required
            maxLength={25}
            className="w-full bg-nordic-blue/50 border-2 border-nordic-snow/30 rounded-xl px-6 py-4 text-2xl text-center focus:outline-none focus:border-nordic-gold text-white"
            placeholder="Etunimesi"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex gap-4">
             <Button type="button" variant="outline" onClick={() => setStep(AppStep.INTRO)} fullWidth>Takaisin</Button>
             <Button type="submit" fullWidth disabled={!name.trim()}>Seuraava</Button>
          </div>
        </form>
      )}

      {step === AppStep.CAMERA && (
        <CameraCapture 
          onCapture={handleProcessing}
          onBack={() => setStep(AppStep.NAME_INPUT)}
        />
      )}

      {step === AppStep.PROCESSING && (
        <div className="text-center space-y-6 animate-pulse p-12 bg-nordic-dark/30 rounded-3xl backdrop-blur-sm">
          <div className="w-24 h-24 border-t-4 border-b-4 border-nordic-red rounded-full animate-spin mx-auto"></div>
          <h2 className="text-3xl font-serif text-nordic-gold">{LOADING_MESSAGES[loadingMsgIndex]}</h2>
        </div>
      )}

      {step === AppStep.RESULT && result && (
        <div className="flex flex-col items-center w-full max-w-4xl space-y-8 animate-fade-in">
          <h2 className="text-4xl font-festive text-nordic-red">Valmista tuli!</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-center bg-[#FFFAF0] p-8 rounded-lg shadow-2xl text-nordic-dark">
            <div className="relative w-64 h-64">
              <img 
                src={result.imageUrl} 
                alt="Tonttu" 
                className="w-full h-full object-cover rounded-full border-8 border-nordic-gold"
              />
              {/* UI Preview Badge (Visual only) */}
              <img 
                src="/assets/osaamismerkki.png" 
                alt="Badge" 
                className="absolute -bottom-4 -right-4 w-24 h-auto transform rotate-12 drop-shadow-lg"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>
            
            <div className="text-center md:text-left space-y-4">
              <p className="text-sm uppercase tracking-widest text-nordic-blue">Uusi nimesi on</p>
              <h3 className="text-5xl font-festive text-nordic-red">{result.tonttunimi}</h3>
              <p className="italic text-nordic-blue/80">Olet nyt virallinen joulupukin apulainen.</p>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap justify-center">
            <Button variant="secondary" onClick={restart}>Aloita alusta</Button>
            <Button variant="primary" onClick={downloadPdf}>Lataa virallinen todistus (PDF)</Button>
          </div>
        </div>
      )}
    </main>
  );
}