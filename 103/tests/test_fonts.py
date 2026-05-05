from smart_doc_analyzer.config.fonts import get_preferred_font_family, get_preferred_font_path


def test_preferred_font_is_available_on_windows_machine() -> None:
    family = get_preferred_font_family()
    path = get_preferred_font_path()
    assert family
    assert path is not None
