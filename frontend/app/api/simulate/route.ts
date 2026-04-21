import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { neutral_question } = await req.json();

    if (!neutral_question) {
      return NextResponse.json({ error: "neutral_question is required." }, { status: 400 });
    }

    const sysPrompt = `You are EquiHire's Bias Simulator. The user provides a neutral professional interview question.
Your job is to generate 3 biased variations of this exact question to demonstrate how bias sneaks in.
Each variation must target a different category (e.g. gender, age, cultural, work_life, tone).

Return strict JSON:
{
  "original": "the neutral question",
  "variants": [
    {
      "biased_question": "the biased version",
      "category": "e.g. gender",
      "explanation": "why this is biased"
    }
  ]
}`;

    console.log("Running Bias Simulation...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", 
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
    });
    
    const result = await model.generateContent(`${sysPrompt}\\n\\nUSER:\\n${neutral_question}`);
    const simulation = JSON.parse(await result.response.text());

    return NextResponse.json({ simulation }, { status: 200 });
    
  } catch (error: any) {
    console.error("Simulation Error:", error);
    return NextResponse.json({ error: "Failed to run simulation." }, { status: 500 });
  }
}
