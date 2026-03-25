from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db import Base


class TransactionLog(Base):
	__tablename__ = "transaction_logs"

	id = Column(Integer, primary_key=True, index=True)
	address = Column(String(100), nullable=True)
	amount = Column(Float, nullable=True)
	risk = Column(String(20), nullable=False)
	score = Column(Integer, nullable=False)
	decision = Column(String(20), nullable=True)
	timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
	tx_hash = Column(String(100), nullable=True)
	tx_status = Column(String(20), nullable=True)

