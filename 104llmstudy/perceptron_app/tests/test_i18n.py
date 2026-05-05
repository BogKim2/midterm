from perceptron_app.core.i18n import I18N, STRINGS


def test_language_key_sets_match() -> None:
    assert set(STRINGS["ko"]) == set(STRINGS["en"])


def test_translation_changes_by_language() -> None:
    i18n = I18N("ko")
    assert i18n.t("app_title") == "퍼셉트론 트레이너"
    i18n.set_lang("en")
    assert i18n.t("app_title") == "Perceptron Trainer"


def test_missing_key_returns_key() -> None:
    i18n = I18N("ko")
    assert i18n.t("missing_key") == "missing_key"


def test_invalid_language_falls_back_to_korean() -> None:
    i18n = I18N("invalid")
    assert i18n.lang == "ko"
