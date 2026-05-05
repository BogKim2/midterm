from __future__ import annotations

import json
import re

from smart_doc_analyzer.core.models import BasicStats, LlmInsightResult


def build_excerpt(text: str, max_chars: int = 1800) -> str:
    compact = " ".join(text.split())
    return compact[:max_chars]


def build_prompt(text: str, stats: BasicStats, keywords: list[tuple[str, int]]) -> str:
    excerpt = build_excerpt(text)
    return (
        "You are analyzing a local document. Return valid JSON only.\n"
        "Keys: summary, tone, insights, semantic_keywords.\n"
        "summary must be at most 3 sentences.\n"
        "insights must be a list of up to 5 short strings.\n"
        "semantic_keywords must be a list of up to 10 short strings.\n"
        f"Stats: words={stats.word_count}, sentences={stats.sentence_count}, paragraphs={stats.paragraph_count}.\n"
        f"Top keywords: {keywords}\n"
        f"Text excerpt:\n{excerpt}"
    )


def parse_llm_json(payload: dict) -> LlmInsightResult:
    return LlmInsightResult(
        summary=str(payload.get("summary", "")).strip(),
        tone=str(payload.get("tone", "")).strip(),
        insights=[str(item).strip() for item in payload.get("insights", []) if str(item).strip()][:5],
        semantic_keywords=[str(item).strip() for item in payload.get("semantic_keywords", []) if str(item).strip()][:10],
        llm_used=True,
        llm_error=None,
    )


def _extract_json_candidate(text: str) -> str:
    fenced = re.search(r"```json\s*(\{.*?\})\s*```", text, flags=re.DOTALL | re.IGNORECASE)
    if fenced:
        return fenced.group(1)

    start = text.find("{")
    while start != -1:
        depth = 0
        for index in range(start, len(text)):
            char = text[index]
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    return text[start : index + 1]
        start = text.find("{", start + 1)
    return text


def parse_llm_response(content: str) -> LlmInsightResult:
    return parse_llm_json(json.loads(_extract_json_candidate(content)))
