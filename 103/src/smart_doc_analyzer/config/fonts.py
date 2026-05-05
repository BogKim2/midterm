from __future__ import annotations

from pathlib import Path

from matplotlib import rcParams
from PySide6.QtGui import QFont
from PySide6.QtWidgets import QApplication

WINDOWS_FONT_CANDIDATES = [
    ("Malgun Gothic", Path(r"C:\Windows\Fonts\malgun.ttf")),
    ("Gulim", Path(r"C:\Windows\Fonts\gulim.ttc")),
    ("Batang", Path(r"C:\Windows\Fonts\batang.ttc")),
]

FALLBACK_FONT_FAMILY = "Segoe UI"


def get_preferred_font_family() -> str:
    for family, path in WINDOWS_FONT_CANDIDATES:
        if path.exists():
            return family
    return FALLBACK_FONT_FAMILY


def get_preferred_font_path() -> str | None:
    for _, path in WINDOWS_FONT_CANDIDATES:
        if path.exists():
            return str(path)
    return None


def configure_application_fonts(app: QApplication) -> None:
    family = get_preferred_font_family()
    app.setFont(QFont(family, 10))
    rcParams["font.family"] = family
    rcParams["axes.unicode_minus"] = False
