const BASE_URL = "http://127.0.0.1:8000";

type RiskRequest = {
  address: string;
  amount: number;
};

type AIExplainRequest = {
  address: string;
  amount: number;
  risk: string;
  score: number;
  reasons: string[];
};

type AgentRequest = {
  risk: string;
  score: number;
  address?: string;
  amount?: number;
};

type LogRequest = {
  address?: string;
  amount?: number;
  risk?: string;
  score?: number;
  decision?: string;
  tx_hash?: string;
  tx_status?: string;
  status?: string;
};

export async function checkRisk(data: RiskRequest) {
  const res = await fetch(`${BASE_URL}/risk/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Risk check failed: ${res.status}`);
  return res.json();
}

export async function getAIExplanation(data: AIExplainRequest) {
  const res = await fetch(`${BASE_URL}/ai/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`AI explanation failed: ${res.status}`);
  return res.json();
}

export async function getAgentDecision(data: AgentRequest) {
  const res = await fetch(`${BASE_URL}/agent/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Agent decision failed: ${res.status}`);
  return res.json();
}

export async function getLogs() {
  const res = await fetch(`${BASE_URL}/logs`);
  if (!res.ok) throw new Error(`Get logs failed: ${res.status}`);
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${BASE_URL}/analytics/stats`);
  if (!res.ok) throw new Error(`Get stats failed: ${res.status}`);
  return res.json();
}

export async function postLog(data: LogRequest) {
  const res = await fetch(`${BASE_URL}/logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Post log failed: ${res.status}`);
  return res.json();
}

export async function compileContracts() {
  const res = await fetch(`${BASE_URL}/playground/compile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Compile failed: ${res.status}`);
  return res.json();
}
