from __future__ import annotations

from PySide6.QtWidgets import QTabWidget, QVBoxLayout, QWidget

from smart_doc_analyzer.core.models import AnalysisResult
from smart_doc_analyzer.ui.export_tab import ExportTab
from smart_doc_analyzer.ui.keywords_tab import KeywordsTab
from smart_doc_analyzer.ui.overview_tab import OverviewTab
from smart_doc_analyzer.ui.visualization_tab import VisualizationTab


class ResultPanel(QWidget):
    def __init__(self) -> None:
        super().__init__()
        self.tabs = QTabWidget()
        self.overview_tab = OverviewTab()
        self.keywords_tab = KeywordsTab()
        self.visualization_tab = VisualizationTab()
        self.export_tab = ExportTab()
        self.tabs.addTab(self.overview_tab, "Overview")
        self.tabs.addTab(self.keywords_tab, "Keywords")
        self.tabs.addTab(self.visualization_tab, "Visualization")
        self.tabs.addTab(self.export_tab, "Export")

        layout = QVBoxLayout(self)
        layout.addWidget(self.tabs)

    def render(self, result: AnalysisResult) -> None:
        self.overview_tab.render(result)
        self.keywords_tab.render(result)
        self.visualization_tab.render(result)
        self.export_tab.set_meta(
            f"Source: {result.source_name}\nLanguage: {result.language}\nElapsed: {result.elapsed_seconds:.3f}s"
        )
        self.export_tab.set_enabled(True)
