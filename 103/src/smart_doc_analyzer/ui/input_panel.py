from __future__ import annotations

from PySide6.QtCore import Signal
from PySide6.QtWidgets import (
    QHBoxLayout,
    QLabel,
    QPushButton,
    QPlainTextEdit,
    QVBoxLayout,
    QWidget,
)


class InputPanel(QWidget):
    analyze_requested = Signal()
    open_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.file_label = QLabel("Source: Manual input")
        self.char_count_label = QLabel("Characters: 0")
        self.editor = QPlainTextEdit()
        self.editor.setPlaceholderText("Paste or type document text here.")
        self.open_button = QPushButton("Open File")
        self.clear_button = QPushButton("Clear")
        self.analyze_button = QPushButton("Analyze")
        self.analyze_button.setEnabled(False)

        top = QVBoxLayout(self)
        top.addWidget(QLabel("Input"))
        top.addWidget(self.file_label)
        top.addWidget(self.char_count_label)
        top.addWidget(self.editor)

        actions = QHBoxLayout()
        actions.addWidget(self.open_button)
        actions.addWidget(self.clear_button)
        actions.addWidget(self.analyze_button)
        top.addLayout(actions)

        self.editor.textChanged.connect(self._update_state)
        self.open_button.clicked.connect(self.open_requested.emit)
        self.clear_button.clicked.connect(self._clear)
        self.analyze_button.clicked.connect(self.analyze_requested.emit)

    def _clear(self) -> None:
        self.editor.clear()
        self.file_label.setText("Source: Manual input")

    def _update_state(self) -> None:
        text = self.text()
        self.char_count_label.setText(f"Characters: {len(text)}")
        self.analyze_button.setEnabled(len(text.strip()) >= 20)

    def text(self) -> str:
        return self.editor.toPlainText()

    def set_text(self, text: str, source_name: str) -> None:
        self.editor.setPlainText(text)
        self.file_label.setText(f"Source: {source_name}")

    def set_busy(self, busy: bool) -> None:
        self.editor.setReadOnly(busy)
        self.open_button.setEnabled(not busy)
        self.clear_button.setEnabled(not busy)
        self.analyze_button.setEnabled((not busy) and len(self.text().strip()) >= 20)
