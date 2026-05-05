from __future__ import annotations

from pathlib import Path

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QPushButton,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

from perceptron_app.core.i18n import I18N
from perceptron_app.ui.tab_derivation import DerivationTab
from perceptron_app.ui.tab_simulation import SimulationTab
from perceptron_app.ui.tab_structure import StructureTab
from perceptron_app.ui.tab_training import TrainingTab


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.i18n = I18N("ko")
        self.title_label = QLabel()
        self.title_label.setObjectName("titleLabel")
        self.language_button = QPushButton()
        self.tabs = QTabWidget()
        self.structure_tab = StructureTab(self.i18n)
        self.simulation_tab = SimulationTab(self.i18n)
        self.derivation_tab = DerivationTab(self.i18n)
        self.training_tab = TrainingTab(self.i18n)
        self._load_stylesheet()
        self._build_ui()
        self._connect_signals()
        self._propagate_state(self.structure_tab.get_state())
        self.retranslate()

    def _load_stylesheet(self) -> None:
        style_path = Path(__file__).resolve().parent.parent / "assets" / "style.qss"
        self.setStyleSheet(style_path.read_text(encoding="utf-8"))

    def _build_ui(self) -> None:
        self.setWindowTitle("Perceptron Trainer")
        self.resize(1200, 760)
        central = QWidget()
        outer = QVBoxLayout(central)
        header = QHBoxLayout()
        header.addWidget(self.title_label)
        header.addStretch(1)
        header.addWidget(QLabel(self.i18n.t("language")))
        header.addWidget(self.language_button)
        outer.addLayout(header)
        outer.addWidget(self.tabs, 1)
        self.tabs.addTab(self.structure_tab, "")
        self.tabs.addTab(self.simulation_tab, "")
        self.tabs.addTab(self.derivation_tab, "")
        self.tabs.addTab(self.training_tab, "")
        self.setCentralWidget(central)

    def _connect_signals(self) -> None:
        self.language_button.clicked.connect(self._toggle_language)
        self.structure_tab.state_changed.connect(self._propagate_state)
        self.simulation_tab.preset_requested.connect(self.structure_tab.apply_weights)
        self.training_tab.training_completed.connect(self.structure_tab.apply_weights)

    def _propagate_state(self, state: dict) -> None:
        self.simulation_tab.on_state_changed(state)
        self.derivation_tab.on_state_changed(state)
        self.training_tab.on_state_changed(state)

    def _toggle_language(self) -> None:
        self.i18n.set_lang("en" if self.i18n.lang == "ko" else "ko")
        self.retranslate()

    def retranslate(self) -> None:
        self.title_label.setText(self.i18n.t("app_title"))
        self.language_button.setText(self.i18n.t("toggle_language"))
        self.tabs.setTabText(0, self.i18n.t("tab_structure"))
        self.tabs.setTabText(1, self.i18n.t("tab_simulation"))
        self.tabs.setTabText(2, self.i18n.t("tab_derivation"))
        self.tabs.setTabText(3, self.i18n.t("tab_training"))
        self.structure_tab.retranslate()
        self.simulation_tab.retranslate()
        self.derivation_tab.retranslate()
        self.training_tab.retranslate()

