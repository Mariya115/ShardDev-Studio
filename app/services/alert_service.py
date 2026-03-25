from typing import Dict, List
from datetime import datetime
from app.db import SessionLocal
from app.models.transaction import TransactionLog


_alerts: List[Dict[str, str]] = []


def trigger_alert(transaction: TransactionLog) -> None:
    """Trigger and store a high-risk alert."""
    alert = {
        "id": len(_alerts) + 1,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "address": transaction.address,
        "amount": transaction.amount,
        "risk": transaction.risk,
        "score": transaction.score,
        "message": "HIGH risk transaction detected. Immediate review required.",
    }
    _alerts.append(alert)


def get_alerts() -> List[Dict[str, str]]:
    """Return current alert list."""
    return list(_alerts)


def check_and_alert(address: str, amount: float, risk: str, score: int, decision: str) -> None:
    """Helper to create alert for high risk transactions."""
    if risk == "HIGH" or decision == "BLOCK":
        db = SessionLocal()
        try:
            record = db.query(TransactionLog).filter(TransactionLog.address == address, TransactionLog.amount == amount, TransactionLog.score == score).order_by(TransactionLog.timestamp.desc()).first()
            if record:
                trigger_alert(record)
        finally:
            db.close()
