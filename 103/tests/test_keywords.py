from smart_doc_analyzer.core.keywords import extract_keywords


def test_extract_keywords_returns_most_common_terms() -> None:
    keywords = extract_keywords("apple banana apple pear")
    assert keywords[0] == ("apple", 2)
