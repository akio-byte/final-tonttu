import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ELF_NAME_PROMPT, ELF_IMAGE_PROMPT } from '../constants';

// NOTE: This service might be used by client-side code (deprecated) or server components.
// We strictly assume API key is available in process.env if run on server.
const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // If we are on the client, this will fail, which is correct (security).
    throw new Error("GEMINI_API_KEY is missing. Ensure you are running this on the server.");
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
    const genAI = getClient();
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    
    // Fallback to text model if image model not configured
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
        ELF_IMAGE_PROMPT,
        { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }
    ]);
    
    // Legacy SDK usually does not return image data this way, but keeping structure for compatibility
    // if backend supports it.
    const candidate = result.response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return base64Image;
  } catch (error) {
    console.error("Elf Portrait Generation Error:", error);
    return base64Image;
  }
};