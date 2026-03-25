from fastapi import APIRouter
from app.models.schemas import RiskRequest, RiskResponse
from app.services.risk_engine import analyze_risk

router = APIRouter(prefix="/risk", tags=["risk"])


@router.post("/check", response_model=RiskResponse)
async def check_risk(payload: RiskRequest) -> RiskResponse:
    result = analyze_risk(payload.address, payload.amount)
    return RiskResponse(**result)
