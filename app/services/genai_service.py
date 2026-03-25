import os
from typing import Any, Dict

try:
	from openai import OpenAI
except Exception:
	OpenAI = None


def _fallback_explanation(payload: Dict[str, Any]) -> Dict[str, str]:
	risk = payload.get("risk", "UNKNOWN")
	score = payload.get("score", 0)
	reasons = payload.get("reasons", [])
	reason_text = ", ".join(reasons) if reasons else "no significant factors"

	return {
		"explanation": f"Risk level is {risk} with score {score}. Key factors: {reason_text}.",
		"advice": "Verify recipient, send a small test amount first, and avoid unknown addresses.",
		"risk_summary": f"{risk} risk transaction.",
	}


def generate_ai_explanation(payload: Dict[str, Any]) -> Dict[str, str]:
	api_key = os.getenv("OPENAI_API_KEY")
	if not api_key or OpenAI is None:
		return _fallback_explanation(payload)

	try:
		client = OpenAI(api_key=api_key)
		prompt = (
			"You are a blockchain security analyst. Explain the transaction risk briefly and clearly. "
			f"Input data: {payload}"
		)
		response = client.chat.completions.create(
			model="gpt-4o-mini",
			messages=[
				{"role": "system", "content": "You are concise and practical."},
				{"role": "user", "content": prompt},
			],
			temperature=0.2,
		)
		text = (response.choices[0].message.content or "").strip()
		if not text:
			return _fallback_explanation(payload)

		return {
			"explanation": text,
			"advice": "Follow wallet safety checks before approving the transaction.",
			"risk_summary": f"{payload.get('risk', 'UNKNOWN')} risk transaction.",
		}
	except Exception:
		return _fallback_explanation(payload)

