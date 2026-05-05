from __future__ import annotations

from collections import Counter

from smart_doc_analyzer.core.tokenizer import detect_language, normalize_tokens, tokenize_words


def extract_keywords(text: str, top_n: int = 15) -> list[tuple[str, int]]:
    language = detect_language(text)
    tokens = normalize_tokens(tokenize_words(text), language)
    counts = Counter(tokens)
    return counts.most_common(top_n)
