from fastapi import APIRouter, HTTPException
from app.models.schemas import AgentRequest, AgentResponse
from app.services.agent_service import agent_decision
from app.utils.logger import log_transaction
from app.services.alert_service import check_and_alert

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/decision", response_model=AgentResponse)
async def decision_agent(request: AgentRequest) -> AgentResponse:
    """Make an AI agent decision for a risk result and log the transaction."""
    if not request.address or request.amount is None:
        raise HTTPException(status_code=400, detail="address and amount are required for agent decision")

    decision_data = agent_decision(request.risk, request.score, request.address, request.amount)

    log_transaction({
        "address": request.address,
        "amount": request.amount,
        "risk": request.risk,
        "score": request.score,
        "decision": decision_data["decision"],
    })

    check_and_alert(request.address, request.amount, request.risk, request.score, decision_data["decision"])

    return AgentResponse(
        decision=decision_data["decision"],
        confidence=decision_data["confidence"],
        reasoning=decision_data["reasoning"],
    )
