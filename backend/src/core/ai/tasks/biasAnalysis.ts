import { AIGateway } from '../aiGateway';


const SYSTEM_PROMPT = `You are an AI system designed to deeply detect bias in interview questions.
DO NOT rely on keywords. Instead, analyze:
1. Intent of the question
2. Tone (neutral, doubtful, judgmental, exclusionary, aggressive, coercive)
3. Hidden assumptions (e.g., about personal life or limitations)
4. Whether the question evaluates skill OR personal circumstances

CLASSIFICATION & SCORING:
- Score 0-10: 0 for clean evaluation of skills, 8-10 for explicit exclusion or harassment.
- Return strict JSON matching the schema provided.`;

export async function analyzeBias(text: string, hints: string[] = []) {
  const prompt = `${SYSTEM_PROMPT}\n\n[RULE-BASED HINTS:\n${hints.join("\n")}]\n\nUSER INPUT:\n${text}`;
  
  const result = await AIGateway.call(prompt, {
    temperature: 0.1,
    jsonMode: true
  });

  return JSON.parse(result);
}
