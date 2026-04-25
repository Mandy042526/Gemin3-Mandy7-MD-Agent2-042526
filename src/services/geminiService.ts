import { GoogleGenAI } from '@google/genai';

export async function generateContent(
  model: string,
  prompt: string,
  systemInstruction?: string,
  useSearch: boolean = false
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const ai = new GoogleGenAI({ apiKey });

  const config: any = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config,
  });

  return response.text || '';
}
