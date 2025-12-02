import { GoogleGenAI, Type } from "@google/genai";

// Ideally, this should be an interface, but for simple checking we'll return boolean
export const checkContentSafety = async (text: string): Promise<boolean> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided, skipping safety check (dev mode).");
    return true; 
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We use a simple prompt to check for safety.
    // In a production app, we might use specific safety settings or a dedicated model.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following text for hate speech, severe profanity, harassment, or sexually explicit content. 
      Text: "${text}"
      
      Return JSON: { "safe": boolean }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result.safe === true;

  } catch (error) {
    console.error("Gemini safety check failed:", error);
    // Fail safe (allow) or fail secure (block)? 
    // For a prototype, we'll allow but log.
    return true; 
  }
};