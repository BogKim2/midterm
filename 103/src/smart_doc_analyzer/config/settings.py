from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path


SETTINGS_PATH = Path("smart_doc_analyzer.settings.json")


@dataclass(slots=True)
class LlmSettings:
    enabled: bool = True
    endpoint: str = "http://127.0.0.1:1234/v1"
    model_name: str = "qwen/qwen3.6-35b-a3b"
    timeout_seconds: float = 20.0
    max_tokens: int = 1200


@dataclass(slots=True)
class AppSettings:
    llm: LlmSettings = field(default_factory=LlmSettings)

    @classmethod
    def load(cls) -> "AppSettings":
        if not SETTINGS_PATH.exists():
            return cls()
        raw = json.loads(SETTINGS_PATH.read_text(encoding="utf-8-sig"))
        llm_raw = raw.get("llm", {})
        return cls(llm=LlmSettings(**llm_raw))

    def save(self) -> None:
        SETTINGS_PATH.write_text(
            json.dumps(asdict(self), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
