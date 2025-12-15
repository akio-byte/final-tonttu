import React, { useState } from 'react';
import { Button } from './Button';
import { EduroBadge } from './EduroBadge';
import { generateCertificatePDF } from '../services/pdfGenerator';

interface CertificateProps {
  originalName: string;
  elfName: string;
  elfPhoto: string;
  onRestart: () => void;
}

// Holly Leaf Decoration Component
const HollyCorner = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`w-16 h-16 absolute z-20 ${className}`}>
    <path d="M50 50 Q30 20 50 10 Q70 20 50 50" fill="#2e7d32" />
    <path d="M50 50 Q20 70 10 50 Q20 30 50 50" fill="#2e7d32" />
    <path d="M50 50 Q70 80 50 90 Q30 80 50 50" fill="#2e7d32" />
    <path d="M50 50 Q80 30 90 50 Q80 70 50 50" fill="#2e7d32" />
    <circle cx="50" cy="50" r="5" fill="#c0392b" />
    <circle cx="42" cy="45" r="4" fill="#c0392b" />
    <circle cx="58" cy="45" r="4" fill="#c0392b" />
  </svg>
);

export const Certificate: React.FC<CertificateProps> = ({ originalName, elfName, elfPhoto, onRestart }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const pdfBlob = await generateCertificatePDF(originalName, elfName, elfPhoto);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Tonttutodistus-${originalName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Virhe todistuksen luonnissa. Yritä uudelleen.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full animate-fade-in">
      
      {/* Screen Controls */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
        <h2 className="text-2xl font-serif text-nordic-snow drop-shadow-md">Tonttuhenkilöllisyytesi</h2>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onRestart}>Aloita alusta</Button>
          <Button 
            variant="primary" 
            onClick={handleDownloadPDF} 
            disabled={isGenerating}
            className="shadow-xl"
          >
            {isGenerating ? "Luodaan..." : "Lataa PDF"}
          </Button>
        </div>
      </div>

      {/* Screen Preview */}
      <div className="bg-[#fdfbf7] text-nordic-dark w-full max-w-[420px] aspect-[210/297] shadow-2xl relative overflow-hidden flex flex-col items-center p-0 rounded-lg transform scale-95 origin-top border-4 border-white/50">
        
        {/* Background Pattern (Subtle Snowflakes) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(#2c4c5a 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        {/* Decorative Borders */}
        <div className="absolute inset-3 border-4 border-nordic-red pointer-events-none z-20 rounded-sm"></div>
        <div className="absolute inset-5 border border-nordic-gold pointer-events-none z-20 rounded-sm border-dashed"></div>
        
        {/* Corner Decorations */}
        <HollyCorner className="top-1 left-1 transform -rotate-45" />
        <HollyCorner className="top-1 right-1 transform rotate-45" />
        <HollyCorner className="bottom-1 left-1 transform -rotate-135" />
        <HollyCorner className="bottom-1 right-1 transform rotate-135" />

        {/* Header */}
        <header className="mt-14 text-center z-30 w-full relative">
          <h1 className="font-serif font-bold text-lg tracking-[0.2em] text-nordic-dark/60 uppercase mb-1">Virallinen</h1>
          <h2 className="font-festive text-5xl text-nordic-red leading-none drop-shadow-sm">Tonttutodistus</h2>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-start w-full z-30 pt-6 gap-6">
          
          {/* Photo Section with Badge */}
          <div className="relative">
            <div className="w-56 h-56 rounded-full border-[6px] border-nordic-gold overflow-hidden relative z-10 bg-nordic-dark shadow-inner ring-4 ring-nordic-red/20">
                <img src={elfPhoto} alt="Tonttukuva" className="w-full h-full object-cover" />
            </div>
            {/* Joulun Osaaja Badge - Prominent Placement */}
            <div className="absolute -bottom-6 -right-8 z-40 w-32 h-36 transform rotate-12 drop-shadow-xl filter saturate-110">
              <EduroBadge />
            </div>
          </div>
         
          {/* Text Content */}
          <div className="text-center space-y-4 max-w-[85%] px-4">
            <div className="space-y-1">
              <p className="font-serif italic text-base text-nordic-blue/80">Täten todistamme, että</p>
              <h2 className="font-sans font-bold text-2xl text-nordic-dark uppercase tracking-wider border-b-2 border-nordic-gold/50 pb-1">{originalName}</h2>
            </div>
            
            <div className="space-y-1">
              <p className="font-serif italic text-base text-nordic-blue/80">tunnetaan Korvatunturilla nimellä</p>
              <h2 className="font-festive text-5xl text-nordic-red leading-tight py-2 drop-shadow-sm">{elfName}</h2>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mb-14 w-full flex justify-between items-end z-30 px-10 relative">
            <div className="text-center flex flex-col items-center group">
                <span className="font-festive text-2xl text-nordic-dark transform -rotate-6 opacity-80 group-hover:opacity-100 transition-opacity">Joulupukki</span>
                <div className="w-24 border-b-2 border-nordic-blue/30 my-1"></div>
                <p className="font-serif text-[9px] text-nordic-blue uppercase font-bold tracking-widest">Allekirjoitus</p>
            </div>
            <div className="text-center flex flex-col items-center group">
                 <span className="font-festive text-2xl text-nordic-dark transform rotate-3 opacity-80 group-hover:opacity-100 transition-opacity">Ylitonttu</span>
                <div className="w-24 border-b-2 border-nordic-blue/30 my-1"></div>
                <p className="font-serif text-[9px] text-nordic-blue uppercase font-bold tracking-widest">Vahvistus</p>
            </div>
        </footer>
      </div>
    </div>
  );
};