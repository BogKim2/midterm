from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import numpy as np


ActivationName = Literal["step", "sigmoid"]


@dataclass
class Perceptron:
    weights: np.ndarray
    bias: float = 0.0
    learning_rate: float = 0.1
    activation: ActivationName = "step"

    def __post_init__(self) -> None:
        self.weights = np.asarray(self.weights, dtype=float)

    def _activate(self, z: float) -> float:
        if self.activation == "sigmoid":
            return float(1.0 / (1.0 + np.exp(-z)))
        return 1.0 if z >= 0 else 0.0

    def forward(self, x: np.ndarray) -> dict[str, float | int]:
        x = np.asarray(x, dtype=float)
        z = float(np.dot(self.weights, x) + self.bias)
        output = self._activate(z)
        prediction = 1 if output >= 0.5 else 0
        return {
            "z": z,
            "output": output,
            "prediction": prediction,
        }

    def train_step(self, x: np.ndarray, y: float) -> bool:
        x = np.asarray(x, dtype=float)
        target = float(y)
        forward = self.forward(x)
        error = target - float(forward["prediction"])
        if error == 0:
            return False
        self.weights = self.weights + self.learning_rate * error * x
        self.bias = self.bias + self.learning_rate * error
        return True

    def train_epoch(self, X: np.ndarray, Y: np.ndarray) -> int:
        X = np.asarray(X, dtype=float)
        Y = np.asarray(Y, dtype=float)
        misclassified = 0
        for x, y in zip(X, Y, strict=True):
            changed = self.train_step(x, y)
            if changed:
                misclassified += 1
        return misclassified

    def reset(self, weights: np.ndarray | None = None, bias: float = 0.0) -> None:
        if weights is None:
            self.weights = np.zeros_like(self.weights, dtype=float)
        else:
            self.weights = np.asarray(weights, dtype=float)
        self.bias = float(bias)

