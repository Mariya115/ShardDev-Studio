from typing import Dict
from app.db import SessionLocal
from app.models.transaction import TransactionLog


def agent_decision(risk: str, score: int, address: str, amount: float) -> Dict[str, object]:
    """Make a smarter agent decision using risk, amount, and frequency."""
    risk_upper = risk.upper()

    db = SessionLocal()
    try:
        frequency = 0
        if address:
            frequency = db.query(TransactionLog).filter(TransactionLog.address == address).count()
    finally:
        db.close()

    if score > 70:
        decision = "BLOCK"
    elif score > 30:
        decision = "REVIEW"
    else:
        decision = "APPROVE"

    if risk_upper == "HIGH":
        confidence = 90
    elif risk_upper == "MEDIUM":
        confidence = 75
    else:
        confidence = 95

    if amount > 5.0 and decision == "APPROVE":
        decision = "REVIEW"
        confidence = min(90, confidence)

    if frequency > 5 and decision == "APPROVE":
        decision = "REVIEW"
        confidence = 70

    reasoning = (
        f"risk={risk_upper}, score={score}, amount={amount}, frequency={frequency}. "
        f"Final decision={decision}, confidence={confidence}."
    )

    return {
        "decision": decision,
        "confidence": confidence,
        "reasoning": reasoning,
    }
