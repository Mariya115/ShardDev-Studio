from typing import Dict, List
from datetime import datetime
from app.db import SessionLocal
from app.models.transaction import TransactionLog


def get_alerts() -> List[Dict[str, str]]:
    db = SessionLocal()
    try:
        high_risk = (
            db.query(TransactionLog)
            .filter(TransactionLog.risk == "HIGH")
            .order_by(TransactionLog.timestamp.desc())
            .limit(20)
            .all()
        )

        alerts = []
        for tx in high_risk:
            alerts.append(
                {
                    "id": str(tx.id),
                    "timestamp": tx.timestamp.isoformat() + "Z" if isinstance(tx.timestamp, datetime) else "",
                    "address": tx.address or "",
                    "amount": str(tx.amount) if tx.amount is not None else "",
                    "risk": tx.risk,
                    "score": str(tx.score),
                    "message": "HIGH risk transaction detected. Review required.",
                }
            )
        return alerts
    finally:
        db.close()
