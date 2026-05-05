from __future__ import annotations

from collections import Counter
from pathlib import Path

from PIL.Image import Image
from wordcloud import WordCloud

from smart_doc_analyzer.config.fonts import get_preferred_font_path


def generate_wordcloud(tokens: list[str], font_path: str | None = None) -> Image:
    frequencies = Counter(tokens)
    if not frequencies:
        frequencies = Counter({"no-data": 1})
    resolved_font_path = font_path if font_path and Path(font_path).exists() else get_preferred_font_path()
    cloud = WordCloud(
        width=900,
        height=500,
        background_color="white",
        font_path=resolved_font_path,
    ).generate_from_frequencies(frequencies)
    return cloud.to_image()
