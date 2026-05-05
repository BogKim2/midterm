from __future__ import annotations

from PySide6.QtCore import QPointF, QRectF, Qt
from PySide6.QtGui import QColor, QPainter, QPen
from PySide6.QtWidgets import QWidget


class DecisionBoundaryWidget(QWidget):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setMinimumHeight(280)
        self.weights = [1.0, 1.0]
        self.bias = -0.5
        self.data_points: list[tuple[float, float, int]] = []
        self.predictions: list[int] = []

    def set_state(
        self,
        weights: list[float],
        bias: float,
        data_points: list[tuple[float, float, int]],
        predictions: list[int],
    ) -> None:
        self.weights = weights
        self.bias = bias
        self.data_points = data_points
        self.predictions = predictions
        self.update()

    def paintEvent(self, event) -> None:  # noqa: N802
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.fillRect(self.rect(), QColor("#1c2230"))
        area = QRectF(40, 20, self.width() - 60, self.height() - 50)
        self._draw_grid(painter, area)
        self._draw_axes(painter, area)
        self._draw_boundary(painter, area)
        self._draw_points(painter, area)

    def _map(self, area: QRectF, x: float, y: float) -> QPointF:
        x_norm = (x + 0.5) / 2.0
        y_norm = (y + 0.5) / 2.0
        px = area.left() + x_norm * area.width()
        py = area.bottom() - y_norm * area.height()
        return QPointF(px, py)

    def _draw_grid(self, painter: QPainter, area: QRectF) -> None:
        painter.setPen(QPen(QColor("#2b3347"), 1))
        for tick in [0.0, 0.5, 1.0]:
            start_v = self._map(area, tick, -0.5)
            end_v = self._map(area, tick, 1.5)
            painter.drawLine(start_v, end_v)
            start_h = self._map(area, -0.5, tick)
            end_h = self._map(area, 1.5, tick)
            painter.drawLine(start_h, end_h)

    def _draw_axes(self, painter: QPainter, area: QRectF) -> None:
        painter.setPen(QPen(QColor("#8692af"), 2))
        painter.drawRect(area)
        painter.drawText(QRectF(area.left(), area.bottom() + 5, 60, 20), "0")
        painter.drawText(QRectF(area.right() - 10, area.bottom() + 5, 60, 20), "1")
        painter.drawText(QRectF(area.left() - 24, area.top() - 10, 24, 20), "1")
        painter.drawText(QRectF(area.left() - 24, area.bottom() - 10, 24, 20), "0")

    def _draw_boundary(self, painter: QPainter, area: QRectF) -> None:
        w1, w2 = self.weights
        painter.setPen(QPen(QColor("#58b8ff"), 3))
        if abs(w2) < 1e-6:
            if abs(w1) < 1e-6:
                return
            x = -self.bias / w1
            p1 = self._map(area, x, -0.5)
            p2 = self._map(area, x, 1.5)
            painter.drawLine(p1, p2)
            return
        y1 = (-self.bias - w1 * -0.5) / w2
        y2 = (-self.bias - w1 * 1.5) / w2
        painter.drawLine(self._map(area, -0.5, y1), self._map(area, 1.5, y2))

    def _draw_points(self, painter: QPainter, area: QRectF) -> None:
        for index, (x, y, label) in enumerate(self.data_points):
            prediction = self.predictions[index] if index < len(self.predictions) else 0
            point = self._map(area, x, y)
            color = "#5bd5a8" if prediction == label else "#ff9d57"
            painter.setBrush(QColor(color))
            painter.setPen(Qt.PenStyle.NoPen)
            painter.drawEllipse(point, 10, 10)
            painter.setPen(QColor("#f4f7ff"))
            painter.drawText(point + QPointF(12, -8), f"t={label}, p={prediction}")

