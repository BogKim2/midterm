from smart_doc_analyzer.core.readability import analyze_readability


def test_analyze_readability_returns_english_score() -> None:
    result = analyze_readability("This is a short sentence. This is another short sentence.", "en")
    assert result.flesch_reading_ease is not None
    assert result.grade in {"Very Easy", "Easy", "Moderate", "Difficult", "Very Difficult"}
