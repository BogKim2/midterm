from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(slots=True)
class BasicStats:
    character_count: int
    word_count: int
    sentence_count: int
    paragraph_count: int
    unique_word_count: int
    average_sentence_length: float


@dataclass(slots=True)
class SentimentResult:
    polarity: float | None
    subjectivity: float | None
    label: str
    source: str


@dataclass(slots=True)
class ReadabilityResult:
    flesch_reading_ease: float | None
    grade: str
    description: str


@dataclass(slots=True)
class LlmInsightResult:
    summary: str = ""
    tone: str = ""
    insights: list[str] = field(default_factory=list)
    semantic_keywords: list[str] = field(default_factory=list)
    llm_used: bool = False
    llm_error: str | None = None


@dataclass(slots=True)
class AnalysisResult:
    source_name: str
    language: str
    elapsed_seconds: float
    stats: BasicStats
    wordcloud_tokens: list[str]
    keywords: list[tuple[str, int]]
    sentiment: SentimentResult
    readability: ReadabilityResult
    sentence_lengths: list[int]
    warnings: list[str]
    llm: LlmInsightResult

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
