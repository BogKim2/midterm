from __future__ import annotations

from pathlib import Path

from PIL.Image import Image


def export_image(image: Image, path: Path) -> None:
    image.save(path, format="PNG")
