from __future__ import annotations

from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg
from PIL.ImageQt import ImageQt
from PySide6.QtGui import QPixmap
from PySide6.QtWidgets import QLabel, QVBoxLayout, QWidget

from smart_doc_analyzer.core.models import AnalysisResult
from smart_doc_analyzer.visualization.charts import create_sentence_length_histogram
from smart_doc_analyzer.visualization.wordcloud_generator import generate_wordcloud


class VisualizationTab(QWidget):
    def __init__(self) -> None:
        super().__init__()
        self.wordcloud_label = QLabel("No visualization yet.")
        self.wordcloud_label.setMinimumHeight(260)
        self.wordcloud_label.setScaledContents(True)
        self.hist_canvas = FigureCanvasQTAgg(create_sentence_length_histogram([]))
        self.current_wordcloud = None

        layout = QVBoxLayout(self)
        layout.addWidget(QLabel("Visualization"))
        layout.addWidget(self.wordcloud_label)
        layout.addWidget(self.hist_canvas)

    def render(self, result: AnalysisResult) -> None:
        tokens = result.wordcloud_tokens or [word for word, _ in result.keywords]
        self.current_wordcloud = generate_wordcloud(tokens)
        qt_image = ImageQt(self.current_wordcloud)
        self.wordcloud_label.setPixmap(QPixmap.fromImage(qt_image))
        self.hist_canvas.figure = create_sentence_length_histogram(result.sentence_lengths)
        self.hist_canvas.draw()
