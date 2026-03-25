from fastapi import APIRouter
from app.models.schemas import AgentRequest, AgentResponse
from app.services.agent_service import get_agent_decision

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/decision", response_model=AgentResponse)
async def agent_decision(payload: AgentRequest) -> AgentResponse:
	result = get_agent_decision(payload.risk, payload.score)
	return AgentResponse(**result)

