from __future__ import annotations

import json

import requests


class LlmClient:
    def __init__(self, endpoint: str, model_name: str, timeout_seconds: float, max_tokens: int) -> None:
        self.endpoint = endpoint.rstrip("/")
        self.model_name = model_name
        self.timeout_seconds = timeout_seconds
        self.max_tokens = max_tokens

    def analyze(self, prompt: str) -> str:
        response = requests.post(
            f"{self.endpoint}/chat/completions",
            timeout=self.timeout_seconds,
            headers={"Content-Type": "application/json"},
            json={
                "model": self.model_name,
                "temperature": 0.1,
                "max_tokens": self.max_tokens,
                "messages": [
                    {"role": "system", "content": "Respond with valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
            },
        )
        response.raise_for_status()
        payload = response.json()
        try:
            message = payload["choices"][0]["message"]
            content = message.get("content") or ""
            if content.strip():
                return content
            reasoning = message.get("reasoning_content") or ""
            if reasoning.strip():
                return reasoning
            raise ValueError("LM Studio returned neither content nor reasoning_content.")
        except (KeyError, IndexError, TypeError) as exc:
            raise ValueError(f"Unexpected LM Studio response: {json.dumps(payload)[:300]}") from exc
