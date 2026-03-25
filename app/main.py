from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import risk, ai, agent, analytics, alerts
from app.db import engine
from app.models.transaction import TransactionLog
from app.utils.logger import get_logs


# create tables automatically on startup
TransactionLog.metadata.create_all(bind=engine)

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
