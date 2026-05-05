from __future__ import annotations

import re

WORD_RE = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?|[가-힣]{2,}")
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+|\n+")

EN_STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "were",
    "will",
    "with",
}

KO_STOPWORDS = {
    "것",
    "수",
    "등",
    "및",
    "그",
    "이",
    "저",
    "더",
    "좀",
    "또",
    "하는",
    "하다",
}


def detect_language(text: str) -> str:
    has_ko = bool(re.search(r"[가-힣]", text))
    has_en = bool(re.search(r"[A-Za-z]", text))
    if has_ko and has_en:
        return "mixed"
    if has_ko:
        return "ko"
    return "en"


def split_sentences(text: str) -> list[str]:
    parts = [chunk.strip() for chunk in SENTENCE_SPLIT_RE.split(text) if chunk.strip()]
    return parts or ([text.strip()] if text.strip() else [])


def tokenize_words(text: str) -> list[str]:
    return [match.group(0).lower() for match in WORD_RE.finditer(text)]


def normalize_tokens(tokens: list[str], language: str) -> list[str]:
    stopwords = EN_STOPWORDS if language == "en" else KO_STOPWORDS if language == "ko" else EN_STOPWORDS | KO_STOPWORDS
    return [token for token in tokens if len(token) > 1 and token not in stopwords]
