from __future__ import annotations

from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QColor
from PySide6.QtWidgets import (
    QComboBox,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QTableWidget,
    QTableWidgetItem,
    QVBoxLayout,
    QWidget,
)

from perceptron_app.core.i18n import I18N
from perceptron_app.core.perceptron import Perceptron
from perceptron_app.widgets.decision_boundary import DecisionBoundaryWidget

GATES = {
    "AND": [(0, 0, 0), (0, 1, 0), (1, 0, 0), (1, 1, 1)],
    "OR": [(0, 0, 0), (0, 1, 1), (1, 0, 1), (1, 1, 1)],
    "XOR": [(0, 0, 0), (0, 1, 1), (1, 0, 1), (1, 1, 0)],
}

OPTIMAL_WEIGHTS = {
    "AND": ([1.0, 1.0], -1.5),
    "OR": ([1.0, 1.0], -0.5),
    "XOR": ([1.0, 1.0], -0.5),
}


class SimulationTab(QWidget):
    preset_requested = Signal(list, float)

    def __init__(self, i18n: I18N, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.i18n = i18n
        self.state = {"weights": [1.0, 1.0], "bias": -0.5, "activation": "step"}
        self.gate_combo = QComboBox()
        self.auto_button = QPushButton()
        self.warning_label = QLabel()
        self.table = QTableWidget(4, 4)
        self.boundary = DecisionBoundaryWidget()
        self._build_ui()
        self._refresh()

    def _build_ui(self) -> None:
        layout = QHBoxLayout(self)
        left = QVBoxLayout()
        control_box = QGroupBox()
        control_layout = QVBoxLayout(control_box)
        self.gate_combo.addItems(list(GATES.keys()))
        control_layout.addWidget(self.gate_combo)
        control_layout.addWidget(self.auto_button)
        control_layout.addWidget(self.warning_label)
        left.addWidget(control_box)
        left.addWidget(self.table, 1)
        layout.addLayout(left, 2)
        layout.addWidget(self.boundary, 3)

        self.table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.gate_combo.currentIndexChanged.connect(self._refresh)
        self.auto_button.clicked.connect(self._auto_weights)
        self.retranslate()

    def _current_gate(self) -> str:
        return self.gate_combo.currentText()

    def _update_table(self) -> None:
        gate = self._current_gate()
        perceptron = Perceptron(
            weights=self.state["weights"],
            bias=self.state["bias"],
            activation=self.state["activation"],
        )
        rows = GATES[gate]
        self.table.setRowCount(len(rows))
        predictions = []
        for row_index, (x1, x2, target) in enumerate(rows):
            prediction = int(perceptron.forward([x1, x2])["prediction"])
            predictions.append(prediction)
            values = [x1, x2, target, prediction]
            for column, value in enumerate(values):
                item = QTableWidgetItem(str(value))
                if column == 3:
                    item.setBackground(QColor("#1f5a43" if prediction == target else "#6e4528"))
                self.table.setItem(row_index, column, item)
        self.boundary.set_state(self.state["weights"], self.state["bias"], rows, predictions)

    def _refresh(self) -> None:
        self._update_table()
        self.warning_label.setVisible(self._current_gate() == "XOR")

    def on_state_changed(self, state: dict) -> None:
        self.state = {
            "weights": list(state["weights"]),
            "bias": float(state["bias"]),
            "activation": str(state["activation"]),
        }
        self._refresh()

    def _auto_weights(self) -> None:
        weights, bias = OPTIMAL_WEIGHTS[self._current_gate()]
        self.preset_requested.emit(weights, bias)

    def retranslate(self) -> None:
        box = self.findChildren(QGroupBox)[0]
        box.setTitle(self.i18n.t("gate"))
        self.auto_button.setText(self.i18n.t("auto_weights"))
        self.warning_label.setWordWrap(True)
        self.warning_label.setStyleSheet("color: #ff9d57;")
        self.warning_label.setText(self.i18n.t("xor_warning"))
        self.table.setHorizontalHeaderLabels(["x1", "x2", "t", "p"])

