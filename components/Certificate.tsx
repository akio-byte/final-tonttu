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
    <div className="flex flex-col items-center w-full h-full">
      
      {/* Screen Controls */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
        <h2 className="text-2xl font-serif text-nordic-snow">Tonttuhenkilöllisyytesi</h2>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onRestart}>Aloita alusta</Button>
          <Button 
            variant="primary" 
            onClick={handleDownloadPDF} 
            disabled={isGenerating}
          >
            {isGenerating ? "Luodaan..." : "Lataa PDF"}
          </Button>
        </div>
      </div>

      {/* Screen Preview (Interactive Representation Only) */}
      <div className="bg-[#FFFAF0] text-nordic-dark w-full max-w-[400px] aspect-[210/297] shadow-2xl relative overflow-hidden flex flex-col items-center p-0 rounded-lg transform scale-95 origin-top">
        
        {/* Decorative Border */}
        <div className="absolute inset-4 border-[3px] border-nordic-red pointer-events-none z-20"></div>
        <div className="absolute inset-6 border-[1px] border-nordic-gold pointer-events-none z-20"></div>
        
        {/* Corners */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-[6px] border-l-[6px] border-nordic-red rounded-tl-xl z-10"></div>
        <div className="absolute top-2 right-2 w-12 h-12 border-t-[6px] border-r-[6px] border-nordic-red rounded-tr-xl z-10"></div>
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-[6px] border-l-[6px] border-nordic-red rounded-bl-xl z-10"></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-[6px] border-r-[6px] border-nordic-red rounded-br-xl z-10"></div>

        {/* Header */}
        <header className="mt-12 text-center z-10 w-full relative">
          <h1 className="font-festive text-4xl text-nordic-red mb-1 leading-none tracking-wide">
            Virallinen<br/>Tonttutodistus
          </h1>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full z-10 gap-4 -mt-4">
          <div className="relative">
            {/* Larger Image (w-64 h-64 approx 256px / 100mm approx) */}
            <div className="w-64 h-64 rounded-full border-[8px] border-nordic-gold overflow-hidden relative z-10 bg-nordic-dark">
                <img src={elfPhoto} alt="Tonttukuva" className="w-full h-full object-cover" />
            </div>
            {/* Badge overlapping bottom-right. Adjusted slightly lower to match PDF logic and clear the face. */}
            <div className="absolute -bottom-10 -right-6 z-40 w-24 h-28 transform rotate-6">
              <EduroBadge />
            </div>
          </div>
         
          <div className="text-center space-y-3 max-w-[85%] px-4 pt-4">
            <div className="space-y-0.5">
              <p className="font-serif italic text-sm text-nordic-blue/70">Täten todistamme, että</p>
              <h2 className="font-sans font-bold text-xl text-nordic-dark uppercase tracking-wider border-b border-nordic-dark/10 pb-1">{originalName}</h2>
            </div>
            
            <div className="space-y-1">
              <p className="font-serif italic text-sm text-nordic-blue/70">tunnetaan nimellä</p>
              <h2 className="font-festive text-4xl text-nordic-red leading-tight">{elfName}</h2>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mb-12 w-full flex justify-between items-end z-10 px-8 relative">
            <div className="text-center flex flex-col items-center">
                <span className="font-festive text-xl text-nordic-dark transform -rotate-6">Joulupukki</span>
                <div className="w-20 border-b border-nordic-blue/30 my-1"></div>
                <p className="font-serif text-[8px] text-nordic-blue uppercase font-bold">Joulupukki</p>
            </div>
            <div className="text-center flex flex-col items-center">
                 <span className="font-festive text-xl text-nordic-dark transform rotate-3">Ylitonttu</span>
                <div className="w-20 border-b border-nordic-blue/30 my-1"></div>
                <p className="font-serif text-[8px] text-nordic-blue uppercase font-bold">Ylitonttu</p>
            </div>
        </footer>
      </div>
    </div>
  );
};