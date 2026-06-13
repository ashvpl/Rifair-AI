import { Router, type Request, type Response } from 'express';
import { AIGateway } from '../core/ai/aiGateway';
import { supabase } from '../config/supabase';
import { getSubscription } from '../services/subscriptionService';
import { parseJSON } from '../utils/parseJSON';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { requireAuth, authErrorHandler } = require('../middleware/auth');

const router = Router();

// Limit mapping based on plans
const WORKFLOW_LIMITS: Record<string, number | null> = {
  free: 1,
  lite: 3,
  starter: 5,
  growth: null, // unlimited
  enterprise: null, // unlimited
  internal_qa_plan: 5,
};

// ─── low-level helper for workflow limits ─────────────────────────────────────
async function checkWorkflowLimit(userId: string): Promise<{ allowed: boolean; limit: number | null; count: number }> {
  const sub = await getSubscription(userId);
  const planId = sub?.plan_id || 'free';
  const limit = WORKFLOW_LIMITS[planId] ?? 1;

  if (limit === null) {
    return { allowed: true, limit, count: 0 };
  }

  // Count active workflows
  const { count, error } = await supabase
    .from('hiring_workflows')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('[WORKFLOW LIMIT] Count error:', error.message);
    return { allowed: false, limit, count: 0 };
  }

  const currentCount = count || 0;
  return {
    allowed: currentCount < limit,
    limit,
    count: currentCount,
  };
}

// ─── POST /api/workflows/generate ─────────────────────────────────────────────
// Receives the workflow configurations and calls AI to generate the workflow JSON
router.post('/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.claims?.sub || 'anonymous';
    if (userId === 'anonymous') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check plan limits
    const { allowed, limit, count } = await checkWorkflowLimit(userId);
    if (!allowed) {
      return res.status(403).json({
        error: 'limit_reached',
        message: `You have reached your limit of ${limit} hiring workflow(s) on the free/starter plan. Please upgrade to Growth for unlimited workflows.`,
        currentCount: count,
        limit,
        upgradeUrl: '/pricing',
      });
    }

    const {
      roleTitle,
      seniorityLevel,
      department,
      employmentType,
      companyContext,
      jobDescription,
      mustHaveSkills,
      niceHaveSkills,
      interviewTypes,
      evaluationFocus,
    } = req.body;

    if (!roleTitle) {
      return res.status(400).json({ error: 'roleTitle is required' });
    }

    console.log(`[WORKFLOWS] Generating workflow for user=${userId}, role="${roleTitle}"`);

    // Build optimized and highly compact prompt to prevent burning API keys/quotas
    const prompt = `You are the world's leading HR tech architect and inclusive hiring specialist.
Generate a cohesive and structured hiring workflow for:
- Role: ${roleTitle} (${seniorityLevel || 'Mid-level'})
- Department: ${department || 'General'}
- Employment Type: ${employmentType || 'Full-time'}
- Company context: ${companyContext || 'A growing company'}
${jobDescription ? `- Job Description context: ${jobDescription}` : ''}
- Must-Have Skills: ${(mustHaveSkills || []).join(', ')}
- Nice-to-Have Skills: ${(niceHaveSkills || []).join(', ')}
- Interview Rounds: ${(interviewTypes || []).join(', ')}
- Evaluation Focus Criteria: ${(evaluationFocus || []).join(', ')}

Return ONLY a valid JSON object matching this schema exactly. Do NOT wrap it in markdown block.
JSON Schema:
{
  "hiring_health_score": <number 0 to 100 rating structural setup>,
  "optimized_jd": {
    "headline": "<1-line role headline that sells>",
    "full_jd": "<Job description in Markdown. Sections: # [Role] at [Company] (include Location/Work Mode), ## About Company, ## What You'll Do, ## What We're Looking For (Must-have / Nice-to-have), ## What We Offer, ## Our Hiring Process (specific steps), ## Apply Now (CTA). Clean, bias-free, inclusive language.>",
    "sections": {
      "about_company": "<summary>",
      "what_youll_do": ["responsibility 1", "responsibility 2", "responsibility 3"],
      "must_have": ["must-have requirement 1", "must-have requirement 2"],
      "nice_to_have": ["nice-to-have 1", "nice-to-have 2"],
      "what_we_offer": ["offer 1", "offer 2"],
      "hiring_process": "<summary>",
      "cta": "<CTA sentence>"
    },
    "bias_verification": {
      "bias_score": <0 to 100, 0 is best/cleanest>,
      "verified_clean": true,
      "inclusive_language_used": ["example 1", "example 2"],
      "requirements_calibration": "<notes on skill-based calibration>"
    },
    "conversion_insights": {
      "estimated_talent_pool_reach": "e.g. 85%",
      "gender_balance": "balanced|slight_masculine|slight_feminine",
      "top_strength": "<top selling feature>"
    }
  },
  "interview_kit": {
    "kit_title": "${roleTitle} Interview Kit",
    "estimated_duration_minutes": 45,
    "kit_summary": "<brief summary of evaluation structure>",
    "questions": [
      {
        "id": 1,
        "question": "<professional question testing a competency>",
        "type": "behavioral|technical|situational",
        "competency": "<competency targeted>",
        "time_minutes": 8,
        "difficulty": "intermediate",
        "expected_answer": "<key answer indicators>"
      }
    ]
  },
  "scorecard": {
    "criteria": [
      { "name": "<criteria name>", "description": "<description>", "weight": 1.0 }
    ]
  },
  "bias_review": {
    "score": <0 to 100, 0 is cleanest>,
    "issues": []
  },
  "evaluation_guide": {
    "overview": "<short instructions for hiring manager>",
    "do_list": ["Do 1", "Do 2"],
    "dont_list": ["Don't 1", "Don't 2"]
  }
}

Important details:
- Generate maximum 5 highly optimized questions in "interview_kit.questions" to keep the payload size small and prevent burning quota.
- Create 4 specific competency criteria in "scorecard.criteria".
- Return JSON only. No extra text, conversational prefixes, or formatting markdown.`;

    let rawResult;
    try {
      // Calls ProviderRouter under the hood starting with primary Groq, fallback chain is automated
      rawResult = await AIGateway.call(prompt, {
        temperature: 0.3,
        jsonMode: true,
        maxTokens: 3500,
      });
    } catch (err: any) {
      if (err.message === 'ALL_KEYS_EXHAUSTED' || err.message === 'ALL_PROVIDERS_EXHAUSTED') {
        return res.status(503).json({
          error: 'api_quota_exceeded',
          message: 'AI API limits reached. Please try again in 1 hour.',
        });
      }
      throw err;
    }

    const parsedResult = parseJSON(rawResult);
    return res.json(parsedResult);

  } catch (err: any) {
    console.error('[WORKFLOWS GENERATE ERROR]', err.message);
    res.status(500).json({ error: 'Generation failed', details: err.message });
  }
});

// ─── POST /api/workflows ──────────────────────────────────────────────────────
// Saves a new workflow configuration and outputs
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.claims?.sub || 'anonymous';
    if (userId === 'anonymous') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { config, outputs } = req.body;
    if (!config || !config.roleTitle || !outputs) {
      return res.status(400).json({ error: 'Config (roleTitle) and outputs are required' });
    }

    // Insert into hiring_workflows
    const { data: savedWf, error: wfError } = await supabase
      .from('hiring_workflows')
      .insert([{
        user_id: userId,
        role_title: config.roleTitle,
        seniority_level: config.seniorityLevel || null,
        department: config.department || null,
        employment_type: config.employmentType || null,
        company_context: config.companyContext || null,
        job_description: config.jobDescription || null,
        must_have_skills: config.mustHaveSkills || [],
        nice_to_have_skills: config.niceHaveSkills || [],
        interview_types: config.interviewTypes || [],
        evaluation_focus: config.evaluationFocus || [],
        status: config.status || 'draft',
        hiring_health_score: outputs.hiring_health_score || null,
      }])
      .select()
      .single();

    if (wfError) {
      console.error('[WORKFLOWS SAVE ERROR] hiring_workflows:', wfError.message);
      return res.status(500).json({ error: 'Failed to save workflow config', details: wfError.message });
    }

    // Insert into workflow_outputs
    const { data: savedOut, error: outError } = await supabase
      .from('workflow_outputs')
      .insert([{
        workflow_id: savedWf.id,
        user_id: userId,
        optimized_jd: outputs.optimized_jd || null,
        interview_kit: outputs.interview_kit || null,
        scorecard: outputs.scorecard || null,
        bias_review: outputs.bias_review || null,
        evaluation_guide: outputs.evaluation_guide || null,
      }])
      .select()
      .single();

    if (outError) {
      console.error('[WORKFLOWS SAVE ERROR] workflow_outputs:', outError.message);
      // Clean up orphaned configuration
      await supabase.from('hiring_workflows').delete().eq('id', savedWf.id);
      return res.status(500).json({ error: 'Failed to save workflow outputs', details: outError.message });
    }

    res.json({
      success: true,
      workflow: savedWf,
      outputs: savedOut,
    });

  } catch (err: any) {
    console.error('[WORKFLOWS CREATE ERROR]', err.message);
    res.status(500).json({ error: 'Failed to create workflow', details: err.message });
  }
});

// ─── GET /api/workflows ───────────────────────────────────────────────────────
// Lists all workflows for the user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.claims?.sub || 'anonymous';
    if (userId === 'anonymous') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: workflows, error } = await supabase
      .from('hiring_workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[WORKFLOWS GET ERROR]', error.message);
      return res.status(500).json({ error: 'Failed to fetch workflows', details: error.message });
    }

    res.json(workflows || []);
  } catch (err: any) {
    console.error('[WORKFLOWS LIST ERROR]', err.message);
    res.status(500).json({ error: 'Failed to list workflows', details: err.message });
  }
});

// ─── GET /api/workflows/:id ───────────────────────────────────────────────────
// Fetches a single workflow configuration and its matching outputs
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.claims?.sub || 'anonymous';
    const { id } = req.params;

    if (userId === 'anonymous') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get configuration
    const { data: config, error: configError } = await supabase
      .from('hiring_workflows')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (configError || !config) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Get matching outputs
    const { data: outputs, error: outputsError } = await supabase
      .from('workflow_outputs')
      .select('*')
      .eq('workflow_id', id)
      .eq('user_id', userId)
      .single();

    res.json({
      config,
      outputs: outputs || null,
    });

  } catch (err: any) {
    console.error('[WORKFLOW DETAIL ERROR]', err.message);
    res.status(500).json({ error: 'Failed to fetch workflow details', details: err.message });
  }
});

// ─── DELETE /api/workflows/:id ────────────────────────────────────────────────
// Deletes a single workflow (triggers cascade delete on outputs and evaluations)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.claims?.sub || 'anonymous';
    const { id } = req.params;

    if (userId === 'anonymous') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('hiring_workflows')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[WORKFLOWS DELETE ERROR]', error.message);
      return res.status(500).json({ error: 'Failed to delete workflow', details: error.message });
    }

    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (err: any) {
    console.error('[WORKFLOWS DELETE ERROR]', err.message);
    res.status(500).json({ error: 'Failed to delete workflow', details: err.message });
  }
});

// ─── POST /api/workflows/:id/evaluate ─────────────────────────────────────────
// Submits a candidate evaluation linked to this workflow
router.post('/:id/evaluate', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.claims?.sub || 'anonymous';
    const { id } = req.params;

    if (userId === 'anonymous') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { candidateName, candidateEmail, scores, evidenceNotes, recommendation, finalSummary } = req.body;

    if (!candidateName || !scores) {
      return res.status(400).json({ error: 'candidateName and scores are required' });
    }

    const record = {
      workflow_id: id,
      user_id: userId,
      candidate_name: candidateName,
      candidate_email: candidateEmail || null,
      scores: scores,
      evidence_notes: evidenceNotes || {},
      recommendation: recommendation || 'HOLD',
      final_summary: finalSummary || null,
      kit_id: id, // compatibility fallback for legacy fields
      question_scores: scores, // compatibility mapping
    };

    const { data: savedEval, error: dbError } = await supabase
      .from('candidate_evaluations')
      .insert([record])
      .select()
      .single();

    if (dbError) {
      console.error('[WORKFLOWS EVALUATION SAVE ERROR]', dbError.message);
      return res.status(500).json({ error: 'Failed to save evaluation', details: dbError.message });
    }

    // Also persist to history (analysis_reports) for user timeline
    const historyRecord = {
      user_id: userId,
      input_text: `Candidate Evaluation: ${candidateName} for Workflow Role`,
      bias_score: 100, // placeholder default
      risk_level: 'low',
      categories: {
        analysis_type: 'evaluation',
        evaluation_data: record,
        role: 'Workflow Candidate',
        candidate_name: candidateName,
        workflow_id: id,
      },
      created_at: new Date().toISOString(),
    };

    await supabase.from('analysis_reports').insert([historyRecord]);

    res.json({ success: true, evaluation: savedEval });

  } catch (err: any) {
    console.error('[WORKFLOW EVAL CREATE ERROR]', err.message);
    res.status(500).json({ error: 'Failed to submit evaluation', details: err.message });
  }
});

// ─── GET /api/workflows/:id/evaluations ───────────────────────────────────────
// Lists all candidate evaluations for a workflow
router.get('/:id/evaluations', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.claims?.sub || 'anonymous';
    const { id } = req.params;

    if (userId === 'anonymous') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: evaluations, error } = await supabase
      .from('candidate_evaluations')
      .select('*')
      .eq('workflow_id', id)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[WORKFLOW EVAL GET ERROR]', error.message);
      return res.status(500).json({ error: 'Failed to fetch evaluations', details: error.message });
    }

    res.json(evaluations || []);
  } catch (err: any) {
    console.error('[WORKFLOW EVAL LIST ERROR]', err.message);
    res.status(500).json({ error: 'Failed to list evaluations', details: err.message });
  }
});

router.use(authErrorHandler);

export default router;
