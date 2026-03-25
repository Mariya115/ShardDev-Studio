from typing import Dict, Any


def analyze_risk(address: str, amount: float) -> Dict[str, Any]:
    """Analyze transaction risk based on simple rule engine.

    Args:
        address: Wallet address being evaluated.
        amount: Transaction amount.

    Returns:
        A dict with risk, score, reasons, and recommendation.
    """
    score = 0
    reasons = []

    if amount > 1.0:
        score += 50
        reasons.append("Transaction amount exceeds 1.0")
    elif amount > 0.5:
        score += 30
        reasons.append("Transaction amount exceeds 0.5")

    if not address.startswith("0x") or len(address) != 42:
        score += 40
        reasons.append("Invalid address format")

    if address.lower() == "0x0000000000000000000000000000000000000000":
        score += 80
        reasons.append("Blackhole address detected")

    if score > 70:
        risk = "HIGH"
        recommendation = "Do NOT proceed"
    elif score > 30:
        risk = "MEDIUM"
        recommendation = "Proceed with caution"
    else:
        risk = "LOW"
        recommendation = "Safe transaction"

    return {
        "risk": risk,
        "score": score,
        "reasons": reasons,
        "recommendation": recommendation,
    }
