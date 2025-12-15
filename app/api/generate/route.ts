import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";
import process from "node:process";

// --- Constants ---
const ELF_NAME_PROMPT = `
You are a Finnish Christmas Elf Name Generator.
Generate a friendly Finnish elf name based on the user's first name.
Rules:
- Output must be Finnish
- 1–2 words only
- Maximum length: 24 characters
- Must be friendly, non-offensive, family-safe
- Example styles: "Aki Tunturiparta", "Lumi-Niklas"
`;

const ELF_IMAGE_PROMPT = `
Transform this person into a festive Christmas Elf character.
Instructions:
- The person should be wearing a red Christmas elf hat and an elf costume.
- Add subtle pointed elf ears.
- Maintain the person's facial likeness and expression (do not distort the face).
- The background should be a magical, snowy winter scene or Santa's workshop.
- Ensure warm, holiday lighting.
- Style: Realistic, high-quality portrait photography.
- Output ONLY the generated image.
`;

// --- Helpers ---
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");
  return new GoogleGenAI({ apiKey });
};

// Ensure "valmis" directory exists for finished certificates
const ensureValmisDir = () => {
  const dir = path.join(process.cwd(), 'public', 'valmis');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

async function generateElfName(userName: string): Promise<string> {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({ 
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: ELF_NAME_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tonttunimi: { type: Type.STRING },
          },
          required: ["tonttunimi"],
        },
        temperature: 0.8,
      },
      contents: JSON.stringify({ name: userName })
    });

    const text = response.text;
    
    if (!text) return "Talvitonttu";
    const json = JSON.parse(text);
    return json.tonttunimi || "Talvitonttu";
  } catch (error) {
    console.error("Name Gen Error:", error);
    return "Tunturitonttu";
  }
}

async function generateElfPortrait(base64Image: string): Promise<string> {
  try {
    const ai = getClient();
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    
    // Use gemini-2.5-flash-image for image generation/editing
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { text: ELF_IMAGE_PROMPT },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          }
        ]
      }
    });

    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn("No image data found in response, returning original.");
    return base64Image;

  } catch (error) {
    console.error("Image Gen Error:", error);
    return base64Image;
  }
}

async function createPdf(originalName: string, elfName: string, photoBase64: string): Promise<string> {
  // A4 dimensions in points (595 x 842)
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  // Colors
  const nordicRed = rgb(0.75, 0.22, 0.17); // #c0392b
  const nordicDark = rgb(0.1, 0.18, 0.21); // #1a2e35
  const cream = rgb(1, 0.98, 0.94); // #FFFAF0

  // 1. Background
  page.drawRectangle({ x: 0, y: 0, width, height, color: cream });

  // 2. Borders
  const margin = 40;
  page.drawRectangle({
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
    borderColor: nordicRed,
    borderWidth: 4,
  });

  // 3. Header Text
  const font = await doc.embedFont(StandardFonts.TimesBold);
  const fontItalic = await doc.embedFont(StandardFonts.TimesItalic);
  
  page.drawText("Virallinen", { x: width / 2 - 80, y: height - 120, size: 36, font, color: nordicRed });
  page.drawText("Tonttutodistus", { x: width / 2 - 120, y: height - 160, size: 36, font, color: nordicRed });

  // 4. Photo
  const photoSize = 250;
  const photoY = height - 480;
  const photoX = (width - photoSize) / 2;

  try {
    const cleanPhoto = photoBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const photoBuffer = Buffer.from(cleanPhoto, "base64");
    
    // Detect image type roughly
    let embeddedPhoto;
    if (photoBase64.startsWith('data:image/png')) {
       embeddedPhoto = await doc.embedPng(photoBuffer);
    } else {
       embeddedPhoto = await doc.embedJpg(photoBuffer);
    }
    
    page.drawImage(embeddedPhoto, { x: photoX, y: photoY, width: photoSize, height: photoSize });
    
    // Draw border around photo
    page.drawRectangle({
      x: photoX, y: photoY, width: photoSize, height: photoSize,
      borderColor: nordicDark, borderWidth: 3, opacity: 0
    });
  } catch (e) {
    console.error("PDF Photo Embed Error", e);
  }

  // 5. BADGE - STATIC ASSET
  try {
    const badgePath = path.join(process.cwd(), 'public', 'assets', 'joulu-osaaja.png');
    if (fs.existsSync(badgePath)) {
      const badgeBytes = fs.readFileSync(badgePath);
      const badgeImage = await doc.embedPng(badgeBytes);
      
      const badgeW = 110; 
      const badgeH = badgeW * (badgeImage.height / badgeImage.width);
      
      page.drawImage(badgeImage, {
        x: photoX + photoSize - 80,
        y: photoY - 30,
        width: badgeW,
        height: badgeH,
        rotate: degrees(0) 
      });
    } else {
        console.warn("Badge file not found at", badgePath);
    }
  } catch (e) {
    console.error("Badge embedding failed:", e);
  }

  // 6. Text Content
  const textStart = 250;
  page.drawText("Täten todistamme, että", { x: width/2 - 90, y: textStart, size: 18, font: fontItalic, color: nordicDark });
  
  const originalNameUpper = originalName.toUpperCase();
  const nameWidth = font.widthOfTextAtSize(originalNameUpper, 24);
  page.drawText(originalNameUpper, { x: (width - nameWidth)/2, y: textStart - 40, size: 24, font, color: nordicDark });
  
  page.drawText("tunnetaan Korvatunturilla tästä lähtien nimellä", { x: width/2 - 160, y: textStart - 80, size: 18, font: fontItalic, color: nordicDark });
  
  const elfNameWidth = font.widthOfTextAtSize(elfName, 32);
  page.drawText(elfName, { x: (width - elfNameWidth)/2, y: textStart - 130, size: 32, font, color: nordicRed });

  // 7. Footer
  page.drawText("JOULUPUKKI", { x: width/2 - 120, y: 100, size: 12, font, color: nordicDark });
  page.drawText("YLITONTTU", { x: width/2 + 60, y: 100, size: 12, font, color: nordicDark });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, photoBase64 } = body;

    if (!name || !photoBase64) {
      return NextResponse.json({ error: "Missing name or photo" }, { status: 400 });
    }

    const [tonttunimi, elfImage] = await Promise.all([
      generateElfName(name),
      generateElfPortrait(photoBase64)
    ]);

    const pdfBase64 = await createPdf(name, tonttunimi, elfImage);

    // --- KIOSK FEATURE: Save to 'valmis' folder ---
    try {
        const valmisDir = ensureValmisDir();
        const safeName = name.replace(/[^a-z0-9äöå]/gi, '_').toLowerCase();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `tonttutodistus-${timestamp}-${safeName}.pdf`;
        const filePath = path.join(valmisDir, filename);
        
        fs.writeFileSync(filePath, Buffer.from(pdfBase64, 'base64'));
        console.log(`Saved certificate to: ${filePath}`);
    } catch (saveError) {
        console.error("Failed to save local copy:", saveError);
        // We continue even if saving fails, to return the response to user
    }
    // ---------------------------------------------

    return NextResponse.json({
      tonttunimi,
      imageUrl: elfImage,
      pdfBase64: `data:application/pdf;base64,${pdfBase64}`
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}