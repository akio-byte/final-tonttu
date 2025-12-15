import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ELF_NAME_PROMPT, ELF_IMAGE_PROMPT } from '../constants';
import { ElfNameResponse } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateElfName = async (userName: string): Promise<string> => {
  try {
    const ai = getClient();
    
    // Define the schema for structured output
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        tonttunimi: {
          type: Type.STRING,
          description: "The generated Finnish elf name",
        },
      },
      required: ["tonttunimi"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: JSON.stringify({ name: userName }),
      config: {
        systemInstruction: ELF_NAME_PROMPT,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7, // Creativity balance
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");

    const json: ElfNameResponse = JSON.parse(text);
    return json.tonttunimi;
  } catch (error) {
    console.error("Elf Name Generation Error:", error);
    return "Tunturitonttu"; // Fallback
  }
};

export const generateElfPortrait = async (base64Image: string): Promise<string> => {
  try {
    const ai = getClient();
    
    // Detect mime type or default to jpeg
    const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    
    // Clean base64 string
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    // Switch to gemini-2.5-flash-image for better stability with image editing tasks
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
      // Note: imageConfig is not supported for this model, and responseMimeType should not be set
    });

    const candidate = response.candidates?.[0];
    
    if (!candidate) {
        throw new Error("No candidates returned from Gemini.");
    }

    // Check for safety finish reasons
    if (candidate.finishReason !== "STOP" && candidate.finishReason !== undefined) {
        console.warn("Gemini finish reason:", candidate.finishReason);
        // If filtered, we will throw to trigger the fallback
        if (!candidate.content) {
             throw new Error(`Generation filtered: ${candidate.finishReason}`);
        }
    }

    const parts = candidate.content?.parts;
    
    if (parts) {
      // Find the image part
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
      
      const textPart = parts.find(p => p.text);
      if (textPart && textPart.text) {
          console.warn("Gemini returned text:", textPart.text);
      }
    }

    throw new Error("No image data found in response.");

  } catch (error) {
    console.error("Elf Portrait Generation Error:", error);
    // FALLBACK: If generation fails, return the original image so the user still gets a result
    // We could add a client-side filter here if needed, but returning the original is safest.
    return base64Image;
  }
};