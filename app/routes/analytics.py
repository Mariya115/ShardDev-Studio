from fastapi import APIRouter
from app.utils.logger import get_stats, get_all_logs

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/stats")
async def analytics_stats() -> dict:
    return get_stats()


@router.get("/trends")
async def analytics_trends() -> dict:
    logs = get_all_logs()
    last_7 = logs[:7]
    risk_distribution = {
        "HIGH": sum(1 for item in logs if item["risk"] == "HIGH"),
        "MEDIUM": sum(1 for item in logs if item["risk"] == "MEDIUM"),
        "LOW": sum(1 for item in logs if item["risk"] == "LOW"),
    }

    return {
        "last_7_transactions": last_7,
        "risk_distribution": risk_distribution,
        "timestamps": [entry["timestamp"] for entry in last_7],
    }
