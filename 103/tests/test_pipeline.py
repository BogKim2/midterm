from smart_doc_analyzer.config.settings import AppSettings, LlmSettings
from smart_doc_analyzer.core.pipeline import run_analysis


def test_run_analysis_returns_rule_based_result_without_llm() -> None:
    settings = AppSettings(llm=LlmSettings(enabled=False))
    result = run_analysis("This is a good document. It has clear structure.", "sample.txt", settings)
    assert result.stats.word_count > 0
    assert result.keywords
    assert result.llm.llm_used is False
