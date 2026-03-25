from fastapi import APIRouter
from app.models.schemas import AIExplainRequest, AIResponse
from app.services.genai_service import generate_explanation_llm

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/explain", response_model=AIResponse)
async def explain_ai(request: AIExplainRequest) -> AIResponse:
    """Generate AI-style explanation and advice for a risk result via LLM."""
    output = generate_explanation_llm(
        address=request.address,
        amount=request.amount,
        risk=request.risk,
        score=request.score,
        reasons=request.reasons,
    )

    return AIResponse(
        explanation=output["explanation"],
        advice=output["advice"],
        risk_summary=output.get("risk_summary", ""),
    )
