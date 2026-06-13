import { API_BASE_URL } from "./config";

export const API_BASE = API_BASE_URL;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}, token?: string | null) {
  console.log(`[FRONTEND API DEBUG] Calling endpoint: ${endpoint}`);
  console.log(`[FRONTEND API DEBUG] Token passed to fetchWithAuth: ${token ? 'YES (length: ' + token.length + ')' : 'NO'}`);

  const isNextJsProxy = API_BASE === "/api" || API_BASE.startsWith("/");
  
  // Send Authorization header if token is available.
  // This helps Clerk middleware identify the request and avoids redirects for API routes.
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };

  console.log(`[FRONTEND API DEBUG] Authorization header attached: ${'Authorization' in headers ? 'YES' : 'NO'}`);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Safely parse JSON — the response may be an HTML error page (502, 504, etc.)
  let data: any = null;
  const text = await response.text();
  
  try {
    if (text) {
      data = JSON.parse(text);
    }
  } catch (e) {
    console.error(`[API ERROR] Failed to parse JSON response for ${endpoint} (Status: ${response.status})`);
    console.error(`[API ERROR] Raw response: ${text.slice(0, 200)}`);
    throw new Error(`Request failed with status ${response.status}: Invalid JSON response`);
  }

  if (!response.ok) {
    const error: any = new Error(data?.message || data?.error || text || `Request failed with status ${response.status}`);
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
  return fetchWithAuth(`/reports/${id}`, {
    method: "GET",
  }, token);
}

export async function deleteReportById(id: string, token?: string | null) {
  return fetchWithAuth(`/reports/${id}`, {
    method: "DELETE",
  }, token);
}

export async function updateReportById(id: string, categories: any, token?: string | null) {
  return fetchWithAuth(`/reports/${id}`, {
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
