import { jsPDF } from "jspdf";

// Helper to convert the SVG Badge into a high-res PNG Data URL for embedding
const getBadgeDataUrl = (): Promise<string> => {
  // Definition of the official Eduro Badge as a string
  const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="800" height="960">
    <g transform="translate(0, 0)">
      <g transform="translate(60, 185)">
         <path d="M15 0 L15 25 Q0 30 5 45 L35 45 Q40 30 25 25 L25 0 Z" fill="#2e7d32" />
         <path d="M15 25 L5 32 L15 32 L20 38 L25 32 L35 32 L25 25 Z" fill="#c0392b" />
         <path d="M5 45 Q-5 55 15 55 L25 45 Z" fill="#2e7d32" />
         <circle cx="5" cy="45" r="3" fill="#f1c40f" />
         <path d="M65 0 L65 25 Q50 30 55 45 L85 45 Q90 30 75 25 L75 0 Z" fill="#2e7d32" />
         <path d="M65 25 L55 32 L65 32 L70 38 L75 32 L85 32 L75 25 Z" fill="#c0392b" />
         <path d="M55 45 Q45 55 65 55 L75 45 Z" fill="#2e7d32" />
         <circle cx="55" cy="45" r="3" fill="#f1c40f" />
      </g>
      <circle cx="100" cy="100" r="95" fill="#1e3a8a" stroke="#fff" stroke-width="2" />
      <circle cx="100" cy="110" r="75" fill="white" />
      <text x="50" y="45" font-family="sans-serif" font-size="22" fill="white" font-weight="bold" transform="rotate(-15 50 45)">EDURO</text>
      <path d="M75 25 Q80 15 90 20 Q85 35 75 25 Z" fill="white" transform="rotate(-15 75 25)"/>
      <g transform="translate(65, 55) scale(0.7)">
         <path d="M50 0 L90 40 L70 40 L100 80 L0 80 L30 40 L10 40 Z" fill="#374151" />
         <rect x="40" y="80" width="20" height="15" fill="#374151" />
         <circle cx="50" cy="0" r="6" fill="#374151" />
         <circle cx="30" cy="60" r="4" fill="white" />
         <circle cx="70" cy="60" r="4" fill="white" />
         <circle cx="50" cy="30" r="4" fill="white" />
         <path d="M25 50 Q50 65 75 50" fill="none" stroke="white" stroke-width="2" />
      </g>
      <text x="100" y="145" font-family="sans-serif" font-size="16" fill="#374151" text-anchor="middle" font-weight="900" letter-spacing="1">JOULU-</text>
      <text x="100" y="165" font-family="sans-serif" font-size="18" fill="#374151" text-anchor="middle" font-weight="900" letter-spacing="1">OSAAJA</text>
      <g transform="translate(130, -10) rotate(15)">
        <path d="M0 50 Q20 -10 70 40 L60 70 Q20 50 0 50 Z" fill="#c0392b" />
        <circle cx="70" cy="40" r="12" fill="white" />
        <path d="M-10 50 Q30 40 70 60 L60 80 Q20 60 -10 65 Z" fill="white" />
      </g>
      <path d="M25 100 A 95 95 0 0 0 175 100" fill="none" stroke="none" /> 
      <path d="M30 145 Q100 185 170 145" fill="none" stroke="#27ae60" stroke-width="12" stroke-linecap="round" opacity="0.9" />
      <rect x="85" y="158" width="30" height="20" rx="4" fill="#f1c40f" stroke="#c0392b" stroke-width="2" />
    </g>
  </svg>
  `;
  
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 960;
        const ctx = canvas.getContext('2d');
        if(!ctx) return reject('No context');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
        URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
};

const createCircularImage = (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("No canvas context"));
        return;
      }
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const xOffset = (img.width - size) / 2;
      const yOffset = (img.height - size) / 2;
      ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = base64Image;
  });
};

// Helper to draw snowflakes on PDF
const drawSnowflakes = (doc: jsPDF, width: number, height: number) => {
    doc.setTextColor(230, 240, 245); // Very light blue
    const seed = 123; // Static seed feeling
    for (let i = 0; i < 40; i++) {
        const x = (Math.sin(i * seed) * width + width) % width;
        const y = (Math.cos(i * seed) * height + height) % height;
        const size = (i % 3) * 4 + 8; // Random sizes
        doc.setFontSize(size);
        doc.text("*", x, y);
    }
};

export const generateCertificatePDF = async (originalName: string, elfName: string, elfPhotoBase64: string): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = 210;
  const height = 297;
  
  const nordicRed = '#c0392b';
  const nordicGold = '#f1c40f';
  const nordicDark = '#1a2e35';
  const nordicBlue = '#2c4c5a';
  const bg = '#fdfbf7';

  // 1. Background
  doc.setFillColor(bg);
  doc.rect(0, 0, width, height, 'F');
  
  // 2. Snowflakes Pattern
  drawSnowflakes(doc, width, height);

  // 3. Borders (Double Line)
  // Outer Red
  doc.setDrawColor(nordicRed);
  doc.setLineWidth(1.5); 
  doc.rect(12, 12, width - 24, height - 24); 
  // Inner Dashed Gold
  doc.setDrawColor(nordicGold);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 2], 0);
  doc.rect(15, 15, width - 30, height - 30);
  doc.setLineDashPattern([], 0); // Reset dash

  // 4. Corner Ornaments (Simple geometric holly)
  doc.setFillColor(nordicRed);
  const c = 12; // Corner offset
  doc.circle(c, c, 3, 'F');
  doc.circle(width-c, c, 3, 'F');
  doc.circle(c, height-c, 3, 'F');
  doc.circle(width-c, height-c, 3, 'F');

  // 5. Header
  doc.setFont("times", "bold");
  doc.setTextColor(nordicDark);
  doc.setFontSize(10);
  doc.setCharSpace(2);
  doc.text("VIRALLINEN", width / 2, 45, { align: 'center' });
  
  doc.setFont("times", "bold");
  doc.setTextColor(nordicRed);
  doc.setFontSize(48);
  doc.setCharSpace(0);
  doc.text("Tonttutodistus", width / 2, 62, { align: 'center' });

  // 6. Photo
  const photoSize = 90;
  const photoX = (width - photoSize) / 2;
  const photoY = 80;
  const centerX = width / 2;
  const centerY = photoY + (photoSize / 2);
  const radius = photoSize / 2;

  // Background for photo
  doc.setFillColor(nordicDark);
  doc.circle(centerX, centerY, radius + 1, 'F');
  
  try {
     const circularPhoto = await createCircularImage(elfPhotoBase64);
     doc.addImage(circularPhoto, 'PNG', photoX, photoY, photoSize, photoSize);
  } catch (e) {
      doc.addImage(elfPhotoBase64, 'JPEG', photoX, photoY, photoSize, photoSize);
  }

  // Photo Border
  doc.setDrawColor(nordicGold);
  doc.setLineWidth(2.5);
  doc.circle(centerX, centerY, radius, 'S');

  // 7. Joulun Osaaja Badge (Prominently placed)
  try {
    const badgeDataUrl = await getBadgeDataUrl();
    const badgeWidth = 45; // Larger
    const badgeHeight = 54;
    
    // Bottom right of photo overlap
    const badgeX = centerX + radius - 10;
    const badgeY = centerY + radius - 20;
    
    doc.addImage(badgeDataUrl, 'PNG', badgeX, badgeY, badgeWidth, badgeHeight, undefined, 'FAST', 10);
  } catch (e) {
    console.error("Badge generation failed", e);
  }

  // 8. Text Content
  const textStartY = 205;
  
  doc.setFont("times", "italic");
  doc.setTextColor(nordicBlue);
  doc.setFontSize(14);
  doc.text("Täten todistamme, että", width / 2, textStartY, { align: 'center' });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(nordicDark);
  doc.setFontSize(24);
  const nameUpper = originalName.toUpperCase();
  doc.text(nameUpper, width / 2, textStartY + 12, { align: 'center' });
  
  // Underline name
  const nameWidth = doc.getTextWidth(nameUpper);
  doc.setDrawColor(nordicGold);
  doc.setLineWidth(0.5);
  doc.line((width - nameWidth)/2 - 5, textStartY + 14, (width + nameWidth)/2 + 5, textStartY + 14);

  doc.setFont("times", "italic");
  doc.setTextColor(nordicBlue);
  doc.setFontSize(14);
  doc.text("tunnetaan Korvatunturilla nimellä", width / 2, textStartY + 25, { align: 'center' });

  // Elf Name
  doc.setFont("times", "bolditalic");
  doc.setTextColor(nordicRed);
  doc.setFontSize(36);
  doc.text(elfName, width / 2, textStartY + 42, { align: 'center' });

  // 9. Footer
  const footerY = 270;
  const sigOffset = 50;

  doc.setFont("times", "italic");
  doc.setTextColor(nordicDark);
  doc.setFontSize(20);
  doc.text("Joulupukki", width/2 - sigOffset, footerY, { align: 'center', angle: -5 });
  doc.setDrawColor(nordicBlue);
  doc.setLineWidth(0.2);
  doc.line(width/2 - sigOffset - 15, footerY + 2, width/2 - sigOffset + 15, footerY + 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(nordicBlue);
  doc.text("ALLEKIRJOITUS", width/2 - sigOffset, footerY + 7, { align: 'center' });

  doc.setFont("times", "italic");
  doc.setTextColor(nordicDark);
  doc.setFontSize(20);
  doc.text("Ylitonttu", width/2 + sigOffset, footerY, { align: 'center', angle: 3 });
  doc.setDrawColor(nordicBlue);
  doc.setLineWidth(0.2);
  doc.line(width/2 + sigOffset - 15, footerY + 2, width/2 + sigOffset + 15, footerY + 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(nordicBlue);
  doc.text("VAHVISTUS", width/2 + sigOffset, footerY + 7, { align: 'center' });
  
  return doc.output('blob');
};