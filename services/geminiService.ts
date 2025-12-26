import { GoogleGenAI, Type } from "@google/genai";
import { FunFactResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFunFact = async (locationName: string): Promise<FunFactResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tell me one very short, super fun, simple fact about ${locationName} for a 5-year-old child. 
                 It must be under 15 words. Also pick a relevant emoji.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fact: { type: Type.STRING },
            emoji: { type: Type.STRING },
          },
          required: ["fact", "emoji"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      fact: result.fact || `Explore ${locationName}!`,
      emoji: result.emoji || '🌍',
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      fact: "A wonderful place to visit!",
      emoji: "🌟",
    };
  }
};
