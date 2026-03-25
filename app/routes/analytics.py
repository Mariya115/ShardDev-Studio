from fastapi import APIRouter
from app.utils.logger import get_stats, get_all_logs

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/stats")
async def analytics_stats() -> dict:
    """Return aggregated analytics stats for transactions."""
    stats = get_stats()
    return stats


@router.get("/trends")
async def analytics_trends() -> dict:
    """Return recent transaction trends and risk distribution."""
    logs = get_all_logs()
    last_7 = logs[:7]

    risk_distribution = {
        "HIGH": sum(1 for x in logs if x["risk"] == "HIGH"),
        "MEDIUM": sum(1 for x in logs if x["risk"] == "MEDIUM"),
        "LOW": sum(1 for x in logs if x["risk"] == "LOW"),
    }

    timestamps = [entry["timestamp"] for entry in last_7]

    return {
        "last_7_transactions": last_7,
        "risk_distribution": risk_distribution,
        "timestamps": timestamps,
    }
