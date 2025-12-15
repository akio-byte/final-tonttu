import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ELF_NAME_PROMPT } from "../../../../../constants";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

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
      contents: JSON.stringify({ name }),
      config: {
        systemInstruction: ELF_NAME_PROMPT,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
        return NextResponse.json({ tonttunimi: "Talvitonttu" });
    }
    
    const json = JSON.parse(text);
    return NextResponse.json(json);

  } catch (error) {
    console.error("API Name Error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}