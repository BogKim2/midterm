from __future__ import annotations

import time

from smart_doc_analyzer.config.settings import AppSettings
from smart_doc_analyzer.core.keywords import extract_keywords
from smart_doc_analyzer.core.llm_analysis import build_prompt, parse_llm_response
from smart_doc_analyzer.core.llm_client import LlmClient
from smart_doc_analyzer.core.models import AnalysisResult, LlmInsightResult
from smart_doc_analyzer.core.readability import analyze_readability
from smart_doc_analyzer.core.sentiment import analyze_sentiment
from smart_doc_analyzer.core.stats import compute_basic_stats
from smart_doc_analyzer.core.tokenizer import detect_language, normalize_tokens, tokenize_words


def run_analysis(text: str, source_name: str, settings: AppSettings) -> AnalysisResult:
    started_at = time.perf_counter()
    language = detect_language(text)
    stats, sentence_lengths = compute_basic_stats(text)
    tokens = normalize_tokens(tokenize_words(text), language)
    keywords = extract_keywords(text)
    sentiment = analyze_sentiment(tokens, language)
    readability = analyze_readability(text, language)
    warnings: list[str] = []
    llm_result = LlmInsightResult()

    if len(text) > 100_000:
        warnings.append("Large document detected. LLM interpretation uses a shortened excerpt.")

    if settings.llm.enabled:
        try:
            client = LlmClient(
                endpoint=settings.llm.endpoint,
                model_name=settings.llm.model_name,
                timeout_seconds=settings.llm.timeout_seconds,
                max_tokens=settings.llm.max_tokens,
            )
            prompt = build_prompt(text, stats, keywords)
            llm_result = parse_llm_response(client.analyze(prompt))
        except Exception as exc:
            llm_result = LlmInsightResult(
                summary="",
                tone="",
                insights=[],
                semantic_keywords=[],
                llm_used=False,
                llm_error=str(exc),
            )
            warnings.append("Local LLM interpretation was unavailable; rule-based analysis is still shown.")

    return AnalysisResult(
        source_name=source_name,
        language=language,
        elapsed_seconds=round(time.perf_counter() - started_at, 3),
        stats=stats,
        wordcloud_tokens=tokens,
        keywords=keywords,
        sentiment=sentiment,
        readability=readability,
        sentence_lengths=sentence_lengths,
        warnings=warnings,
        llm=llm_result,
    )
