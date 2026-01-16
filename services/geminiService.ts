
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  getSustainabilityTip: async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Give me one short, inspiring tip for reducing food waste in a college hostel environment. Keep it under 20 words.',
        config: { temperature: 0.7 }
      });
      return response.text?.trim() || "Sharing is caring – especially when it comes to food! Save a meal, save the planet.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Sharing food reduces methane emissions from landfills. Start sharing today!";
    }
  },

  analyzeFoodImage: async (base64Image: string) => {
    try {
      // Stripping the prefix from base64 if present
      const base64Data = base64Image.split(',')[1] || base64Image;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: 'Analyze this food photo. Identify the food, suggest a catchy title, the most likely category (Meal, Snack, Fruits, Beverage, or Other), and a brief description. Also provide a specific storage temperature tip. Return strictly in JSON format.',
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              storageTip: { type: Type.STRING },
            },
            required: ['title', 'category', 'description', 'storageTip'],
          },
        },
      });
      
      const result = JSON.parse(response.text || '{}');
      return result;
    } catch (error) {
      console.error("Image Analysis Error:", error);
      return null;
    }
  },

  getSafetyGuidelines: async (foodTitle: string) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `What are the official FDA or food safety guidelines for handling and storing ${foodTitle}? Provide 3 key bullet points and mention if it is a high-risk food.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      
      const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) || [];
      
      return {
        text: response.text,
        sources: Array.from(new Set(urls)) // Unique URLs
      };
    } catch (error) {
      console.error("Safety Grounding Error:", error);
      return { text: "Always ensure food is stored below 5°C or above 60°C to prevent bacterial growth.", sources: [] };
    }
  }
};
