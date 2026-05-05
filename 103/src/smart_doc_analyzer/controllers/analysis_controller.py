from __future__ import annotations

from collections.abc import Callable

from PySide6.QtCore import QThread

from smart_doc_analyzer.config.settings import AppSettings
from smart_doc_analyzer.controllers.worker import AnalysisWorker


class AnalysisController:
    def __init__(
        self,
        on_progress: Callable[[int, str], None],
        on_result: Callable[[object], None],
        on_error: Callable[[str], None],
        on_finished: Callable[[], None],
    ) -> None:
        self.on_progress = on_progress
        self.on_result = on_result
        self.on_error = on_error
        self.on_finished = on_finished
        self._thread: QThread | None = None
        self._worker: AnalysisWorker | None = None

    def start(self, text: str, source_name: str, settings: AppSettings) -> None:
        if self._thread is not None:
            return
        self._thread = QThread()
        self._worker = AnalysisWorker(text=text, source_name=source_name, settings=settings)
        self._worker.moveToThread(self._thread)
        self._thread.started.connect(self._worker.run)
        self._worker.progress_changed.connect(self.on_progress)
        self._worker.result_ready.connect(self.on_result)
        self._worker.error_occurred.connect(self.on_error)
        self._worker.finished.connect(self._thread.quit)
        self._worker.finished.connect(self.on_finished)
        self._thread.finished.connect(self._cleanup)
        self._thread.start()

    def _cleanup(self) -> None:
        if self._worker is not None:
            self._worker.deleteLater()
        if self._thread is not None:
            self._thread.deleteLater()
        self._worker = None
        self._thread = None
