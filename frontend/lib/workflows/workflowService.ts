import { fetchWithAuth } from "../api";
import {
  WorkflowBuilderInput,
  HiringWorkflowOutput,
  HiringWorkflowRow,
  WorkflowOutputRow,
} from "./types";

/**
 * Generate structured workflow via AI
 */
export async function generateWorkflow(
  input: WorkflowBuilderInput,
  token?: string | null
): Promise<HiringWorkflowOutput> {
  return fetchWithAuth(
    "/workflows/generate",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    token
  );
}

/**
 * Persist/save a workflow config and its AI outputs
 */
export async function saveWorkflow(
  config: WorkflowBuilderInput & { status?: string },
  outputs: HiringWorkflowOutput,
  token?: string | null
): Promise<{ success: boolean; workflow: HiringWorkflowRow; outputs: WorkflowOutputRow }> {
  return fetchWithAuth(
    "/workflows",
    {
      method: "POST",
      body: JSON.stringify({ config, outputs }),
    },
    token
  );
}

/**
 * List all saved workflows for the authenticated user
 */
export async function listWorkflows(token?: string | null): Promise<HiringWorkflowRow[]> {
  return fetchWithAuth("/workflows", { method: "GET" }, token);
}

/**
 * Get workflow configuration + AI generated sub-panels
 */
export async function getWorkflowDetails(
  id: string,
  token?: string | null
): Promise<{ config: HiringWorkflowRow; outputs: WorkflowOutputRow | null }> {
  return fetchWithAuth(`/workflows/${id}`, { method: "GET" }, token);
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(id: string, token?: string | null): Promise<{ success: boolean }> {
  return fetchWithAuth(
    `/workflows/${id}`,
    {
      method: "DELETE",
    },
    token
  );
}

/**
 * Save candidate evaluation for a workflow
 */
export async function submitWorkflowEvaluation(
  workflowId: string,
  evaluationData: {
    candidateName: string;
    candidateEmail?: string;
    scores: { criterionName: string; score: number; notes: string }[];
    evidenceNotes: Record<string, string>;
    recommendation: 'HIRE' | 'NO_HIRE' | 'STRONG_HIRE' | 'HOLD';
    finalSummary?: string;
  },
  token?: string | null
): Promise<{ success: boolean; evaluation: any }> {
  return fetchWithAuth(
    `/workflows/${workflowId}/evaluate`,
    {
      method: "POST",
      body: JSON.stringify(evaluationData),
    },
    token
  );
}

/**
 * List all candidate evaluations for a workflow
 */
export async function getWorkflowEvaluations(
  workflowId: string,
  token?: string | null
): Promise<any[]> {
  return fetchWithAuth(`/workflows/${workflowId}/evaluations`, { method: "GET" }, token);
}
