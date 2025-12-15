// This service now fetches from the Next.js API Routes to keep API keys secure on the server.

export const generateElfName = async (userName: string): Promise<string> => {
  try {
    const response = await fetch('/api/elf/name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate name');
    }

    const data = await response.json();
    return data.tonttunimi;
  } catch (error) {
    console.error("Elf Name Generation Error:", error);
    return "Tunturitonttu"; // Fallback
  }
};

export const generateElfPortrait = async (base64Image: string): Promise<string> => {
  try {
    const response = await fetch('/api/elf/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("API Error:", errorText);
      throw new Error(`Generation failed: ${errorText}`);
    }

    const data = await response.json();
    return data.image; // Expecting { image: "data:image..." }
  } catch (error) {
    console.error("Elf Portrait Generation Error:", error);
    // FALLBACK: Return the original image if generation fails so the flow doesn't break
    return base64Image;
  }
};