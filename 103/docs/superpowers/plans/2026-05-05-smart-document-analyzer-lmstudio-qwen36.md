# Smart Document Analyzer LM Studio Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP desktop analyzer from `PRD.md` and `TRD.md`, using rule-based local analysis for fast metrics and `LM Studio` local `qwen3.6` for summary, tone, and semantic interpretation.

**Architecture:** The app keeps deterministic analysis in local Python modules so the UI remains fast and predictable. A second optional LLM phase calls the LM Studio local OpenAI-compatible endpoint in a worker thread and merges structured JSON results into the final analysis view without making the app depend on cloud APIs.

**Tech Stack:** Python 3.11+, PySide6, Matplotlib, WordCloud, Pillow, NLTK, kiwipiepy, textstat, pytest, requests/httpx-compatible HTTP client, PyInstaller

---

## File Map

**Create**
- `src/smart_doc_analyzer/__init__.py`
- `src/smart_doc_analyzer/__main__.py`
- `src/smart_doc_analyzer/app.py`
- `src/smart_doc_analyzer/ui/main_window.py`
- `src/smart_doc_analyzer/ui/input_panel.py`
- `src/smart_doc_analyzer/ui/result_panel.py`
- `src/smart_doc_analyzer/ui/overview_tab.py`
- `src/smart_doc_analyzer/ui/keywords_tab.py`
- `src/smart_doc_analyzer/ui/visualization_tab.py`
- `src/smart_doc_analyzer/ui/export_tab.py`
- `src/smart_doc_analyzer/ui/settings_dialog.py`
- `src/smart_doc_analyzer/controllers/analysis_controller.py`
- `src/smart_doc_analyzer/controllers/worker.py`
- `src/smart_doc_analyzer/core/models.py`
- `src/smart_doc_analyzer/core/file_types.py`
- `src/smart_doc_analyzer/core/stats.py`
- `src/smart_doc_analyzer/core/tokenizer.py`
- `src/smart_doc_analyzer/core/keywords.py`
- `src/smart_doc_analyzer/core/sentiment.py`
- `src/smart_doc_analyzer/core/readability.py`
- `src/smart_doc_analyzer/core/llm_client.py`
- `src/smart_doc_analyzer/core/llm_analysis.py`
- `src/smart_doc_analyzer/core/pipeline.py`
- `src/smart_doc_analyzer/visualization/charts.py`
- `src/smart_doc_analyzer/visualization/wordcloud_generator.py`
- `src/smart_doc_analyzer/io/file_loader.py`
- `src/smart_doc_analyzer/io/json_exporter.py`
- `src/smart_doc_analyzer/io/image_exporter.py`
- `src/smart_doc_analyzer/config/settings.py`
- `src/smart_doc_analyzer/resources/stopwords_ko.txt`
- `tests/test_stats.py`
- `tests/test_keywords.py`
- `tests/test_sentiment.py`
- `tests/test_readability.py`
- `tests/test_llm_analysis.py`
- `tests/test_pipeline.py`
- `tests/test_file_loader.py`
- `tests/test_worker.py`
- `requirements.txt`
- `pyproject.toml`
- `packaging/pyinstaller.spec`
- `README.md`

**Modify**
- `TRD.md`

## Assumptions

- `LM Studio` is already installed on the target machine.
- The `qwen3.6` model is already downloaded inside LM Studio.
- LM Studio exposes an OpenAI-compatible local endpoint such as `http://127.0.0.1:1234/v1`.
- The MVP must still work when LM Studio is unavailable; only the interpretation layer degrades.
- `.txt` and `.md` are the only required input formats for MVP.

## Success Criteria

- The app opens locally on Windows and accepts pasted text plus `.txt` and `.md` files.
- Rule-based metrics finish quickly and do not block the UI.
- LLM analysis uses local `qwen3.6` through LM Studio without any cloud dependency.
- LLM failure does not break the rest of the analysis.
- Results can be exported as JSON and the wordcloud as PNG.
- Core tests pass with `pytest`.

### Task 1: Bootstrap the Package and Entry Point

**Files:**
- Create: `pyproject.toml`
- Create: `requirements.txt`
- Create: `src/smart_doc_analyzer/__init__.py`
- Create: `src/smart_doc_analyzer/__main__.py`
- Create: `src/smart_doc_analyzer/app.py`
- Test: `python -m smart_doc_analyzer`

- [ ] **Step 1: Write the failing smoke expectation**

```python
# tests/test_pipeline.py
def test_placeholder_import():
    from smart_doc_analyzer import __init__  # noqa: F401
```

- [ ] **Step 2: Run the expectation to verify the package is missing**

Run: `pytest tests/test_pipeline.py::test_placeholder_import -v`  
Expected: `ModuleNotFoundError: No module named 'smart_doc_analyzer'`

- [ ] **Step 3: Write the minimal package bootstrap**

```python
# src/smart_doc_analyzer/__main__.py
from smart_doc_analyzer.app import main


if __name__ == "__main__":
    raise SystemExit(main())
```

```python
# src/smart_doc_analyzer/app.py
from PySide6.QtWidgets import QApplication, QLabel, QMainWindow


def main() -> int:
    app = QApplication.instance() or QApplication([])
    window = QMainWindow()
    window.setWindowTitle("Smart Document Analyzer")
    window.setCentralWidget(QLabel("Bootstrap"))
    window.resize(1200, 800)
    window.show()
    return app.exec()
```

- [ ] **Step 4: Run the smoke expectation again**

Run: `pytest tests/test_pipeline.py::test_placeholder_import -v`  
Expected: `PASSED`

- [ ] **Step 5: Commit**

```bash
git add pyproject.toml requirements.txt src/smart_doc_analyzer/__init__.py src/smart_doc_analyzer/__main__.py src/smart_doc_analyzer/app.py tests/test_pipeline.py
git commit -m "chore: bootstrap smart document analyzer package"
```

### Task 2: Implement Rule-Based Core Analysis

**Files:**
- Create: `src/smart_doc_analyzer/core/models.py`
- Create: `src/smart_doc_analyzer/core/stats.py`
- Create: `src/smart_doc_analyzer/core/tokenizer.py`
- Create: `src/smart_doc_analyzer/core/keywords.py`
- Create: `src/smart_doc_analyzer/core/sentiment.py`
- Create: `src/smart_doc_analyzer/core/readability.py`
- Test: `tests/test_stats.py`
- Test: `tests/test_keywords.py`
- Test: `tests/test_sentiment.py`
- Test: `tests/test_readability.py`

- [ ] **Step 1: Write failing tests for deterministic analysis**

```python
# tests/test_stats.py
from smart_doc_analyzer.core.stats import compute_basic_stats


def test_compute_basic_stats_counts_text_units():
    result = compute_basic_stats("One two.\n\nThree four.")
    assert result.word_count == 4
    assert result.sentence_count == 2
    assert result.paragraph_count == 2
```

```python
# tests/test_keywords.py
from smart_doc_analyzer.core.keywords import extract_keywords


def test_extract_keywords_returns_top_terms():
    keywords = extract_keywords(["apple", "banana", "apple", "pear"], top_n=2)
    assert keywords == [("apple", 2), ("banana", 1)]
```

- [ ] **Step 2: Run the failing tests**

Run: `pytest tests/test_stats.py tests/test_keywords.py tests/test_sentiment.py tests/test_readability.py -v`  
Expected: import or attribute failures for missing modules

- [ ] **Step 3: Write the minimal analysis models and functions**

```python
# src/smart_doc_analyzer/core/models.py
from dataclasses import dataclass, field


@dataclass(slots=True)
class BasicStats:
    character_count: int
    word_count: int
    sentence_count: int
    paragraph_count: int
    unique_word_count: int
    average_sentence_length: float


@dataclass(slots=True)
class SentimentResult:
    polarity: float
    subjectivity: float
    label: str
    source: str


@dataclass(slots=True)
class ReadabilityResult:
    flesch_reading_ease: float | None
    grade: str
    description: str


@dataclass(slots=True)
class LlmInsightResult:
    summary: str = ""
    tone: str = ""
    insights: list[str] = field(default_factory=list)
    semantic_keywords: list[str] = field(default_factory=list)
    llm_used: bool = False
    llm_error: str | None = None


@dataclass(slots=True)
class AnalysisResult:
    source_name: str
    language: str
    elapsed_seconds: float
    stats: BasicStats
    keywords: list[tuple[str, int]]
    sentiment: SentimentResult
    readability: ReadabilityResult
    sentence_lengths: list[int]
    warnings: list[str]
    llm: LlmInsightResult
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/test_stats.py tests/test_keywords.py tests/test_sentiment.py tests/test_readability.py -v`  
Expected: `PASSED`

- [ ] **Step 5: Commit**

```bash
git add src/smart_doc_analyzer/core tests/test_stats.py tests/test_keywords.py tests/test_sentiment.py tests/test_readability.py
git commit -m "feat: add deterministic text analysis core"
```

### Task 3: Implement LM Studio `qwen3.6` Integration

**Files:**
- Create: `src/smart_doc_analyzer/core/llm_client.py`
- Create: `src/smart_doc_analyzer/core/llm_analysis.py`
- Create: `src/smart_doc_analyzer/config/settings.py`
- Test: `tests/test_llm_analysis.py`

- [ ] **Step 1: Write failing tests for structured LM Studio parsing**

```python
# tests/test_llm_analysis.py
from smart_doc_analyzer.core.llm_analysis import parse_llm_json


def test_parse_llm_json_extracts_summary_and_keywords():
    payload = {
        "summary": "Short summary",
        "tone": "Neutral",
        "insights": ["A", "B", "C"],
        "semantic_keywords": ["alpha", "beta"],
    }
    result = parse_llm_json(payload)
    assert result.summary == "Short summary"
    assert result.semantic_keywords == ["alpha", "beta"]
```

- [ ] **Step 2: Run the failing tests**

Run: `pytest tests/test_llm_analysis.py -v`  
Expected: import failure for missing LM Studio modules

- [ ] **Step 3: Write the minimal LM Studio adapter and parser**

```python
# src/smart_doc_analyzer/config/settings.py
from dataclasses import dataclass


@dataclass(slots=True)
class LlmSettings:
    enabled: bool = True
    endpoint: str = "http://127.0.0.1:1234/v1"
    model_name: str = "qwen3.6"
    timeout_seconds: float = 20.0
    max_tokens: int = 400
```

```python
# src/smart_doc_analyzer/core/llm_analysis.py
import json

from smart_doc_analyzer.core.models import LlmInsightResult


def build_prompt(text_excerpt: str, keywords: list[tuple[str, int]]) -> str:
    return (
        "Return JSON with keys summary, tone, insights, semantic_keywords.\n"
        f"TEXT:\n{text_excerpt}\nKEYWORDS:{keywords}"
    )


def parse_llm_json(payload: dict) -> LlmInsightResult:
    return LlmInsightResult(
        summary=str(payload.get("summary", "")),
        tone=str(payload.get("tone", "")),
        insights=[str(item) for item in payload.get("insights", [])][:5],
        semantic_keywords=[str(item) for item in payload.get("semantic_keywords", [])][:10],
        llm_used=True,
    )


def parse_llm_response(content: str) -> LlmInsightResult:
    return parse_llm_json(json.loads(content))
```

- [ ] **Step 4: Run the tests to verify parsing passes**

Run: `pytest tests/test_llm_analysis.py -v`  
Expected: `PASSED`

- [ ] **Step 5: Commit**

```bash
git add src/smart_doc_analyzer/core/llm_client.py src/smart_doc_analyzer/core/llm_analysis.py src/smart_doc_analyzer/config/settings.py tests/test_llm_analysis.py
git commit -m "feat: add lm studio qwen integration layer"
```

### Task 4: Build the End-to-End Analysis Pipeline with Fallback

**Files:**
- Create: `src/smart_doc_analyzer/core/pipeline.py`
- Modify: `src/smart_doc_analyzer/core/models.py`
- Test: `tests/test_pipeline.py`

- [ ] **Step 1: Write failing tests for pipeline fallback behavior**

```python
# tests/test_pipeline.py
from smart_doc_analyzer.core.models import LlmInsightResult
from smart_doc_analyzer.core.pipeline import merge_llm_result


def test_merge_llm_result_keeps_rule_based_output_when_llm_fails():
    llm = LlmInsightResult(llm_used=False, llm_error="connection refused")
    result = merge_llm_result(None, llm)
    assert result.llm.llm_error == "connection refused"
    assert result.llm.llm_used is False
```

- [ ] **Step 2: Run the failing test**

Run: `pytest tests/test_pipeline.py::test_merge_llm_result_keeps_rule_based_output_when_llm_fails -v`  
Expected: missing pipeline function

- [ ] **Step 3: Write the minimal pipeline orchestration**

```python
# src/smart_doc_analyzer/core/pipeline.py
from smart_doc_analyzer.core.models import AnalysisResult, LlmInsightResult


def merge_llm_result(base_result: AnalysisResult, llm_result: LlmInsightResult) -> AnalysisResult:
    base_result.llm = llm_result
    return base_result
```

- [ ] **Step 4: Run the pipeline tests**

Run: `pytest tests/test_pipeline.py -v`  
Expected: `PASSED`

- [ ] **Step 5: Commit**

```bash
git add src/smart_doc_analyzer/core/pipeline.py src/smart_doc_analyzer/core/models.py tests/test_pipeline.py
git commit -m "feat: merge llm output into analysis pipeline"
```

### Task 5: Build the Worker Thread and Controller

**Files:**
- Create: `src/smart_doc_analyzer/controllers/worker.py`
- Create: `src/smart_doc_analyzer/controllers/analysis_controller.py`
- Test: `tests/test_worker.py`

- [ ] **Step 1: Write failing tests for worker signal flow**

```python
# tests/test_worker.py
from smart_doc_analyzer.controllers.worker import AnalysisWorker


def test_worker_can_be_constructed_with_text():
    worker = AnalysisWorker("sample text", source_name="manual")
    assert worker.source_name == "manual"
```

- [ ] **Step 2: Run the failing worker test**

Run: `pytest tests/test_worker.py -v`  
Expected: import failure

- [ ] **Step 3: Write the minimal worker shell**

```python
# src/smart_doc_analyzer/controllers/worker.py
from PySide6.QtCore import QObject, Signal


class AnalysisWorker(QObject):
    progress_changed = Signal(int, str)
    result_ready = Signal(object)
    error_occurred = Signal(str)
    finished = Signal()

    def __init__(self, text: str, source_name: str) -> None:
        super().__init__()
        self.text = text
        self.source_name = source_name
```

- [ ] **Step 4: Run the worker test to verify it passes**

Run: `pytest tests/test_worker.py -v`  
Expected: `PASSED`

- [ ] **Step 5: Commit**

```bash
git add src/smart_doc_analyzer/controllers tests/test_worker.py
git commit -m "feat: add controller and worker thread skeleton"
```

### Task 6: Build the MVP UI and Bind It to the Pipeline

**Files:**
- Create: `src/smart_doc_analyzer/ui/main_window.py`
- Create: `src/smart_doc_analyzer/ui/input_panel.py`
- Create: `src/smart_doc_analyzer/ui/result_panel.py`
- Create: `src/smart_doc_analyzer/ui/overview_tab.py`
- Create: `src/smart_doc_analyzer/ui/keywords_tab.py`
- Create: `src/smart_doc_analyzer/ui/visualization_tab.py`
- Create: `src/smart_doc_analyzer/ui/export_tab.py`
- Create: `src/smart_doc_analyzer/ui/settings_dialog.py`
- Modify: `src/smart_doc_analyzer/app.py`

- [ ] **Step 1: Write a failing construction test for the main window**

```python
# tests/test_pipeline.py
from smart_doc_analyzer.ui.main_window import MainWindow


def test_main_window_has_expected_title(qtbot):
    window = MainWindow()
    qtbot.addWidget(window)
    assert window.windowTitle() == "Smart Document Analyzer"
```

- [ ] **Step 2: Run the failing UI test**

Run: `pytest tests/test_pipeline.py::test_main_window_has_expected_title -v`  
Expected: import failure for UI module

- [ ] **Step 3: Write the minimal UI composition**

```python
# src/smart_doc_analyzer/ui/main_window.py
from PySide6.QtWidgets import QMainWindow, QSplitter

from smart_doc_analyzer.ui.input_panel import InputPanel
from smart_doc_analyzer.ui.result_panel import ResultPanel


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Smart Document Analyzer")
        splitter = QSplitter()
        splitter.addWidget(InputPanel())
        splitter.addWidget(ResultPanel())
        self.setCentralWidget(splitter)
```

- [ ] **Step 4: Run the UI test**

Run: `pytest tests/test_pipeline.py::test_main_window_has_expected_title -v`  
Expected: `PASSED`

- [ ] **Step 5: Commit**

```bash
git add src/smart_doc_analyzer/ui src/smart_doc_analyzer/app.py tests/test_pipeline.py
git commit -m "feat: add mvp desktop interface"
```

### Task 7: Add File Loading and Export

**Files:**
- Create: `src/smart_doc_analyzer/io/file_loader.py`
- Create: `src/smart_doc_analyzer/io/json_exporter.py`
- Create: `src/smart_doc_analyzer/io/image_exporter.py`
- Test: `tests/test_file_loader.py`

- [ ] **Step 1: Write failing tests for file loading**

```python
# tests/test_file_loader.py
from pathlib import Path

from smart_doc_analyzer.io.file_loader import load_text_file


def test_load_text_file_reads_utf8(tmp_path: Path):
    path = tmp_path / "sample.txt"
    path.write_text("hello world", encoding="utf-8")
    result = load_text_file(path)
    assert result == "hello world"
```

- [ ] **Step 2: Run the failing tests**

Run: `pytest tests/test_file_loader.py -v`  
Expected: import failure

- [ ] **Step 3: Write the minimal loader and exporters**

```python
# src/smart_doc_analyzer/io/file_loader.py
from pathlib import Path


def load_text_file(path: Path) -> str:
    for encoding in ("utf-8", "utf-8-sig", "cp949"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    raise UnicodeDecodeError("file_loader", b"", 0, 1, "unsupported encoding")
```

- [ ] **Step 4: Run the file loader tests**

Run: `pytest tests/test_file_loader.py -v`  
Expected: `PASSED`

- [ ] **Step 5: Commit**

```bash
git add src/smart_doc_analyzer/io tests/test_file_loader.py
git commit -m "feat: add file loading and export infrastructure"
```

### Task 8: Package, Document, and Verify

**Files:**
- Create: `packaging/pyinstaller.spec`
- Modify: `README.md`
- Modify: `requirements.txt`

- [ ] **Step 1: Add final dependency declarations**

```text
PySide6>=6.7
matplotlib>=3.8
pandas>=2.1
nltk>=3.8
textstat>=0.7
wordcloud>=1.9
Pillow>=10.0
kiwipiepy>=0.20
requests>=2.32
pytest>=8.0
pytest-qt>=4.4
```

- [ ] **Step 2: Run the full test suite**

Run: `pytest -v`  
Expected: all unit tests pass

- [ ] **Step 3: Verify local startup**

Run: `python -m smart_doc_analyzer`  
Expected: main window opens with input panel and result tabs

- [ ] **Step 4: Verify packaging**

Run: `pyinstaller packaging/pyinstaller.spec`  
Expected: `dist/SmartDocumentAnalyzer/SmartDocumentAnalyzer.exe` is created

- [ ] **Step 5: Commit**

```bash
git add README.md requirements.txt packaging/pyinstaller.spec
git commit -m "docs: finalize setup and packaging guidance"
```

## Spec Coverage Check

- PRD MVP input requirements are covered by Tasks 1, 6, and 7.
- PRD metrics and visualization requirements are covered by Tasks 2 and 6.
- Requested `LM Studio` local `qwen3.6` usage is covered by Tasks 3 and 4.
- TRD worker-thread responsiveness is covered by Task 5.
- JSON and PNG export are covered by Task 7.
- Packaging and delivery are covered by Task 8.

## Risks Kept Explicit

- Full-document LLM inference is intentionally not used for all NLP because it threatens the 5-second target.
- Sentiment remains hybrid: deterministic metrics stay local and fast, while tone interpretation is delegated to `qwen3.6`.
- If LM Studio is off, the app still produces useful analysis and surfaces the LLM error only in the interpretation section.

Plan complete and saved to `docs/superpowers/plans/2026-05-05-smart-document-analyzer-lmstudio-qwen36.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
