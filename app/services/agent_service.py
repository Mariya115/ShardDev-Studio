from typing import Any, Dict


def get_agent_decision(risk: str, score: int) -> Dict[str, Any]:
	normalized_risk = (risk or "").upper()

	if normalized_risk == "HIGH" or score >= 70:
		return {
			"decision": "REJECT",
			"confidence": 92,
			"reasoning": "High risk score indicates strong fraud/security signals.",
		}

	if normalized_risk == "MEDIUM" or score >= 40:
		return {
			"decision": "REVIEW",
			"confidence": 76,
			"reasoning": "Moderate risk requires additional verification before execution.",
		}

	return {
		"decision": "APPROVE",
		"confidence": 95,
		"reasoning": "Low risk profile detected with minimal threat indicators.",
	}

