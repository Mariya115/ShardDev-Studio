from fastapi import APIRouter, HTTPException
from app.models.schemas import RiskRequest, RiskResponse
from app.services.risk_engine import analyze_risk
from app.utils.logger import log_transaction

router = APIRouter(prefix="/risk", tags=["risk"])


@router.post("/check", response_model=RiskResponse)
async def check_risk(request: RiskRequest) -> RiskResponse:
    """Analyze transaction risk and return a structured risk result."""
    if request.amount < 0:
        raise HTTPException(status_code=400, detail="Amount must be non-negative")

    decision = analyze_risk(request.address, request.amount)

    log_transaction({
        "address": request.address,
        "amount": request.amount,
        "risk": decision["risk"],
        "score": decision["score"],
        "decision": None,
    })

    return RiskResponse(
        risk=decision["risk"],
        score=decision["score"],
        reasons=decision["reasons"],
        recommendation=decision["recommendation"],
    )
