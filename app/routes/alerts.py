from fastapi import APIRouter
from app.services.alert_service import get_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
async def read_alerts() -> dict:
    """Return current alerts."""
    alerts = get_alerts()
    return {"alerts": alerts}
