from typing import Any, Dict, List
from sqlalchemy.exc import SQLAlchemyError
from app.db import SessionLocal
from app.models.transaction import TransactionLog


def log_transaction(data: Dict[str, Any]) -> None:
    """Log a transaction to the database."""
    db = SessionLocal()
    try:
        entry = TransactionLog(
            address=data.get("address"),
            amount=data.get("amount"),
            risk=data.get("risk", "UNKNOWN"),
            score=data.get("score", 0),
            decision=data.get("decision"),
            tx_hash=data.get("tx_hash"),
            tx_status=data.get("status") or data.get("tx_status"),
        )
        db.add(entry)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise
    finally:
        db.close()


def get_all_logs() -> List[Dict[str, Any]]:
    """Retrieve all transaction logs from the database."""
    db = SessionLocal()
    try:
        records = db.query(TransactionLog).order_by(TransactionLog.timestamp.desc()).all()
        return [
            {
                "id": r.id,
                "timestamp": r.timestamp.isoformat() + "Z",
                "address": r.address,
                "amount": r.amount,
                "risk": r.risk,
                "score": r.score,
                "decision": r.decision,
                "tx_hash": r.tx_hash,
                "tx_status": r.tx_status,
            }
            for r in records
        ]
    finally:
        db.close()


def get_stats() -> Dict[str, Any]:
    """Return aggregated stats for analytics."""
    db = SessionLocal()
    try:
        total = db.query(TransactionLog).count()
        high = db.query(TransactionLog).filter(TransactionLog.risk == "HIGH").count()
        medium = db.query(TransactionLog).filter(TransactionLog.risk == "MEDIUM").count()
        low = db.query(TransactionLog).filter(TransactionLog.risk == "LOW").count()
        return {
            "total_transactions": total,
            "high_risk_count": high,
            "medium_risk_count": medium,
            "low_risk_count": low,
        }
    finally:
        db.close()


def get_logs() -> List[Dict[str, Any]]:
    """Alias for get_all_logs() for backwards compatibility."""
    return get_all_logs()
