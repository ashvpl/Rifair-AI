export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

export async function analyzeQuestions(text: string, token?: string | null) {
  return fetchWithAuth("/analyze", {
    method: "POST",
    body: JSON.stringify({ text }),
  }, token);
}

export async function generateKit(data: any, token?: string | null) {
  return fetchWithAuth("/generate-kit", {
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
