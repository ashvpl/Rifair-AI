import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResponse, QuestionAnalysis } from "./types";

const SYSTEM_PROMPT = `You are a senior AI fairness auditor for EquiHire AI. Perform strict, evidence-based bias detection on interview questions using BOTH the provided lexicon (keywords) and contextual tone analysis. NO HALLUCINATIONS ALLOWED.

CORE CATEGORIES:
1. gender
2. age
3. cultural
4. work_life
5. socioeconomic
6. health
7. tone (Exclusion, Dominance, Personal Intrusion)

CORE RULES:
1. PER-QUESTION ANALYSIS: Analyze EACH question independently.
2. EVIDENCE REQUIREMENT: Always quote the EXACT word/phrase causing bias. 
3. SCORING (0-10): 0-2 (None), 3-4 (Mild), 5-6 (Moderate), 7-10 (Strong/Critical).
4. VALIDATION: If hints are provided, validate them. Do not makeup issues if none exist.
5. TOP INSIGHTS: Generate 1-3 high-level risk insights summarizing the overall analysis.

RETURN ONLY THIS JSON STRUCTURE:
{
  "overall_bias_score": number, // average of all question scores (0-10)
  "risk_level": "low" | "medium" | "high",
  "summary": "1-2 line factual summary",
  "top_insights": string[], // max 3 insights
  "questions": [
    {
      "question": "original text",
      "bias_score": number,
      "bias_type": string[],
      "issue": "exact phrase OR tone description",
      "explanation": "concise factual reasoning",
      "impact": "diversity/fairness effect",
      "rewrite": "neutral professional version"
    }
  ]
}`;

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
}

function getGemini() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

export async function validateWithAI(text: string, hints: string[]): Promise<AnalysisResponse> {
  const timeoutMs = 15000;
  const augmentedText = hints.length > 0 
    ? `${text}\n\n[RULE-BASED HINTS:\n${hints.join("\n")}]`
    : text;

  try {
    console.log("AI Pipeline: Trying Gemini...");
    const result = await withTimeout(callGemini(augmentedText), timeoutMs);
    return cleanAIResponse(result, text);
  } catch (e: any) {
    console.error("AI Pipeline: Gemini failed:", e.message || e);
    
    try {
      console.log("AI Pipeline: Falling back to OpenAI...");
      const result = await withTimeout(callOpenAI(augmentedText), timeoutMs);
      return cleanAIResponse(result, text);
    } catch (e2: any) {
      console.error("AI Pipeline: OpenAI failed:", e2.message || e2);
      throw new Error("AI Validation Failed");
    }
  }
}

async function callGemini(text: string): Promise<AnalysisResponse> {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash", // standard fast reliable model
    generationConfig: { 
      responseMimeType: "application/json",
      temperature: 0.1, // Even stricter
      topP: 0.9,
      maxOutputTokens: 1000
    }
  });
  
  const prompt = `${SYSTEM_PROMPT}\n\nUSER INPUT:\n${text}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

async function callOpenAI(text: string): Promise<AnalysisResponse> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.1,
    top_p: 0.9,
    max_tokens: 1000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `USER INPUT:\n${text}` },
    ],
  });

  const output = completion.choices[0].message.content;
  if (!output) throw new Error("Empty OpenAI response");
  return JSON.parse(output);
}

function cleanAIResponse(data: any, originalText: string): AnalysisResponse {
  const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
  const approvedCategories = ["gender", "age", "cultural", "work_life", "socioeconomic", "health", "tone"];

  const cleanedQuestions = rawQuestions.map((q: any) => {
    const isClean = q.bias_score <= 2 || q.issue === "No strong bias detected";
    const foundIssue = q.issue && (
      originalText.toLowerCase().includes(q.issue.toLowerCase()) || 
      q.bias_type.includes("tone")
    );
    
    // Ensure all categories are valid
    const validCategories = Array.isArray(q.bias_type) ? q.bias_type.filter((t: string) => approvedCategories.includes(t)) : [];
    const hasValidCategory = validCategories.length > 0;
    const hasExplanation = !!q.explanation && q.explanation.length > 5;

    // Strict hallucination check: If AI flags a specific phrase but it's not in the text, reject it.
    if (!isClean && (!foundIssue || !hasValidCategory || !hasExplanation)) {
      return {
        ...q,
        bias_score: 1,
        bias_type: [],
        issue: "No strong bias detected",
        explanation: "No clear linguistic evidence of bias found.",
        impact: "Minimal impact on candidate fairness.",
        rewrite: q.question
      };
    }
    
    return { ...q, bias_type: hasValidCategory ? validCategories : [] };
  });

  const totalScore = cleanedQuestions.length > 0
    ? cleanedQuestions.reduce((sum: number, q: any) => sum + q.bias_score, 0)
    : 1;
  const avgScore = totalScore / (cleanedQuestions.length || 1);

  let riskLevel: "low" | "medium" | "high" = "low";
  if (avgScore >= 7) riskLevel = "high";
  else if (avgScore >= 4) riskLevel = "medium";

  return {
    overall_bias_score: avgScore,
    risk_level: riskLevel,
    summary: data.summary || "Analysis complete.",
    top_insights: Array.isArray(data.top_insights) ? data.top_insights.slice(0, 3) : [],
    questions: cleanedQuestions,
    is_fallback: false
  };
}
