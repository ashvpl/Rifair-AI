const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const SYSTEM_PROMPT = `You are an AI system designed to deeply detect bias in interview questions.
DO NOT rely on keywords. Instead, analyze:
1. Intent of the question
2. Tone (neutral, doubtful, judgmental, exclusionary, aggressive, coercive)
3. Hidden assumptions (e.g., about personal life or limitations)
4. Whether the question evaluates skill OR personal circumstances

CLASSIFICATION & SCORING:
- A question is biased if it:
  - Assumes limitations based on personal life
  - Questions capability without evidence
  - Implies exclusion (“fit”, “belong”, “adjust”)
  - Pressures lifestyle choices (hours, family, availability)
- A question is NOT biased if it evaluates skills, decisions, or experience directly.
- Score 0-10: 0 for clean evaluation of skills, 1-4 for subtle assumptions, 5-7 for tone/pressure bias, 8-10 for explicit exclusion or harassment.

STRICT JSON OUTPUT FORMAT MUST MATCH EXACTLY:
{
  "overall_bias_score": number, // 0-10
  "risk_level": "low" | "medium" | "high",
  "summary": "1-2 line factual summary based on intent and assumptions",
  "top_insights": string[], // max 3 insights on meaning/tone
  "questions": [
    {
      "question": "exact sentence from input",
      "bias_score": number,
      "bias_type": string[], // from [gender, age, cultural, work_life, socioeconomic, health, tone, harassment]
      "issue": "The underlying implication or tone detected (e.g. 'Doubtful tone', 'Aggressive pressure', 'Not skill-related')",
      "explanation": "Explain WHY this is biased based on implication, tone, and hidden assumptions, NOT words.",
      "impact": "impact on diversity and fairness",
      "rewrite": "complete, professional, and natural-sounding bias-free rewrite evaluating skills only"
    }
  ]
}`;

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
}

function getGemini(apiKey) {
  return new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY || "");
}

async function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

function cleanJsonString(str) {
  // Removes potential Markdown code blocks if AI returns them
  return str.replace(/```json\n?|```\n?/g, "").trim();
}

async function callGemini(text, apiKey = null) {
  const genAI = getGemini(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: { 
      responseMimeType: "application/json",
      temperature: 0.1,
      topP: 0.9,
      maxOutputTokens: 1000
    }
  });
  
  const prompt = `${SYSTEM_PROMPT}\n\nUSER INPUT:\n${text}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();
  try {
    return JSON.parse(cleanJsonString(rawText));
  } catch (err) {
    console.error("Gemini Parse Error. Raw text:", rawText);
    throw new Error("Failed to parse AI response as JSON.");
  }
}

async function callOpenAI(text) {
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

function cleanAIResponse(data, originalText) {
  const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
  
  if (rawQuestions.length === 0) {
    return {
      overall_bias_score: data.overall_bias_score || 0,
      risk_level: data.risk_level || "low",
      summary: data.summary || "No significant bias detected.",
      top_insights: Array.isArray(data.top_insights) ? data.top_insights : ["No bias patterns detected."],
      questions: [],
      is_fallback: false
    };
  }

  const approvedCategories = ["gender", "age", "cultural", "work_life", "socioeconomic", "health", "tone", "harassment"];

  const cleanedQuestions = rawQuestions.map((q) => {
    const score = Number(q.bias_score) || 0;
    const isClean = score <= 2;
    
    const validCategories = Array.isArray(q.bias_type) ? q.bias_type.filter((t) => approvedCategories.includes(t)) : [];

    // Less aggressive cleaning: if AI provided a rewrite and explanation, trust it.
    if (!isClean && (!q.rewrite || q.rewrite === q.question)) {
      // If AI failed to provide a quality rewrite for biased content
      return {
        ...q,
        bias_score: score,
        issue: q.issue || "Contextual bias",
        explanation: q.explanation || "No clear linguistic evidence of bias found.",
        impact: q.impact || "May inadvertently discourage candidates.",
        rewrite: q.rewrite || q.question || originalText
      };
    }
    
    return { 
      ...q, 
      bias_score: score,
      bias_type: validCategories.length > 0 ? validCategories : (score > 2 ? ["tone"] : [])
    };
  });

  const totalScore = cleanedQuestions.reduce((sum, q) => sum + (q.bias_score || 0), 0);
  const avgScore = totalScore / cleanedQuestions.length;

  let riskLevel = "low";
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

async function validateWithAI(text, hints) {
  const timeoutMs = 15000;
  const augmentedText = hints.length > 0 
    ? `${text}\n\n[RULE-BASED HINTS:\n${hints.join("\n")}]`
    : text;

  try {
    console.log("AI Pipeline: Trying Primary Gemini...");
    const result = await withTimeout(callGemini(augmentedText), timeoutMs);
    return cleanAIResponse(result, text);
  } catch (e) {
    if (process.env.GEMINI_API_KEY_SECONDARY) {
      try {
        console.log("AI Pipeline: Falling back to Secondary Gemini...");
        const result = await withTimeout(callGemini(augmentedText, process.env.GEMINI_API_KEY_SECONDARY), timeoutMs);
        return cleanAIResponse(result, text);
      } catch (e2) {
        console.error("AI Pipeline: Secondary Gemini also failed:", e2.message);
      }
    }

      // GROK FALLBACK (SECONDARY)
      if (process.env.GROK_API_KEY) {
        try {
          console.log("AI Pipeline: Falling back to Grok (xAI)...");
          const grok = new OpenAI({ apiKey: process.env.GROK_API_KEY, baseURL: "https://api.x.ai/v1" });
          const completion = await withTimeout(grok.chat.completions.create({
            model: "grok4.20",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: `USER INPUT:\n${augmentedText}` },
            ],
          }), timeoutMs);
          return cleanAIResponse(JSON.parse(completion.choices[0].message.content), text);
        } catch (eGrok) {
          console.error("AI Pipeline: Grok also failed:", eGrok.message);
        }
      }

      // OPENAI FALLBACK (TERNARY)
      try {
        console.log("AI Pipeline: Falling back to OpenAI...");
        const result = await withTimeout(callOpenAI(augmentedText), timeoutMs);
        return cleanAIResponse(result, text);
      } catch (eOpenAI) {
        console.error("AI Pipeline: OpenAI also failed:", eOpenAI.message);
      }
      
      throw new Error("AI Validation Failed Across All Providers (Gemini, Grok, OpenAI)");
    }
  }
}

async function callOpenAIKit(role, experience, company, goals) {
  const openai = getOpenAI();
  const sysPrompt = `You are an expert HR instructional designer. Create a highly professional, entirely bias-free interview kit.
Return strict JSON:
{
  "job_description_snippet": "1 paragraph inclusive summary",
  "questions": ["Q1...", "Q2...", "Q3...", "Q4...", "Q5..."],
  "evaluation_rubric": [{"criteria": "...", "look_for": "...", "avoid": "..."}]
}`;

  const prompt = `Role: ${role}\nExperience: ${experience}\nCompany context: ${company}\nDiversity goals: ${goals || "Standard inclusive hiring"}`;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: sysPrompt },
      { role: "user", content: prompt },
    ],
  });

  const output = completion.choices[0].message.content;
  return JSON.parse(output);
}

function getStaticKitTemplate(role) {
  return {
    "job_description_snippet": `We are looking for a ${role} to join our inclusive team. This role focuses on technical excellence, collaborative problem-solving, and professional growth in a supportive environment.`,
    "questions": [
      "Can you describe a complex technical challenge you solved recently and the impact it had?",
      "How do you approach learning new technologies and integrating them into your workflow?",
      "What strategies do you use to ensure your code is maintainable and well-documented?",
      "Tell me about a time you collaborated with a diverse team to achieve a common goal.",
      "How do you handle constructive feedback and use it to improve your work?"
    ],
    "evaluation_rubric": [
      {
        "criteria": "Technical Proficiency",
        "look_for": "Clear explanation of technical concepts and problem-solving methodology.",
        "avoid": "Biases related to specific education paths vs practical experience."
      },
      {
        "criteria": "Team Collaboration",
        "look_for": "Evidence of inclusive communication and support for teammates.",
        "avoid": "Confusing 'culture fit' with shared professional values."
      }
    ]
  };
}

async function generateKit(role, experience, company, goals) {
  const tryGemini = async (apiKey, modelName = "gemini-2.0-flash") => {
    const keyLabel = apiKey === process.env.GEMINI_API_KEY ? 'Primary' : 'Secondary';
    console.log(`-> Kit Gen: Trying Gemini ${modelName} (${keyLabel}) [Key: ${apiKey?.substring(0,6)}...]`);
    
    if (!apiKey) throw new Error(`${keyLabel} Gemini Key is missing in .env`);

    const genAI = getGemini(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName, 
      generationConfig: { responseMimeType: "application/json", temperature: 0.6 }
    });

    const sysPrompt = `You are an expert HR instructional designer. Create a highly professional, entirely bias-free interview kit.
Return strict JSON:
{
  "job_description_snippet": "1-2 sentence inclusive summary",
  "questions": ["Q1...", "Q2...", "Q3...", "Q4...", "Q5..."],
  "evaluation_rubric": [{"criteria": "...", "look_for": "...", "avoid": "..."}]
}`;

    const prompt = `Role: ${role}\nExperience: ${experience}\nCompany: ${company}\nDiversity goals: ${goals || "Standard inclusive hiring"}`;
    const result = await model.generateContent(`${sysPrompt}\n\nUSER:\n${prompt}`);
    const rawText = (await result.response).text();
    const parsed = JSON.parse(cleanJsonString(rawText));

    if (!parsed.questions) throw new Error("AI returned empty question list");
    return parsed;
  };

  const providers = [
    { type: 'gemini', key: process.env.GEMINI_API_KEY, model: 'gemini-2.0-flash' },
    { type: 'gemini', key: process.env.GEMINI_API_KEY, model: 'gemini-1.5-flash' },
    { type: 'gemini', key: process.env.GEMINI_API_KEY_SECONDARY, model: 'gemini-2.0-flash' },
    { type: 'gemini', key: process.env.GEMINI_API_KEY_SECONDARY, model: 'gemini-1.5-flash' },
    { type: 'openai' }
  ];

  let lastError = "";

  for (const provider of providers) {
    try {
      if (provider.type === 'gemini') {
        if (!provider.key) continue;
        return await tryGemini(provider.key, provider.model);
      } else {
        console.log(`-> Kit Gen: Final fallback trying OpenAI [Key: ${process.env.OPENAI_API_KEY?.substring(0,6)}...]`);
        if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI Key missing");
        return await callOpenAIKit(role, experience, company, goals);
      }
    } catch (err) {
      console.error(`Provider ${provider.type} (${provider.model || 'OpenAI'}) failed:`, err.message);
      lastError = err.message;
    }
  }

  console.warn("-> CRITICAL: All AI providers failed. Returning high-quality static template as fallback.");
  return getStaticKitTemplate(role);
}

module.exports = {
  validateWithAI,
  generateKit
};
