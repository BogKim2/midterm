from __future__ import annotations

from PySide6.QtWidgets import (
    QCheckBox,
    QDialog,
    QDialogButtonBox,
    QFormLayout,
    QLineEdit,
    QSpinBox,
    QVBoxLayout,
)

from smart_doc_analyzer.config.settings import AppSettings, LlmSettings


class SettingsDialog(QDialog):
    def __init__(self, settings: AppSettings, parent=None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Settings")
        self.enabled_checkbox = QCheckBox("Use local LLM via LM Studio")
        self.enabled_checkbox.setChecked(settings.llm.enabled)
        self.endpoint_edit = QLineEdit(settings.llm.endpoint)
        self.model_edit = QLineEdit(settings.llm.model_name)
        self.timeout_spin = QSpinBox()
        self.timeout_spin.setRange(1, 120)
        self.timeout_spin.setValue(int(settings.llm.timeout_seconds))
        self.max_tokens_spin = QSpinBox()
        self.max_tokens_spin.setRange(50, 4000)
        self.max_tokens_spin.setValue(settings.llm.max_tokens)

        form = QFormLayout()
        form.addRow(self.enabled_checkbox)
        form.addRow("Endpoint", self.endpoint_edit)
        form.addRow("Model", self.model_edit)
        form.addRow("Timeout (sec)", self.timeout_spin)
        form.addRow("Max tokens", self.max_tokens_spin)

        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)

        layout = QVBoxLayout(self)
        layout.addLayout(form)
        layout.addWidget(buttons)

    def to_settings(self) -> AppSettings:
        return AppSettings(
            llm=LlmSettings(
                enabled=self.enabled_checkbox.isChecked(),
                endpoint=self.endpoint_edit.text().strip(),
                model_name=self.model_edit.text().strip(),
                timeout_seconds=float(self.timeout_spin.value()),
                max_tokens=int(self.max_tokens_spin.value()),
            )
        )
