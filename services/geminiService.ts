import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the Gemini API client on the frontend
// The platform handles the injection of process.env.GEMINI_API_KEY
const getAiClient = () => {
  // Try multiple ways to access the key, and trim it
  const apiKey = (process.env?.GEMINI_API_KEY || import.meta.env?.VITE_GEMINI_API_KEY || '').trim();
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please check your environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const convertToHanja = async (text: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Convert the following Korean text (Clan, Surname, or Name) to its most common Hanja representation for a Jibang (Ancestral Rite Tablet). 
            
            Rules:
            1. Return ONLY the Hanja characters.
            2. If the input contains multiple parts (e.g., "김해 김"), return them separated by a space (e.g., "金海 金").
            3. No explanations.

            Input: "${text}"`
        });
            
        return response.text?.trim() || text;
    } catch (e) {
        console.error("Hanja Convert Error", e);
        return text;
    }
}

export const convertJibangToHanja = async (koreanText: string): Promise<string> => {
  try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Convert the following Korean Jibang (Ancestral Tablet) text into traditional Hanja. 
          
          Rules:
          1. '현고' -> '顯考', '현비' -> '顯妣', '학생' -> '學生', '부군' -> '府君', '신위' -> '神位', '유인' -> '孺人'.
          2. Convert Clan names and Surnames to their most common Hanja (e.g., 김해 -> 金海, 김 -> 金, 이 -> 李).
          3. Return ONLY the converted Hanja string. No explanations.
          
          Input: "${koreanText}"`
      });
          
      return response.text?.trim() || koreanText;
  } catch (e) {
      console.error("Jibang Convert Error", e);
      return koreanText;
  }
}

export const generateHanjaImage = async (hanja: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    // Use gemini-2.5-flash-image for image generation tasks as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A traditional black brush calligraphy of the Chinese character '${hanja}' on a plain white background. The character should be centered, high contrast, and clearly written in a standard Kaishu style.`
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Hanja Image Generation Error:", error);
    return null;
  }
};
