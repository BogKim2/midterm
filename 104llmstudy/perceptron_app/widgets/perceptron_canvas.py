from __future__ import annotations

from PySide6.QtCore import QPointF, QRectF, Qt
from PySide6.QtGui import QColor, QPainter, QPen
from PySide6.QtWidgets import QWidget


class PerceptronCanvas(QWidget):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setMinimumHeight(320)
        self.state = {
            "weights": [1.0, 1.0],
            "bias": -0.5,
            "inputs": [1, 1],
            "z": 1.5,
            "output": 1.0,
            "activation": "step",
            "prediction": 1,
        }

    def set_state(
        self,
        weights: list[float],
        bias: float,
        inputs: list[int],
        z: float,
        output: float,
        activation: str,
        prediction: int,
    ) -> None:
        self.state = {
            "weights": weights,
            "bias": bias,
            "inputs": inputs,
            "z": z,
            "output": output,
            "activation": activation,
            "prediction": prediction,
        }
        self.update()

    def paintEvent(self, event) -> None:  # noqa: N802
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.fillRect(self.rect(), QColor("#1c2230"))
        self._draw_edges(painter)
        self._draw_nodes(painter)
        self._draw_bottom_label(painter)

    def _draw_edges(self, painter: QPainter) -> None:
        input_points = [QPointF(90, 90), QPointF(90, 220)]
        sum_point = QPointF(270, 155)
        activation_point = QPointF(420, 155)
        output_point = QPointF(560, 155)

        for index, point in enumerate(input_points):
            painter.setPen(QPen(QColor("#5bd5a8"), 3))
            painter.drawLine(point, sum_point)
            mid = QPointF((point.x() + sum_point.x()) / 2, (point.y() + sum_point.y()) / 2)
            painter.setPen(QColor("#dce6ff"))
            painter.drawText(mid, f"w{index + 1}={self.state['weights'][index]:.1f}")

        painter.setPen(QPen(QColor("#b16cff"), 3, Qt.PenStyle.DashLine))
        painter.drawLine(QPointF(270, 35), sum_point)
        painter.setPen(QColor("#dce6ff"))
        painter.drawText(QPointF(278, 70), f"b={self.state['bias']:.1f}")

        painter.setPen(QPen(QColor("#58b8ff"), 3))
        painter.drawLine(sum_point, activation_point)
        painter.drawLine(activation_point, output_point)

    def _draw_nodes(self, painter: QPainter) -> None:
        node_specs = [
            (QRectF(55, 55, 70, 70), "#244868", f"x1={self.state['inputs'][0]}"),
            (QRectF(55, 185, 70, 70), "#244868", f"x2={self.state['inputs'][1]}"),
            (QRectF(235, 120, 70, 70), "#2f6f4f", f"z={self.state['z']:.2f}"),
            (QRectF(385, 120, 70, 70), "#6c4b8f", self.state["activation"]),
            (
                QRectF(525, 120, 70, 70),
                "#2a5fff",
                f"y={self.state['output']:.2f}\np={self.state['prediction']}",
            ),
        ]
        for rect, color, label in node_specs:
            painter.setBrush(QColor(color))
            painter.setPen(Qt.PenStyle.NoPen)
            painter.drawEllipse(rect)
            painter.setPen(QColor("#f4f7ff"))
            painter.drawText(rect, Qt.AlignmentFlag.AlignCenter, label)

    def _draw_bottom_label(self, painter: QPainter) -> None:
        painter.setPen(QColor("#dce6ff"))
        painter.drawText(
            QRectF(40, 280, 560, 28),
            Qt.AlignmentFlag.AlignCenter,
            "z = w1*x1 + w2*x2 + b",
        )

