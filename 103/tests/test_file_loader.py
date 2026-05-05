from pathlib import Path

from smart_doc_analyzer.io.file_loader import load_text_file


def test_load_text_file_reads_utf8() -> None:
    temp_dir = Path("tests/.artifacts")
    temp_dir.mkdir(parents=True, exist_ok=True)
    path = temp_dir / "sample.txt"
    path.write_text("hello world", encoding="utf-8")
    try:
        assert load_text_file(path) == "hello world"
    finally:
        path.unlink(missing_ok=True)
