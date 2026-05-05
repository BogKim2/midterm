from __future__ import annotations

from PySide6.QtCore import QObject, Signal

from smart_doc_analyzer.config.settings import AppSettings
from smart_doc_analyzer.core.pipeline import run_analysis


class AnalysisWorker(QObject):
    progress_changed = Signal(int, str)
    result_ready = Signal(object)
    error_occurred = Signal(str)
    finished = Signal()

    def __init__(self, text: str, source_name: str, settings: AppSettings) -> None:
        super().__init__()
        self.text = text
        self.source_name = source_name
        self.settings = settings

    def run(self) -> None:
        try:
            self.progress_changed.emit(10, "Tokenizing text...")
            self.progress_changed.emit(40, "Computing statistics...")
            self.progress_changed.emit(70, "Preparing local interpretation...")
            result = run_analysis(self.text, self.source_name, self.settings)
            self.progress_changed.emit(100, "Analysis complete.")
            self.result_ready.emit(result)
        except Exception as exc:
            self.error_occurred.emit(str(exc))
        finally:
            self.finished.emit()
