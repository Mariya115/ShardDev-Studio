/**
 * Guardian AI Backend API Service
 * Connects frontend to FastAPI backend running on localhost:8000
 */

const BASE_URL = "http://127.0.0.1:8000";

export interface RiskCheckData {
  address: string;
  amount: number;
}

export interface RiskResponse {
  risk: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  reasons: string[];
  recommendation: string;
}

export interface AIExplainRequest {
  address: string;
  amount: number;
  risk: string;
  score: number;
  reasons: string[];
}

export interface AIResponse {
  explanation: string;
  advice: string;
  risk_summary: string;
}

export interface AgentRequest {
  risk: string;
  score: number;
  address?: string;
  amount?: number;
}

export interface AgentResponse {
  decision: "APPROVE" | "REVIEW" | "REJECT";
  confidence: number;
  reasoning: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  address: string | null;
  amount: number | null;
  risk: string;
  score: number;
  decision: string | null;
}

export interface AnalyticsStats {
  total_transactions: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
}

/**
 * Check transaction risk with the backend risk engine
 */
export async function checkRisk(data: RiskCheckData): Promise<RiskResponse> {
  try {
    const res = await fetch(`${BASE_URL}/risk/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Risk check failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("checkRisk error:", error);
    throw error;
  }
}

/**
 * Get AI explanation for the risk result
 */
export async function getAIExplanation(data: AIExplainRequest): Promise<AIResponse> {
  try {
    const res = await fetch(`${BASE_URL}/ai/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`AI explanation failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("getAIExplanation error:", error);
    throw error;
  }
}

/**
 * Get agent decision for the transaction
 */
export async function getAgentDecision(data: AgentRequest): Promise<AgentResponse> {
  try {
    const res = await fetch(`${BASE_URL}/agent/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Agent decision failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("getAgentDecision error:", error);
    throw error;
  }
}

/**
 * Get all logged transactions
 */
export async function getLogs(): Promise<{ logs: LogEntry[] }> {
  try {
    const res = await fetch(`${BASE_URL}/logs`);
    if (!res.ok) throw new Error(`Get logs failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("getLogs error:", error);
    throw error;
  }
}

/**
 * Get analytics statistics
 */
export async function getStats(): Promise<AnalyticsStats> {
  try {
    const res = await fetch(`${BASE_URL}/analytics/stats`);
    if (!res.ok) throw new Error(`Get stats failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("getStats error:", error);
    throw error;
  }
}

/**
 * Get transaction trends and last 7 transactions
 */
export async function getTrends(): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/analytics/trends`);
    if (!res.ok) throw new Error(`Get trends failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("getTrends error:", error);
    throw error;
  }
}

/**
 * Get all alerts
 */
export async function getAlerts(): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/alerts`);
    if (!res.ok) throw new Error(`Get alerts failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("getAlerts error:", error);
    throw error;
  }
}
