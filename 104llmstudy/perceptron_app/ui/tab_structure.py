from __future__ import annotations

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QComboBox,
    QFormLayout,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSlider,
    QVBoxLayout,
    QWidget,
)

from perceptron_app.core.i18n import I18N
from perceptron_app.core.perceptron import Perceptron
from perceptron_app.widgets.perceptron_canvas import PerceptronCanvas


class StructureTab(QWidget):
    state_changed = Signal(dict)

    def __init__(self, i18n: I18N, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.i18n = i18n
        self.canvas = PerceptronCanvas()
        self.weight_1_slider = QSlider(Qt.Orientation.Horizontal)
        self.weight_2_slider = QSlider(Qt.Orientation.Horizontal)
        self.bias_slider = QSlider(Qt.Orientation.Horizontal)
        self.weight_1_value = QLabel()
        self.weight_2_value = QLabel()
        self.bias_value = QLabel()
        self.input_1_combo = QComboBox()
        self.input_2_combo = QComboBox()
        self.activation_combo = QComboBox()
        self.output_label = QLabel()
        self.reset_button = QPushButton()
        self.weight_1_name = QLabel("w1")
        self.weight_2_name = QLabel("w2")
        self.bias_name = QLabel()
        self.input_1_name = QLabel("x1")
        self.input_2_name = QLabel("x2")
        self.activation_name = QLabel()
        self.output_name = QLabel()
        self._build_ui()
        self._refresh()

    def _build_ui(self) -> None:
        layout = QHBoxLayout(self)
        layout.addWidget(self.canvas, 3)

        controls = QGroupBox()
        controls_layout = QVBoxLayout(controls)
        form = QFormLayout()

        self.weight_1_slider.setRange(-20, 20)
        self.weight_2_slider.setRange(-20, 20)
        self.bias_slider.setRange(-20, 20)
        self.weight_1_slider.setValue(10)
        self.weight_2_slider.setValue(10)
        self.bias_slider.setValue(-5)

        for combo in (self.input_1_combo, self.input_2_combo):
            combo.addItems(["0", "1"])
        self.input_1_combo.setCurrentText("1")
        self.input_2_combo.setCurrentText("1")

        self.activation_combo.addItem("step", "step")
        self.activation_combo.addItem("sigmoid", "sigmoid")

        form.addRow(self.weight_1_name, self._make_slider_row(self.weight_1_slider, self.weight_1_value))
        form.addRow(self.weight_2_name, self._make_slider_row(self.weight_2_slider, self.weight_2_value))
        form.addRow(self.bias_name, self._make_slider_row(self.bias_slider, self.bias_value))
        form.addRow(self.input_1_name, self.input_1_combo)
        form.addRow(self.input_2_name, self.input_2_combo)
        form.addRow(self.activation_name, self.activation_combo)
        form.addRow(self.output_name, self.output_label)
        controls_layout.addLayout(form)
        controls_layout.addWidget(self.reset_button)
        controls_layout.addStretch(1)

        for widget in (
            self.weight_1_slider,
            self.weight_2_slider,
            self.bias_slider,
            self.input_1_combo,
            self.input_2_combo,
            self.activation_combo,
        ):
            signal = widget.valueChanged if isinstance(widget, QSlider) else widget.currentIndexChanged
            signal.connect(self._refresh)
        self.reset_button.clicked.connect(self._reset_weights)

        layout.addWidget(controls, 2)
        self.retranslate()

    def _make_slider_row(self, slider: QSlider, value_label: QLabel) -> QWidget:
        row = QWidget()
        row_layout = QHBoxLayout(row)
        row_layout.setContentsMargins(0, 0, 0, 0)
        row_layout.addWidget(slider, 1)
        row_layout.addWidget(value_label)
        return row

    def _get_weights(self) -> list[float]:
        return [self.weight_1_slider.value() / 10.0, self.weight_2_slider.value() / 10.0]

    def _get_inputs(self) -> list[int]:
        return [int(self.input_1_combo.currentText()), int(self.input_2_combo.currentText())]

    def _refresh(self) -> None:
        weights = self._get_weights()
        bias = self.bias_slider.value() / 10.0
        inputs = self._get_inputs()
        activation = self.activation_combo.currentData()
        perceptron = Perceptron(weights=weights, bias=bias, activation=activation)
        result = perceptron.forward(inputs)
        self.weight_1_value.setText(f"{weights[0]:.1f}")
        self.weight_2_value.setText(f"{weights[1]:.1f}")
        self.bias_value.setText(f"{bias:.1f}")
        self.output_label.setText(
            f"{self.i18n.t('output')}: {float(result['output']):.3f} | "
            f"{self.i18n.t('prediction')}: {int(result['prediction'])}"
        )
        self.canvas.set_state(
            weights=weights,
            bias=bias,
            inputs=inputs,
            z=float(result["z"]),
            output=float(result["output"]),
            activation=str(activation),
            prediction=int(result["prediction"]),
        )
        self.state_changed.emit(self.get_state())

    def _reset_weights(self) -> None:
        self.weight_1_slider.setValue(10)
        self.weight_2_slider.setValue(10)
        self.bias_slider.setValue(-5)
        self.input_1_combo.setCurrentText("1")
        self.input_2_combo.setCurrentText("1")
        self.activation_combo.setCurrentIndex(0)
        self._refresh()

    def apply_weights(self, weights: list[float], bias: float) -> None:
        self.weight_1_slider.setValue(int(round(weights[0] * 10)))
        self.weight_2_slider.setValue(int(round(weights[1] * 10)))
        self.bias_slider.setValue(int(round(bias * 10)))
        self._refresh()

    def get_state(self) -> dict:
        weights = self._get_weights()
        bias = self.bias_slider.value() / 10.0
        inputs = self._get_inputs()
        activation = self.activation_combo.currentData()
        result = Perceptron(weights=weights, bias=bias, activation=activation).forward(inputs)
        return {
            "weights": weights,
            "bias": bias,
            "inputs": inputs,
            "activation": activation,
            "z": float(result["z"]),
            "output": float(result["output"]),
            "prediction": int(result["prediction"]),
        }

    def retranslate(self) -> None:
        group = self.findChildren(QGroupBox)[0]
        group.setTitle(self.i18n.t("tab_structure"))
        self.bias_name.setText(self.i18n.t("bias"))
        self.activation_name.setText(self.i18n.t("activation"))
        self.output_name.setText(self.i18n.t("output"))
        self.reset_button.setText(self.i18n.t("reset"))
        self._refresh()
