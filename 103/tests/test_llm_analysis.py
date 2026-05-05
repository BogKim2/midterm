from smart_doc_analyzer.core.llm_analysis import parse_llm_json


def test_parse_llm_json_extracts_expected_fields() -> None:
    result = parse_llm_json(
        {
            "summary": "Short summary",
            "tone": "Analytical",
            "insights": ["A", "B"],
            "semantic_keywords": ["alpha", "beta"],
        }
    )
    assert result.summary == "Short summary"
    assert result.tone == "Analytical"
    assert result.semantic_keywords == ["alpha", "beta"]
