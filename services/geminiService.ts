import { GoogleGenAI } from "@google/genai";
import { DailyEntry } from "../types";

// NOTE: This assumes process.env.API_KEY is available.
// In a real deployed react app, this would be imported from env config.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCoachAdvice = async (entries: DailyEntry[]) => {
  if (!process.env.API_KEY) {
      return "Error: No API Key configured. Please set process.env.API_KEY.";
  }

  // Summarize last 7 entries for context
  const recent = entries.slice(-7);
  const context = JSON.stringify(recent.map(e => ({
      date: e.date,
      weight: e.weight_kg,
      run: e.roadwork_km,
      diet: e.diet_compliance_pct,
      missed: e.missed_day_flag,
      notes: e.notes
  })));

  const prompt = `
    You are the head coach of the Kamogawa Boxing Gym. You are strict, loud, and demand discipline (Ippo-style).
    Analyze these recent training logs for a fighter who wants an athletic body in 90 days.
    
    Data: ${context}

    If they missed days, yell at them.
    If they trained hard, acknowledge it briefly but demand more consistency.
    Point out their weakest metric.
    Keep it under 100 words.
    End with a motivating quote from a boxing legend or manga.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Coach unavailable:", error);
    return "Coach is out for a smoke break. (API Error)";
  }
};
