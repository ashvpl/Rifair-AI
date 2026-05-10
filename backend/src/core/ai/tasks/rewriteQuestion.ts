import { AIGateway } from '../aiGateway';


export async function rewriteQuestion(data: {
  question: string;
  previousRewrite?: string;
}) {
  const { question, previousRewrite } = data;

  const prompt = `Rewrite this biased interview question to be fair and legally compliant.

Original: "${question}"
${previousRewrite ? `Previous rewrite (avoid this): "${previousRewrite}"` : ''}

Requirements:
- Remove all bias (gender, age, culture, appearance, etc.)
- Keep the same underlying competency assessment intent
- Make it specific and actionable
- Different from the previous rewrite if provided

Return JSON format: {"rewrite": "the new question text"}`;

  const result = await AIGateway.call(prompt, {
    temperature: 0.2,
    jsonMode: true
  });

  return JSON.parse(result);
}
