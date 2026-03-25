from fastapi import APIRouter
from app.services.alert_service import get_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
async def read_alerts() -> dict:
    return {"alerts": get_alerts()}
