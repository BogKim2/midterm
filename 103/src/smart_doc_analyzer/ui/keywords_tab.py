from __future__ import annotations

from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg
from PySide6.QtWidgets import QLabel, QTableWidget, QTableWidgetItem, QVBoxLayout, QWidget

from smart_doc_analyzer.core.models import AnalysisResult
from smart_doc_analyzer.visualization.charts import create_keyword_bar_chart


class KeywordsTab(QWidget):
    def __init__(self) -> None:
        super().__init__()
        self.semantic_label = QLabel("Semantic keywords will appear here.")
        self.table = QTableWidget(0, 2)
        self.table.setHorizontalHeaderLabels(["Keyword", "Count"])
        self.canvas = FigureCanvasQTAgg(create_keyword_bar_chart([]))

        layout = QVBoxLayout(self)
        layout.addWidget(QLabel("Keywords"))
        layout.addWidget(self.semantic_label)
        layout.addWidget(self.table)
        layout.addWidget(self.canvas)

    def render(self, result: AnalysisResult) -> None:
        keywords = result.keywords
        self.table.setRowCount(len(keywords))
        for row, (keyword, count) in enumerate(keywords):
            self.table.setItem(row, 0, QTableWidgetItem(keyword))
            self.table.setItem(row, 1, QTableWidgetItem(str(count)))
        semantic = ", ".join(result.llm.semantic_keywords) if result.llm.semantic_keywords else "No semantic keywords."
        self.semantic_label.setText(f"Semantic Keywords: {semantic}")
        self.canvas.figure = create_keyword_bar_chart(keywords)
        self.canvas.draw()
