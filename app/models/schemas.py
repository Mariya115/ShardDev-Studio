from pydantic import BaseModel, Field
from typing import List


class RiskRequest(BaseModel):
    address: str = Field(..., description="The wallet address to evaluate")
    amount: float = Field(..., ge=0.0, description="Transaction amount in ETH/SHM")


class AIExplainRequest(BaseModel):
    address: str = Field(..., description="The wallet address involved in transaction")
    amount: float = Field(..., ge=0.0, description="Transaction amount")
    risk: str = Field(..., description="Risk level returned from risk engine")
    score: int = Field(..., description="Risk score returned from risk engine")
    reasons: List[str] = Field(..., description="Risk reasons returned from risk engine")


class AgentRequest(BaseModel):
    risk: str = Field(..., description="Risk level from risk engine")
    score: int = Field(..., ge=0, description="Risk score from risk engine")


class RiskResponse(BaseModel):
    risk: str
    score: int
    reasons: List[str]
    recommendation: str


class AIResponse(BaseModel):
    explanation: str
    advice: str
    risk_summary: str


class AgentResponse(BaseModel):
    decision: str
    confidence: int
    reasoning: str
