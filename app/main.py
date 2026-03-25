import subprocess
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from app.routes import risk, ai, agent, analytics, alerts
from app.db import engine
from app.models.transaction import TransactionLog
from app.utils.logger import get_logs
from app.utils.logger import log_transaction


# create tables automatically on startup
TransactionLog.metadata.create_all(bind=engine)


def ensure_transaction_log_columns() -> None:
    inspector = inspect(engine)
    if "transaction_logs" not in inspector.get_table_names():
        return

    existing_columns = {col["name"] for col in inspector.get_columns("transaction_logs")}
    with engine.begin() as conn:
        if "tx_hash" not in existing_columns:
            conn.execute(text("ALTER TABLE transaction_logs ADD COLUMN tx_hash VARCHAR(100)"))
        if "tx_status" not in existing_columns:
            conn.execute(text("ALTER TABLE transaction_logs ADD COLUMN tx_status VARCHAR(20)"))


ensure_transaction_log_columns()

app = FastAPI(title="Guardian AI Wallet Backend", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk.router)
app.include_router(ai.router)
app.include_router(agent.router)
app.include_router(analytics.router)
app.include_router(alerts.router)


@app.get("/", tags=["health"])
async def root() -> dict:
    """Basic health check endpoint."""
    return {"message": "Guardian AI Backend Running"}


@app.get("/logs", tags=["logs"])
async def read_logs() -> dict:
    """Retrieve the in-memory transaction logs."""
    return {"logs": get_logs()}


@app.post("/logs", tags=["logs"])
async def create_log(payload: dict) -> dict:
    """Persist a transaction log record."""
    log_transaction(payload)
    return {"status": "ok"}


@app.post("/playground/compile", tags=["playground"])
async def compile_contracts() -> dict:
    """Compile contracts using Hardhat from workspace root."""
    workspace_root = Path(__file__).resolve().parent.parent
    result = subprocess.run(
        ["npm", "run", "compile"],
        cwd=str(workspace_root),
        capture_output=True,
        text=True,
        timeout=180,
    )

    return {
        "success": result.returncode == 0,
        "exit_code": result.returncode,
        "stdout": result.stdout[-6000:],
        "stderr": result.stderr[-6000:],
    }

