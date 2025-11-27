
import { GoogleGenAI } from "@google/genai";

// Safe retrieval of API Key to prevent browser crashes
const getApiKey = (): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // fail silently
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey });

export const getGeminiAdvice = async (query: string, context: string): Promise<string> => {
  try {
    if (!apiKey) {
      console.warn("Gemini API Key is missing. Returning mock response.");
      return "Posso aiutarti con le domande sui tuoi animali domestici una volta configurata la chiave API! Per ora, ti consiglio di consultare la nostra pagina 'Servizi' per il parere di un esperto.";
    }

    const modelId = 'gemini-2.5-flash';

    const systemInstruction = `
      Sei un esperto Veterinario e Acquariofilo assistente per 'Birillo Pet Shop'.
      Il tuo tono è amichevole, professionale e orientato alla natura.
      Aiuti i clienti a scegliere prodotti per i loro animali (Cani, Gatti, Rettili) e dai consigli sulla manutenzione dell'Acquario (Pesci).
      Contesto attuale: ${context}
      Rispondi sempre in Italiano.
      Sii conciso (sotto le 150 parole) e utile.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Non sono riuscito a generare una risposta al momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Spiacente, il nostro esperto naturalista sta riposando. Riprova più tardi.";
  }
};
