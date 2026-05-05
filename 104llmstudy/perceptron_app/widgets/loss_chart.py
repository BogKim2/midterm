from __future__ import annotations

from PySide6.QtCore import QPointF, QRectF, Qt
from PySide6.QtGui import QColor, QPainter, QPen
from PySide6.QtWidgets import QWidget


class LossChartWidget(QWidget):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setMinimumHeight(240)
        self.history: list[int] = []

    def set_history(self, history: list[int]) -> None:
        self.history = list(history)
        self.update()

    def clear(self) -> None:
        self.history = []
        self.update()

    def paintEvent(self, event) -> None:  # noqa: N802
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.fillRect(self.rect(), QColor("#1c2230"))
        area = QRectF(40, 20, self.width() - 60, self.height() - 50)
        self._draw_grid(painter, area)
        self._draw_axes(painter, area)
        self._draw_line(painter, area)
        self._draw_axis_labels(painter, area)

    def _draw_grid(self, painter: QPainter, area: QRectF) -> None:
        painter.setPen(QPen(QColor("#2b3347"), 1))
        for ratio in [0.25, 0.5, 0.75]:
            y = area.top() + area.height() * ratio
            painter.drawLine(QPointF(area.left(), y), QPointF(area.right(), y))

    def _draw_axes(self, painter: QPainter, area: QRectF) -> None:
        painter.setPen(QPen(QColor("#8692af"), 2))
        painter.drawRect(area)

    def _draw_line(self, painter: QPainter, area: QRectF) -> None:
        if len(self.history) < 2:
            return
        max_y = max(max(self.history), 1)
        points: list[QPointF] = []
        for index, value in enumerate(self.history):
            x_ratio = index / max(len(self.history) - 1, 1)
            y_ratio = value / max_y
            px = area.left() + x_ratio * area.width()
            py = area.bottom() - y_ratio * area.height()
            points.append(QPointF(px, py))
        painter.setPen(QPen(QColor("#5bd5a8"), 3))
        for start, end in zip(points[:-1], points[1:], strict=True):
            painter.drawLine(start, end)

    def _draw_axis_labels(self, painter: QPainter, area: QRectF) -> None:
        painter.setPen(QColor("#dce6ff"))
        painter.drawText(QRectF(area.left(), area.bottom() + 5, 80, 20), "Epoch")
        painter.save()
        painter.translate(16, area.center().y())
        painter.rotate(-90)
        painter.drawText(QRectF(-70, -20, 140, 20), Qt.AlignmentFlag.AlignCenter, "Errors")
        painter.restore()

