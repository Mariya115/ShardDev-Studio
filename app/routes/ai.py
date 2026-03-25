from fastapi import APIRouter
from app.models.schemas import AIExplainRequest, AIResponse
from app.services.genai_service import generate_ai_explanation

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/explain", response_model=AIResponse)
async def explain_risk(payload: AIExplainRequest) -> AIResponse:
	result = generate_ai_explanation(payload.model_dump())
	return AIResponse(**result)

