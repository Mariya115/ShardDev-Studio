from fastapi import APIRouter
from app.models.schemas import AgentRequest, AgentResponse
from app.services.agent_service import agent_decision

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/decision", response_model=AgentResponse)
async def decision_agent(request: AgentRequest) -> AgentResponse:
    """Make an AI agent decision for a risk result."""
    decision_data = agent_decision(request.risk, request.score, None, 0)

    return AgentResponse(
        decision=decision_data["decision"],
        confidence=decision_data["confidence"],
        reasoning=decision_data["reasoning"],
    )

    return AgentResponse(
        decision=decision_data["decision"],
        confidence=decision_data["confidence"],
        reasoning=decision_data["reasoning"],
    )
