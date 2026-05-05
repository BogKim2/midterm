from __future__ import annotations

from pathlib import Path

SUPPORTED_SUFFIXES = {".txt", ".md"}


def load_text_file(path: Path) -> str:
    if path.suffix.lower() not in SUPPORTED_SUFFIXES:
        raise ValueError("Only .txt and .md files are supported.")

    for encoding in ("utf-8", "utf-8-sig", "cp949"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    raise UnicodeDecodeError("file_loader", b"", 0, 1, "Unsupported encoding")
