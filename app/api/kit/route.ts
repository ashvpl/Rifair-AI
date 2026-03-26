import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { runBiasPipeline } from "@/lib/engine";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { role, experience_level, company_type, diversity_goals } = await req.json();

    if (!role || !experience_level) {
      return NextResponse.json({ error: "Role and experience level are required." }, { status: 400 });
    }

    const sysPrompt = `You are an expert HR instructional designer. Create a highly professional, entirely bias-free interview kit.
DO NOT use terms like 'ninja', 'rockstar', 'culture fit', 'young', or aggressive metaphors.
Return strict JSON:
{
  "job_description_snippet": "1 paragraph inclusive summary",
  "questions": [
    "Question 1...",
    "Question 2...",
    "Question 3...",
    "Question 4...",
    "Question 5..."
  ],
  "evaluation_rubric": [
    {
      "criteria": "e.g. Communication",
      "look_for": "what to score highly",
      "avoid": "what biases to avoid"
    }
  ]
}`;

    const prompt = `Role: ${role}\\nExperience: ${experience_level}\\nCompany type: ${company_type}\\nDiversity goals: ${diversity_goals || "Standard inclusive hiring"}`;
    
    console.log("Generating Interview Kit...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", 
      generationConfig: { responseMimeType: "application/json", temperature: 0.6 }
    });
    
    const result = await model.generateContent(`${sysPrompt}\\n\\nUSER:\\n${prompt}`);
    const generated = JSON.parse(await result.response.text());

    // Run the generated questions through the bias pipeline to double check!
    const questionsText = generated.questions.join("\\n");
    const biasCheck = await runBiasPipeline(questionsText);

    return NextResponse.json({ 
      kit: generated, 
      bias_validation: biasCheck 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Kit Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate kit." }, { status: 500 });
  }
}
