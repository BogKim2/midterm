from __future__ import annotations

from pathlib import Path

from PySide6.QtWidgets import (
    QFileDialog,
    QMainWindow,
    QMessageBox,
    QProgressBar,
    QSplitter,
)

from smart_doc_analyzer.config.settings import AppSettings
from smart_doc_analyzer.controllers.analysis_controller import AnalysisController
from smart_doc_analyzer.core.models import AnalysisResult
from smart_doc_analyzer.io.file_loader import load_text_file
from smart_doc_analyzer.io.image_exporter import export_image
from smart_doc_analyzer.io.json_exporter import export_analysis_to_json
from smart_doc_analyzer.ui.input_panel import InputPanel
from smart_doc_analyzer.ui.result_panel import ResultPanel
from smart_doc_analyzer.ui.settings_dialog import SettingsDialog


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Smart Document Analyzer")
        self.resize(1320, 860)
        self.settings = AppSettings.load()
        self.current_source_name = "Manual input"
        self.current_result: AnalysisResult | None = None

        self.input_panel = InputPanel()
        self.result_panel = ResultPanel()
        splitter = QSplitter()
        splitter.addWidget(self.input_panel)
        splitter.addWidget(self.result_panel)
        splitter.setSizes([430, 890])
        self.setCentralWidget(splitter)

        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 100)
        self.progress_bar.setValue(0)
        self.statusBar().addPermanentWidget(self.progress_bar)
        self.statusBar().showMessage("Ready")

        self.controller = AnalysisController(
            on_progress=self._on_progress,
            on_result=self._on_result,
            on_error=self._on_error,
            on_finished=self._on_finished,
        )

        self._build_menu()
        self._wire_events()

    def _build_menu(self) -> None:
        file_menu = self.menuBar().addMenu("File")
        open_action = file_menu.addAction("Open File")
        open_action.triggered.connect(self._open_file)
        settings_action = file_menu.addAction("Settings")
        settings_action.triggered.connect(self._open_settings)
        export_json_action = file_menu.addAction("Save JSON")
        export_json_action.triggered.connect(self._save_json)
        export_png_action = file_menu.addAction("Save PNG")
        export_png_action.triggered.connect(self._save_png)
        quit_action = file_menu.addAction("Quit")
        quit_action.triggered.connect(self.close)

        help_menu = self.menuBar().addMenu("Help")
        about_action = help_menu.addAction("About")
        about_action.triggered.connect(self._show_about)

    def _wire_events(self) -> None:
        self.input_panel.open_requested.connect(self._open_file)
        self.input_panel.analyze_requested.connect(self._start_analysis)
        self.result_panel.export_tab.export_json_requested.connect(self._save_json)
        self.result_panel.export_tab.export_png_requested.connect(self._save_png)

    def _open_settings(self) -> None:
        dialog = SettingsDialog(self.settings, self)
        if dialog.exec():
            self.settings = dialog.to_settings()
            self.settings.save()
            self.statusBar().showMessage("Settings saved.")

    def _show_about(self) -> None:
        QMessageBox.information(
            self,
            "About",
            "Smart Document Analyzer\nPySide6 desktop MVP with optional LM Studio qwen3.6 interpretation.",
        )

    def _open_file(self) -> None:
        path, _ = QFileDialog.getOpenFileName(self, "Open Text File", "", "Text Files (*.txt *.md)")
        if not path:
            return
        try:
            content = load_text_file(Path(path))
        except Exception as exc:
            QMessageBox.critical(self, "Open Failed", str(exc))
            return
        self.current_source_name = Path(path).name
        self.input_panel.set_text(content, self.current_source_name)
        self.statusBar().showMessage(f"Loaded: {self.current_source_name}")

    def _start_analysis(self) -> None:
        text = self.input_panel.text().strip()
        if not text:
            QMessageBox.warning(self, "Input Required", "분석할 텍스트를 입력하거나 파일을 선택하세요.")
            return
        self.current_result = None
        self.progress_bar.setValue(0)
        self.input_panel.set_busy(True)
        self.result_panel.export_tab.set_enabled(False)
        self.statusBar().showMessage("Analyzing...")
        self.controller.start(text=text, source_name=self.current_source_name, settings=self.settings)

    def _on_progress(self, value: int, message: str) -> None:
        self.progress_bar.setValue(value)
        self.statusBar().showMessage(message)

    def _on_result(self, result: AnalysisResult) -> None:
        self.current_result = result
        self.result_panel.render(result)
        if result.warnings:
            self.statusBar().showMessage(result.warnings[-1])
        else:
            self.statusBar().showMessage(f"Analysis completed in {result.elapsed_seconds:.3f}s")

    def _on_error(self, message: str) -> None:
        QMessageBox.critical(self, "Analysis Failed", message)
        self.statusBar().showMessage(f"Error: {message}")

    def _on_finished(self) -> None:
        self.input_panel.set_busy(False)

    def _save_json(self) -> None:
        if self.current_result is None:
            return
        path, _ = QFileDialog.getSaveFileName(self, "Save Analysis JSON", "analysis.json", "JSON Files (*.json)")
        if not path:
            return
        export_analysis_to_json(self.current_result, Path(path))
        self.statusBar().showMessage(f"Saved JSON: {Path(path).name}")

    def _save_png(self) -> None:
        if self.current_result is None or self.result_panel.visualization_tab.current_wordcloud is None:
            return
        path, _ = QFileDialog.getSaveFileName(self, "Save WordCloud PNG", "wordcloud.png", "PNG Files (*.png)")
        if not path:
            return
        export_image(self.result_panel.visualization_tab.current_wordcloud, Path(path))
        self.statusBar().showMessage(f"Saved PNG: {Path(path).name}")
