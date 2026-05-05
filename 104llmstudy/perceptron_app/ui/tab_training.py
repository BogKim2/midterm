from __future__ import annotations

from PySide6.QtCore import QObject, QThread, Signal
from PySide6.QtWidgets import (
    QDoubleSpinBox,
    QFormLayout,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSpinBox,
    QTableWidget,
    QTableWidgetItem,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from perceptron_app.core.i18n import I18N
from perceptron_app.core.perceptron import Perceptron
from perceptron_app.widgets.loss_chart import LossChartWidget


class TrainingWorker(QObject):
    epoch_finished = Signal(int, int, list, float)
    finished = Signal(list, float, list)
    stopped = Signal()

    def __init__(
        self,
        weights: list[float],
        bias: float,
        learning_rate: float,
        epochs: int,
        X: list[list[float]],
        Y: list[float],
    ) -> None:
        super().__init__()
        self.perceptron = Perceptron(weights=weights, bias=bias, learning_rate=learning_rate)
        self.epochs = epochs
        self.X = X
        self.Y = Y
        self._stop_requested = False

    def run(self) -> None:
        history: list[int] = []
        for epoch in range(1, self.epochs + 1):
            if self._stop_requested:
                self.stopped.emit()
                return
            errors = self.perceptron.train_epoch(self.X, self.Y)
            history.append(errors)
            self.epoch_finished.emit(epoch, errors, self.perceptron.weights.tolist(), self.perceptron.bias)
            if errors == 0:
                break
        self.finished.emit(self.perceptron.weights.tolist(), self.perceptron.bias, history)

    def stop(self) -> None:
        self._stop_requested = True


class TrainingTab(QWidget):
    training_completed = Signal(list, float)

    def __init__(self, i18n: I18N, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.i18n = i18n
        self.current_weights = [1.0, 1.0]
        self.current_bias = -0.5
        self.thread: QThread | None = None
        self.worker: TrainingWorker | None = None
        self.history: list[int] = []
        self.data_table = QTableWidget(4, 3)
        self.learning_rate_spin = QDoubleSpinBox()
        self.epoch_spin = QSpinBox()
        self.start_button = QPushButton()
        self.stop_button = QPushButton()
        self.status_label = QLabel()
        self.log = QTextEdit()
        self.chart = LossChartWidget()
        self.learning_rate_name = QLabel()
        self.epochs_name = QLabel()
        self.status_key = "status_ready"
        self._build_ui()

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)
        top = QHBoxLayout()
        table_box = QGroupBox()
        table_layout = QVBoxLayout(table_box)
        table_layout.addWidget(self.data_table)

        control_box = QGroupBox()
        control_layout = QVBoxLayout(control_box)
        form = QFormLayout()
        self.learning_rate_spin.setRange(0.01, 5.0)
        self.learning_rate_spin.setSingleStep(0.05)
        self.learning_rate_spin.setValue(0.2)
        self.epoch_spin.setRange(1, 500)
        self.epoch_spin.setValue(20)
        form.addRow(self.learning_rate_name, self.learning_rate_spin)
        form.addRow(self.epochs_name, self.epoch_spin)
        control_layout.addLayout(form)
        control_layout.addWidget(self.status_label)
        control_layout.addWidget(self.start_button)
        control_layout.addWidget(self.stop_button)
        control_layout.addStretch(1)

        top.addWidget(table_box, 3)
        top.addWidget(control_box, 2)
        layout.addLayout(top)
        layout.addWidget(self.chart)
        layout.addWidget(self.log)

        self.log.setReadOnly(True)
        self.stop_button.setEnabled(False)
        self._build_data_table()
        self.start_button.clicked.connect(self._start_training)
        self.stop_button.clicked.connect(self._stop_training)
        self.retranslate()

    def _build_data_table(self) -> None:
        defaults = [(0, 0, 0), (0, 1, 0), (1, 0, 0), (1, 1, 1)]
        self.data_table.setHorizontalHeaderLabels(["x1", "x2", "y"])
        for row, values in enumerate(defaults):
            for column, value in enumerate(values):
                self.data_table.setItem(row, column, QTableWidgetItem(str(value)))

    def _collect_training_data(self) -> tuple[list[list[float]], list[float]]:
        X: list[list[float]] = []
        Y: list[float] = []
        for row in range(self.data_table.rowCount()):
            x1 = float(self.data_table.item(row, 0).text())
            x2 = float(self.data_table.item(row, 1).text())
            y = float(self.data_table.item(row, 2).text())
            X.append([x1, x2])
            Y.append(y)
        return X, Y

    def _start_training(self) -> None:
        X, Y = self._collect_training_data()
        self.history = []
        self.chart.clear()
        self.log.clear()
        self.status_key = "status_training"
        self.status_label.setText(self.i18n.t(self.status_key))
        self.thread = QThread(self)
        self.worker = TrainingWorker(
            weights=self.current_weights,
            bias=self.current_bias,
            learning_rate=float(self.learning_rate_spin.value()),
            epochs=int(self.epoch_spin.value()),
            X=X,
            Y=Y,
        )
        self.worker.moveToThread(self.thread)
        self.thread.started.connect(self.worker.run)
        self.worker.epoch_finished.connect(self._on_epoch_finished)
        self.worker.finished.connect(self._on_training_finished)
        self.worker.stopped.connect(self._on_training_stopped)
        self.worker.finished.connect(self.thread.quit)
        self.worker.stopped.connect(self.thread.quit)
        self.thread.finished.connect(self.thread.deleteLater)
        self.start_button.setEnabled(False)
        self.stop_button.setEnabled(True)
        self.thread.start()

    def _stop_training(self) -> None:
        if self.worker is not None:
            self.worker.stop()

    def _on_epoch_finished(self, epoch: int, errors: int, weights: list, bias: float) -> None:
        self.current_weights = list(weights)
        self.current_bias = float(bias)
        self.history.append(errors)
        self.chart.set_history(self.history)
        self._append_log(f"epoch={epoch}, errors={errors}, weights={weights}, bias={bias:.3f}")

    def _on_training_finished(self, weights: list, bias: float, history: list) -> None:
        self.current_weights = list(weights)
        self.current_bias = float(bias)
        self.status_key = "status_completed"
        self.status_label.setText(self.i18n.t(self.status_key))
        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.training_completed.emit(self.current_weights, self.current_bias)
        self._append_log(f"done: weights={weights}, bias={bias:.3f}, history={history}")
        self.worker = None
        self.thread = None

    def _on_training_stopped(self) -> None:
        self.status_key = "status_stopped"
        self.status_label.setText(self.i18n.t(self.status_key))
        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self._append_log("training stopped")
        self.worker = None
        self.thread = None

    def _append_log(self, text: str) -> None:
        self.log.append(text)

    def on_state_changed(self, state: dict) -> None:
        self.current_weights = list(state["weights"])
        self.current_bias = float(state["bias"])

    def retranslate(self) -> None:
        group_boxes = self.findChildren(QGroupBox)
        group_boxes[0].setTitle(self.i18n.t("training_data"))
        group_boxes[1].setTitle(self.i18n.t("tab_training"))
        self.learning_rate_name.setText(self.i18n.t("learning_rate"))
        self.epochs_name.setText(self.i18n.t("epochs"))
        self.start_button.setText(self.i18n.t("start_training"))
        self.stop_button.setText(self.i18n.t("stop_training"))
        self.status_label.setText(self.i18n.t(self.status_key))
