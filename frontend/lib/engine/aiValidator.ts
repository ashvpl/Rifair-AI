import 'server-only';
import { AnalysisResponse } from "./types";
import { BACKEND_URL } from "../server-config";

export async function validateWithAI(text: string, hints: string[]): Promise<AnalysisResponse> {
  try {
    const backendUrl = BACKEND_URL;
    
    const response = await fetch(`${backendUrl}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, hints }),
    });

    if (!response.ok) {
      throw new Error(`AI Analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("AI Analysis Proxy Error:", error.message);
    throw new Error("AI Validation Failed");
  }
}
