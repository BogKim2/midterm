from __future__ import annotations

from PySide6.QtCore import Signal
from PySide6.QtWidgets import QLabel, QPushButton, QVBoxLayout, QWidget


class ExportTab(QWidget):
    export_json_requested = Signal()
    export_png_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.meta_label = QLabel("No analysis yet.")
        self.json_button = QPushButton("Save JSON")
        self.png_button = QPushButton("Save WordCloud PNG")
        self.json_button.setEnabled(False)
        self.png_button.setEnabled(False)

        layout = QVBoxLayout(self)
        layout.addWidget(QLabel("Export"))
        layout.addWidget(self.meta_label)
        layout.addWidget(self.json_button)
        layout.addWidget(self.png_button)
        layout.addStretch(1)

        self.json_button.clicked.connect(self.export_json_requested.emit)
        self.png_button.clicked.connect(self.export_png_requested.emit)

    def set_enabled(self, enabled: bool) -> None:
        self.json_button.setEnabled(enabled)
        self.png_button.setEnabled(enabled)

    def set_meta(self, text: str) -> None:
        self.meta_label.setText(text)
