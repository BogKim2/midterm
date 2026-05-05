from __future__ import annotations

from PySide6.QtWidgets import QLabel, QTextEdit, QVBoxLayout, QWidget

from smart_doc_analyzer.core.models import AnalysisResult


class OverviewTab(QWidget):
    def __init__(self) -> None:
        super().__init__()
        self.stats_label = QLabel("No analysis yet.")
        self.stats_label.setWordWrap(True)
        self.summary_box = QTextEdit()
        self.summary_box.setReadOnly(True)

        layout = QVBoxLayout(self)
        layout.addWidget(QLabel("Overview"))
        layout.addWidget(self.stats_label)
        layout.addWidget(self.summary_box)

    def render(self, result: AnalysisResult) -> None:
        stats = result.stats
        readability = result.readability
        sentiment = result.sentiment
        llm = result.llm
        self.stats_label.setText(
            "\n".join(
                [
                    f"Source: {result.source_name}",
                    f"Language: {result.language}",
                    f"Words: {stats.word_count}",
                    f"Sentences: {stats.sentence_count}",
                    f"Paragraphs: {stats.paragraph_count}",
                    f"Unique Words: {stats.unique_word_count}",
                    f"Average Sentence Length: {stats.average_sentence_length:.2f}",
                    f"Sentiment: {sentiment.label} ({sentiment.source})",
                    f"Readability: {readability.grade}",
                    f"Elapsed: {result.elapsed_seconds:.3f}s",
                ]
            )
        )
        blocks = []
        if llm.summary:
            blocks.append(f"Summary\n{llm.summary}")
        if llm.tone:
            blocks.append(f"Tone\n{llm.tone}")
        if llm.insights:
            blocks.append("Insights\n" + "\n".join(f"- {item}" for item in llm.insights))
        if llm.llm_error:
            blocks.append(f"LLM Fallback\n{llm.llm_error}")
        if not blocks:
            blocks.append("No LLM interpretation available.")
        self.summary_box.setPlainText("\n\n".join(blocks))
