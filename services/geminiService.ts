import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const askGemini = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = 'gemini-3-flash-preview';
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "당신은 한국의 전통 제례와 지방(Jibang) 작성법에 정통한 전문가입니다. 사용자가 본관이나 성씨의 한자를 묻거나, 지방 작성법을 물어보면 친절하고 정확하게 한자를 포함하여 답변해주세요. 답변은 간결하게 핵심만 전달하세요.",
      }
    });

    return response.text || "죄송합니다. 답변을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 서비스 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export const convertToHanja = async (text: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Convert the following Korean text (Clan or Name) to its most common Hanja representation for a Jibang (Ancestral Rite Tablet). Only return the Hanja characters. If multiple exist, provide the most common one. Input: "${text}"`,
        });
        return response.text?.trim() || text;
    } catch (e) {
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
          
          Input: "${koreanText}"`,
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
    const model = 'gemini-2.5-flash-image';
    
    const response = await ai.models.generateContent({
      model,
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