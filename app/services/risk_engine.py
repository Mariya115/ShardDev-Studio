from typing import Any, Dict, List


def _is_invalid_address(address: str) -> bool:
    if not address or not isinstance(address, str):
        return True
    return not (address.startswith("0x") and len(address) == 42)


def analyze_risk(address: str, amount: float) -> Dict[str, Any]:
    score = 0
    reasons: List[str] = []

    if amount > 1.0:
        score += 50
        reasons.append("Large transaction amount")
    elif amount > 0.5:
        score += 30
        reasons.append("Moderate transaction amount")

    if _is_invalid_address(address):
        score += 40
        reasons.append("Invalid wallet address format")

    if address.lower() == "0x0000000000000000000000000000000000000000":
        score += 80
        reasons.append("Null/burn address detected")

    if score >= 70:
        risk = "HIGH"
        recommendation = "Block transaction and escalate for manual review"
    elif score >= 40:
        risk = "MEDIUM"
        recommendation = "Proceed with caution after verification"
    else:
        risk = "LOW"
        recommendation = "Safe to proceed"

    if not reasons:
        reasons.append("No major risk indicators found")

    return {
        "risk": risk,
        "score": score,
        "reasons": reasons,
        "recommendation": recommendation,
    }
