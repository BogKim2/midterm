from smart_doc_analyzer.core.sentiment import analyze_sentiment


def test_analyze_sentiment_detects_positive_bias() -> None:
    result = analyze_sentiment(["good", "great", "effective"], "en")
    assert result.label == "Positive"
    assert result.polarity is not None and result.polarity > 0
