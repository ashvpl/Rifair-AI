import { AIGateway } from '../aiGateway';
import 'server-only';

export async function regenerateQuestion(data: {
  role: string;
  experience: string;
  companyType: string;
  industry: string;
  originalQuestion: any;
  focus?: string;
  exclude: string[];
}) {
  const { role, experience, companyType, industry, originalQuestion, focus, exclude } = data;

  const focusInstruction = focus ? {
    technical: 'Make this more technically deep and specific. Include implementation details.',
    behavioral: 'Make this more focused on past behavior and soft skills. Use STAR format.',
    simplified: 'Simplify the language. Shorter, clearer, more direct.',
    probing: 'Add a natural follow-up probe that digs deeper into the answer.',
    role_specific: `Make this highly specific to ${role} at ${companyType} in ${industry}.`
  }[focus as keyof typeof focus] || '' : 'Generate a fresh variation that tests the same competency but from a different angle.';

  const prompt = `You are an expert interviewer regenerating a question for a ${role} position (${experience} years experience, ${companyType}, ${industry}).

Original question: "${originalQuestion.question}"
Original type: ${originalQuestion.type}
Original competency: ${originalQuestion.competency}

${focusInstruction}

CRITICAL RULES:
- Must be different from these existing questions: ${JSON.stringify(exclude)}
- Must be high quality and specific

Return JSON:
{
  "question": "the new question text",
  "type": "${originalQuestion.type}",
  "competency": "${originalQuestion.competency}",
  "why_this_question": "...",
  "strong_answer_includes": [],
  "red_flags": "",
  "time_minutes": 10,
  "difficulty": "intermediate"
}`;

  const result = await AIGateway.call(prompt, {
    temperature: 0.7,
    jsonMode: true
  });

  return JSON.parse(result);
}
