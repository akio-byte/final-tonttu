import { jsPDF } from "jspdf";

interface BadgeData {
  dataUrl: string;
  width: number;
  height: number;
}

// Helper to load the static PNG badge and get its dimensions for aspect-ratio safe scaling
const getBadgeData = (): Promise<BadgeData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        const canvas = document.createElement('canvas');
        // Use natural dimensions to ensure highest quality capture of the asset
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if(!ctx) return reject('No context');
        ctx.drawImage(img, 0, 0);
        
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: img.naturalWidth,
          height: img.naturalHeight
        });
    };
    img.onerror = () => {
        console.error("Failed to load badge image. Please ensure the file exists.");
        reject(new Error("Badge asset missing"));
    };
    // Use the new asset path
    img.src = '/assets/joulu-osaaja.png';
  });
};

// Helper to pre-process the user photo into a circle using Canvas
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

      // 1. Create circular path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // 2. Draw image (center crop)
      const xOffset = (img.width - size) / 2;
      const yOffset = (img.height - size) / 2;
      ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, size, size);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = base64Image;
  });
};

export const generateCertificatePDF = async (originalName: string, elfName: string, elfPhotoBase64: string): Promise<Blob> => {
  // A4 Portrait: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = 210;
  const height = 297;
  
  // Brand Colors
  const nordicRed = '#c0392b';
  const nordicGold = '#f1c40f';
  const nordicDark = '#1a2e35';
  const nordicBlue = '#2c4c5a';
  // Updated to warmer cream color to match preview
  const bg = '#FFFAF0'; 

  // 1. Background
  doc.setFillColor(bg);
  doc.rect(0, 0, width, height, 'F');

  // 2. Borders (15mm margin)
  doc.setDrawColor(nordicRed);
  doc.setLineWidth(1.5); 
  doc.rect(15, 15, width - 30, height - 30); 

  doc.setDrawColor(nordicGold);
  doc.setLineWidth(0.5);
  doc.rect(17, 17, width - 34, height - 34);

  // 3. Corner Ornaments (Triangles)
  doc.setFillColor(nordicRed);
  const cornerSize = 10;
  // Top Left
  doc.triangle(15, 15, 15 + cornerSize, 15, 15, 15 + cornerSize, 'F');
  // Top Right
  doc.triangle(width - 15, 15, width - 15 - cornerSize, 15, width - 15, 15 + cornerSize, 'F');
  // Bottom Left
  doc.triangle(15, height - 15, 15 + cornerSize, height - 15, 15, height - 15 - cornerSize, 'F');
  // Bottom Right
  doc.triangle(width - 15, height - 15, width - 15 - cornerSize, height - 15, width - 15, height - 15 - cornerSize, 'F');

  // 4. Header
  doc.setFont("times", "bold");
  doc.setTextColor(nordicRed);
  doc.setFontSize(40);
  doc.text("Virallinen", width / 2, 45, { align: 'center' });
  doc.text("Tonttutodistus", width / 2, 60, { align: 'center' });
  
  // 6. Photo
  const photoSize = 100; // mm
  const photoX = (width - photoSize) / 2;
  const photoY = 75; 
  const centerX = width / 2;
  const centerY = photoY + (photoSize / 2);
  const radius = photoSize / 2;

  // Background for photo (in case transparent)
  doc.setFillColor(nordicDark);
  doc.circle(centerX, centerY, radius + 1, 'F');
  
  // Add user image
  try {
     const circularPhoto = await createCircularImage(elfPhotoBase64);
     doc.addImage(circularPhoto, 'PNG', photoX, photoY, photoSize, photoSize);
  } catch (e) {
      console.error("Image processing failed, falling back to square", e);
      doc.addImage(elfPhotoBase64, 'JPEG', photoX, photoY, photoSize, photoSize);
  }

  // Photo Border
  doc.setDrawColor(nordicGold);
  doc.setLineWidth(3);
  doc.circle(centerX, centerY, radius, 'S');

  // 7. Official Badge (Stamping)
  try {
    const badge = await getBadgeData();
    const targetWidth = 40; // mm - increased size for legibility
    // Calculate height based on native aspect ratio
    const ratio = badge.height / badge.width;
    const targetHeight = targetWidth * ratio;
    
    // Position: Overlapping bottom right.
    const badgeX = centerX + radius - 20; 
    
    // Y: Move down so feet hang off
    const badgeY = centerY + radius - 15; 
    
    // No rotation for "Joulu-osaaja" text
    doc.addImage(badge.dataUrl, 'PNG', badgeX, badgeY, targetWidth, targetHeight); 
  } catch (e) {
    console.error("Badge generation failed.", e);
  }

  // 8. Text Content
  const textStartY = 220; 
  
  doc.setFont("times", "italic");
  doc.setTextColor(nordicBlue);
  doc.setFontSize(16);
  doc.text("Täten todistamme, että", width / 2, textStartY, { align: 'center' });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(nordicDark);
  doc.setFontSize(28);
  
  // Name with underline
  const nameUpper = originalName.toUpperCase();
  doc.text(nameUpper, width / 2, textStartY + 15, { align: 'center' });
  const nameWidth = doc.getTextWidth(nameUpper);
  doc.setDrawColor(nordicDark);
  doc.setLineWidth(0.2);
  doc.line((width - nameWidth)/2 - 5, textStartY + 17, (width + nameWidth)/2 + 5, textStartY + 17);

  doc.setFont("times", "italic");
  doc.setTextColor(nordicBlue);
  doc.setFontSize(16);
  doc.text("tunnetaan Korvatunturilla tästä lähtien nimellä", width / 2, textStartY + 30, { align: 'center' });

  // Elf Name
  doc.setFont("times", "bolditalic");
  doc.setTextColor(nordicRed);
  doc.setFontSize(40);
  doc.text(elfName, width / 2, textStartY + 50, { align: 'center' });

  // 9. Footer Signatures
  const footerY = 280; 
  const sigOffset = 50;

  // Joulupukki
  doc.setFont("times", "italic");
  doc.setTextColor(nordicDark);
  doc.setFontSize(24);
  doc.text("Joulupukki", width/2 - sigOffset, footerY, { align: 'center', angle: -5 });
  doc.setDrawColor(nordicBlue);
  doc.setLineWidth(0.2);
  doc.line(width/2 - sigOffset - 20, footerY + 2, width/2 - sigOffset + 20, footerY + 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(nordicBlue);
  doc.text("JOULUPUKKI", width/2 - sigOffset, footerY + 7, { align: 'center' });

  // Ylitonttu
  doc.setFont("times", "italic");
  doc.setTextColor(nordicDark);
  doc.setFontSize(24);
  doc.text("Ylitonttu", width/2 + sigOffset, footerY, { align: 'center', angle: 3 });
  doc.setDrawColor(nordicBlue);
  doc.setLineWidth(0.2);
  doc.line(width/2 + sigOffset - 20, footerY + 2, width/2 + sigOffset + 20, footerY + 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(nordicBlue);
  doc.text("YLITONTTU", width/2 + sigOffset, footerY + 7, { align: 'center' });
  
  return doc.output('blob');
};