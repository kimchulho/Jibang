import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = (process.env?.GEMINI_API_KEY || import.meta.env?.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please check your environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export interface BonGwanHanja {
  hanja_surname: string;
  hanja_bon_gwan: string;
}

export const getBonGwanHanjaFromAI = async (surname: string, bon_gwan: string): Promise<BonGwanHanja> => {
  const ai = getAiClient();
  const model = "gemini-3.1-pro-preview";
  const prompt = `한국의 성씨와 본관을 한자로 변환해주세요.
성씨: ${surname}
본관: ${bon_gwan}

주의사항:
1. 한국에 실제 존재하는 본관과 성씨인지 확인하고, 가장 정확하고 널리 쓰이는 한자를 사용해주세요.
2. '씨(氏)' 등의 호칭은 제외하고 순수하게 본관과 성씨의 한자만 반환해주세요.
3. 결과는 반드시 JSON 형식으로 반환해주세요.
예시: {"hanja_surname": "金", "hanja_bon_gwan": "金海"}
`;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hanja_surname: { type: Type.STRING },
          hanja_bon_gwan: { type: Type.STRING },
        },
        required: ["hanja_surname", "hanja_bon_gwan"],
      },
    },
  });

  let result = { hanja_surname: surname, hanja_bon_gwan: bon_gwan };
  try {
    result = JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("AI JSON Parse Error:", e);
  }
  return result;
};
