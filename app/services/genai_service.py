import os
from typing import Dict, List
from openai import OpenAI

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None


def generate_explanation_llm(
    address: str,
    amount: float,
    risk: str,
    score: int,
    reasons: List[str],
) -> Dict[str, str]:
    """Generate explanation, advice, and summary using OpenAI LLM with safe fallback."""
    system_prompt = (
        "You are a blockchain security expert. "
        "Explain transaction risks clearly and give actionable advice."
    )

    user_prompt = f"""
Address: {address}
Amount: {amount}
Risk: {risk}
Score: {score}
Reasons: {', '.join(reasons)}

Provide:
1. Explanation
2. Advice
3. Risk summary
"""

    try:
        if client is None:
            raise Exception("OpenAI API key not configured")
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
        )

        text = response.choices[0].message.content.strip()

        return {
            "explanation": text,
            "advice": "Follow AI recommendation carefully",
            "risk_summary": risk,
        }

    except Exception:
        return {
            "explanation": f"Transaction risk is {risk}. Reasons: {', '.join(reasons)}",
            "advice": "Proceed carefully",
            "risk_summary": risk,
        }
