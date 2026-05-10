import { API_BASE_URL } from "./config";

export const API_BASE = API_BASE_URL;

async function fetchWithAuth(endpoint: string, options: RequestInit = {}, token?: string | null) {
  console.log(`[FRONTEND API DEBUG] Calling endpoint: ${endpoint}`);
  console.log(`[FRONTEND API DEBUG] Token passed to fetchWithAuth: ${token ? 'YES (length: ' + token.length + ')' : 'NO'}`);

  const isNextJsProxy = API_BASE === "/api" || API_BASE.startsWith("/");
  
  // NEVER send Authorization header to Next.js API routes.
  // Next.js uses the __session cookie to authenticate, and generates a fresh token server-side.
  // Passing the client token in the header forces Clerk to use stateless auth, which forwards the (potentially stale) client token to the backend.
  const includeAuthHeader = token && !isNextJsProxy;

  const headers = {
    "Content-Type": "application/json",
    ...(includeAuthHeader ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };

  console.log(`[FRONTEND API DEBUG] Authorization header attached: ${'Authorization' in headers ? 'YES' : 'NO'}`);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Safely parse JSON — the response may be an HTML error page (502, 504, etc.)
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON body (e.g. gateway error page)
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!response.ok) {
    const error: any = new Error(data?.message || data?.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.code = data?.error;
    error.planId = data?.planId;
    error.upgradeUrl = data?.upgradeUrl;
    error.teaser = data?.teaser;
    throw error;
  }

  return data;
}

export async function analyzeQuestions(text: string, token?: string | null, name?: string, mode?: string) {
  return fetchWithAuth("/analyze", {
    method: "POST",
    body: JSON.stringify({ text, name, mode: mode || "full" }),
  }, token);
}

export async function generateKit(data: any, token?: string | null) {
  return fetchWithAuth("/kit", {
    method: "POST",
    body: JSON.stringify(data),
  }, token);
}

export async function simulateBias(neutral_question: string, token?: string | null) {
  return fetchWithAuth("/simulate", {
    method: "POST",
    body: JSON.stringify({ neutral_question }),
  }, token);
}

export async function getReports(token?: string | null) {
  return fetchWithAuth("/reports", {
    method: "GET",
  }, token);
}

export async function deleteReports(token?: string | null) {
  return fetchWithAuth("/reports", {
    method: "DELETE",
  }, token);
}

export async function getReportById(id: string, token?: string | null) {
  return fetchWithAuth(`/report/${id}`, {
    method: "GET",
  }, token);
}

export async function deleteReportById(id: string, token?: string | null) {
  return fetchWithAuth(`/report/${id}`, {
    method: "DELETE",
  }, token);
}

export async function updateReportById(id: string, categories: any, token?: string | null) {
  return fetchWithAuth(`/report/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ categories }),
  }, token);
}

export async function evaluateCandidate(data: any, token?: string | null) {
  return fetchWithAuth("/evaluate-candidate", {
    method: "POST",
    body: JSON.stringify(data),
  }, token);
}

export async function getBiasSession(token?: string | null) {
  return fetchWithAuth("/bias-session", { method: "GET" }, token);
}

export async function batchAnalyze(questions: string[], token?: string | null, name?: string) {
  return fetchWithAuth("/analyze/batch", {
    method: "POST",
    body: JSON.stringify({ questions, name }),
  }, token);
}

export async function getBiasDna(token?: string | null) {
  return fetchWithAuth("/bias-dna", { method: "GET" }, token);
}
