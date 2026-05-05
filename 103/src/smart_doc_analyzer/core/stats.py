from __future__ import annotations

from smart_doc_analyzer.core.models import BasicStats
from smart_doc_analyzer.core.tokenizer import split_sentences, tokenize_words


def compute_basic_stats(text: str) -> tuple[BasicStats, list[int]]:
    sentences = split_sentences(text)
    tokens = tokenize_words(text)
    paragraphs = [block for block in text.splitlines() if block.strip()]
    sentence_lengths = [len(tokenize_words(sentence)) for sentence in sentences] or [0]
    sentence_count = max(len(sentences), 1) if text.strip() else 0
    word_count = len(tokens)
    stats = BasicStats(
        character_count=len(text),
        word_count=word_count,
        sentence_count=sentence_count,
        paragraph_count=len(paragraphs),
        unique_word_count=len(set(tokens)),
        average_sentence_length=(word_count / sentence_count) if sentence_count else 0.0,
    )
    return stats, sentence_lengths
