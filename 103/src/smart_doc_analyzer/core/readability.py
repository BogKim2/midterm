from __future__ import annotations

import re

from smart_doc_analyzer.core.models import ReadabilityResult
from smart_doc_analyzer.core.tokenizer import split_sentences, tokenize_words

VOWEL_GROUP_RE = re.compile(r"[aeiouy]+", re.IGNORECASE)


def _count_syllables(word: str) -> int:
    cleaned = re.sub(r"[^A-Za-z]", "", word).lower()
    if not cleaned:
        return 0
    groups = len(VOWEL_GROUP_RE.findall(cleaned))
    if cleaned.endswith("e") and groups > 1:
        groups -= 1
    return max(groups, 1)


def analyze_readability(text: str, language: str) -> ReadabilityResult:
    if not text.strip():
        return ReadabilityResult(None, "N/A", "No text provided")

    if language == "ko":
        sentence_count = max(len(split_sentences(text)), 1)
        avg_length = len(re.findall(r"[가-힣A-Za-z]+", text)) / sentence_count
        if avg_length < 12:
            return ReadabilityResult(None, "Easy", "Short sentences for Korean text")
        if avg_length < 20:
            return ReadabilityResult(None, "Moderate", "Average sentence length for Korean text")
        return ReadabilityResult(None, "Difficult", "Long sentences for Korean text")

    words = tokenize_words(text)
    sentences = split_sentences(text)
    word_count = max(len(words), 1)
    sentence_count = max(len(sentences), 1)
    syllable_count = sum(_count_syllables(word) for word in words)
    score = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllable_count / word_count)
    if score >= 90:
        grade = "Very Easy"
    elif score >= 70:
        grade = "Easy"
    elif score >= 50:
        grade = "Moderate"
    elif score >= 30:
        grade = "Difficult"
    else:
        grade = "Very Difficult"
    return ReadabilityResult(round(score, 2), grade, f"Flesch Reading Ease: {score:.2f}")
