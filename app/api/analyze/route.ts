import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { analyzeQuestionsWithAI } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || text.length < 5) {
      return NextResponse.json({ error: "Input text is too short" }, { status: 400 });
    }

    // 1. Run AI/Fallback Pipeline
    console.log("Analyzing questions...");
    const aiResponse = await analyzeQuestionsWithAI(text);
    console.log("Analysis complete.");

    // 2. Map Standardized Response to Supabase Schema
    // Scale overall_bias_score (0-10) to 0-100 for UI compatibility
    const normalizedScore = Math.round(aiResponse.overall_bias_score * 10);
    
    // Risk label for DB (Low, Medium, High)
    const riskLevel = aiResponse.risk_level.charAt(0).toUpperCase() + aiResponse.risk_level.slice(1);

    const questions = aiResponse.questions;
    const totalQuestions = questions.length || 1;

    // Rule 3: Occurrence-based percentage calculation
    const getCategoryPercent = (cat: string) => {
      const count = questions.filter(q => q.bias_type.includes(cat)).length;
      return Math.round((count / totalQuestions) * 100);
    };

    const { data, error } = await supabase
      .from("analysis_reports")
      .insert([
        {
          user_id: userId,
          input_text: text,
          bias_score: normalizedScore,
          risk_level: riskLevel,
          categories: { 
            explanation: aiResponse.summary,
            is_fallback: aiResponse.is_fallback || false,
            detailed_analysis: questions,
            top_risk_insights: aiResponse.top_insights,
            // Accurate category percentages
            gender_bias: getCategoryPercent("gender"),
            age_bias: getCategoryPercent("age"),
            cultural_bias: getCategoryPercent("cultural"),
            tone_bias: getCategoryPercent("tone"),
            work_life_bias: getCategoryPercent("work_life"),
            socioeconomic_bias: getCategoryPercent("socioeconomic"),
            health_bias: getCategoryPercent("health")
          },
          flagged_phrases: questions
            .filter(q => q.bias_score > 2 && q.issue !== "No strong bias detected")
            .map(item => ({
              text: item.issue,
              reason: item.explanation,
              severity: item.bias_score > 7 ? "high" : "medium",
              impact: item.impact,
              fix: item.rewrite
            })),
          rewritten_output: questions.map(q => q.rewrite),
          diversity_impact: aiResponse.top_insights.join(" "),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error details:", error);
      return NextResponse.json({ error: "Failed to save report: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ report: data }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Analyze API error:", error);
    return NextResponse.json({ error: "Internal processing error occurred." }, { status: 500 });
  }
}
