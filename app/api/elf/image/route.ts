import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ELF_IMAGE_PROMPT } from "../../../../../constants";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const body = await req.json();
    const base64Image = body.image;

    if (!base64Image) {
      return NextResponse.json({ error: "Image data missing" }, { status: 400 });
    }

    // 1. Clean and Validate Base64
    const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const ai = new GoogleGenAI({ apiKey });

    // 2. Call Gemini-2.5-Flash-Image
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: ELF_IMAGE_PROMPT,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    });

    const candidate = response.candidates?.[0];
    
    if (candidate?.content?.parts) {
      // Iterate parts to find the image.
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const newImage = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
          return NextResponse.json({ image: newImage });
        }
      }
    }

    // If no image found, return error but maybe with status 500 so client falls back
    return NextResponse.json({ error: "No image generated" }, { status: 500 });

  } catch (error) {
    console.error("API Image Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}