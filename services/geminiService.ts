import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ELF_NAME_PROMPT, ELF_IMAGE_PROMPT } from '../constants';

// NOTE: This service is largely superseded by app/api/generate/route.ts in the Next.js App Router structure.
// Kept for compatibility with legacy components if any, but it will fail on client-side due to missing API key.

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Ensure you are running this on the server.");
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generateElfName = async (userName: string): Promise<string> => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: ELF_NAME_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            tonttunimi: { type: SchemaType.STRING },
          },
          required: ["tonttunimi"],
        },
        temperature: 0.7,
      }
    });

    const result = await model.generateContent(JSON.stringify({ name: userName }));
    const text = result.response.text();

    if (!text) throw new Error("No text returned");
    const json = JSON.parse(text);
    return json.tonttunimi;
  } catch (error) {
    console.error("Elf Name Generation Error:", error);
    return "Tunturitonttu"; 
  }
};

export const generateElfPortrait = async (base64Image: string): Promise<string> => {
  try {
    // Current public Gemini 1.5 Flash via this SDK does not standardly return modified images in the response.
    // This function acts as a pass-through fallback for now.
    return base64Image;
  } catch (error) {
    console.error("Elf Portrait Generation Error:", error);
    return base64Image;
  }
};