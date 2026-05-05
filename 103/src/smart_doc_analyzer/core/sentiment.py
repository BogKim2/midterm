from __future__ import annotations

from smart_doc_analyzer.core.models import SentimentResult

POSITIVE_WORDS = {
    "good",
    "great",
    "excellent",
    "positive",
    "success",
    "happy",
    "improve",
    "strong",
    "benefit",
    "effective",
}

NEGATIVE_WORDS = {
    "bad",
    "poor",
    "negative",
    "failure",
    "risk",
    "problem",
    "sad",
    "weak",
    "issue",
    "difficult",
}


def analyze_sentiment(tokens: list[str], language: str) -> SentimentResult:
    if language == "ko":
        return SentimentResult(None, None, "Informational", "rule-based")

    if not tokens:
        return SentimentResult(0.0, 0.0, "Neutral", "rule-based")

    positive = sum(1 for token in tokens if token in POSITIVE_WORDS)
    negative = sum(1 for token in tokens if token in NEGATIVE_WORDS)
    polarity = (positive - negative) / max(len(tokens), 1)
    subjectivity = (positive + negative) / max(len(tokens), 1)

    if polarity > 0.05:
        label = "Positive"
    elif polarity < -0.05:
        label = "Negative"
    else:
        label = "Neutral"

    return SentimentResult(round(polarity, 3), round(subjectivity, 3), label, "rule-based")
