from __future__ import annotations

from PySide6.QtWidgets import (
    QComboBox,
    QFrame,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

from perceptron_app.core.i18n import I18N


class StepCard(QFrame):
    def __init__(self, title: str = "", body: str = "", parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setProperty("card", True)
        layout = QVBoxLayout(self)
        self.title_label = QLabel(title)
        self.body_label = QLabel(body)
        self.body_label.setWordWrap(True)
        layout.addWidget(self.title_label)
        layout.addWidget(self.body_label)

    def set_content(self, title: str, body: str) -> None:
        self.title_label.setText(title)
        self.body_label.setText(body)


class DerivationTab(QWidget):
    def __init__(self, i18n: I18N, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.i18n = i18n
        self.state = {
            "weights": [1.0, 1.0],
            "bias": -0.5,
            "inputs": [1, 1],
            "activation": "step",
            "z": 1.5,
            "output": 1.0,
            "prediction": 1,
        }
        self.visible_steps = 1
        self.activation_combo = QComboBox()
        self.next_button = QPushButton()
        self.show_all_button = QPushButton()
        self.cards: list[StepCard] = []
        self._build_ui()
        self._render_cards()

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)
        top = QHBoxLayout()
        self.activation_combo.addItem("step", "step")
        self.activation_combo.addItem("sigmoid", "sigmoid")
        top.addWidget(QLabel(self.i18n.t("activation")))
        top.addWidget(self.activation_combo)
        top.addStretch(1)
        top.addWidget(self.next_button)
        top.addWidget(self.show_all_button)
        layout.addLayout(top)

        for _ in range(4):
            card = StepCard()
            self.cards.append(card)
            layout.addWidget(card)

        self.activation_combo.currentIndexChanged.connect(self._on_activation_changed)
        self.next_button.clicked.connect(self._next_step)
        self.show_all_button.clicked.connect(self._show_all)
        self.retranslate()

    def _build_steps(self) -> list[tuple[str, str]]:
        w1, w2 = self.state["weights"]
        x1, x2 = self.state["inputs"]
        bias = self.state["bias"]
        z = self.state["z"]
        output = self.state["output"]
        prediction = self.state["prediction"]
        activation = self.state["activation"]
        return [
            (self.i18n.t("step_1"), "z = w1*x1 + w2*x2 + b"),
            (self.i18n.t("step_2"), f"z = ({w1:.1f}*{x1}) + ({w2:.1f}*{x2}) + ({bias:.1f}) = {z:.3f}"),
            (self.i18n.t("step_3"), f"{activation}(z) = {output:.3f}"),
            (self.i18n.t("step_4"), f"prediction = 1 if output >= 0.5 else 0 -> {prediction}"),
        ]

    def _render_cards(self) -> None:
        for index, card in enumerate(self.cards):
            title, body = self._build_steps()[index]
            card.set_content(title, body)
            card.setVisible(index < self.visible_steps)

    def on_state_changed(self, state: dict) -> None:
        self.state = dict(state)
        index = self.activation_combo.findData(self.state["activation"])
        if index >= 0 and index != self.activation_combo.currentIndex():
            self.activation_combo.setCurrentIndex(index)
        self._render_cards()

    def _next_step(self) -> None:
        self.visible_steps = min(4, self.visible_steps + 1)
        self._render_cards()

    def _show_all(self) -> None:
        self.visible_steps = 4
        self._render_cards()

    def _reset_steps(self) -> None:
        self.visible_steps = 1
        self._render_cards()

    def _on_activation_changed(self) -> None:
        self.state["activation"] = self.activation_combo.currentData()
        self._render_cards()

    def retranslate(self) -> None:
        self.next_button.setText(self.i18n.t("next_step"))
        self.show_all_button.setText(self.i18n.t("show_all"))
        self._render_cards()
