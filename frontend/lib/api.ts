import { API_BASE_URL } from "./config";

export const API_BASE = API_BASE_URL;

async function fetchWithAuth(endpoint: string, options: RequestInit = {}, token?: string | null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };

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
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function analyzeQuestions(text: string, token?: string | null, name?: string) {
  return fetchWithAuth("/analyze", {
    method: "POST",
    body: JSON.stringify({ text, name }),
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
