import numpy as np

from perceptron_app.core.perceptron import Perceptron


def test_step_activation_threshold() -> None:
    perceptron = Perceptron(weights=np.array([1.0, 1.0]), bias=-1.5)
    low = perceptron.forward(np.array([0.0, 1.0]))
    high = perceptron.forward(np.array([1.0, 1.0]))
    assert low["prediction"] == 0
    assert high["prediction"] == 1


def test_sigmoid_output_range() -> None:
    perceptron = Perceptron(weights=np.array([2.0, -1.0]), bias=0.25, activation="sigmoid")
    result = perceptron.forward(np.array([1.0, 0.0]))
    assert 0.0 < float(result["output"]) < 1.0


def test_forward_returns_weighted_sum() -> None:
    perceptron = Perceptron(weights=np.array([0.5, -0.25]), bias=0.1)
    result = perceptron.forward(np.array([1.0, 0.0]))
    assert result["z"] == 0.6


def test_weight_update_moves_toward_positive_target() -> None:
    perceptron = Perceptron(weights=np.array([0.0, 0.0]), bias=-0.1, learning_rate=0.5)
    changed = perceptron.train_step(np.array([1.0, 1.0]), 1.0)
    assert changed is True
    assert np.allclose(perceptron.weights, np.array([0.5, 0.5]))
    assert perceptron.bias == 0.4


def test_and_gate_convergence() -> None:
    X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
    Y = np.array([0, 0, 0, 1], dtype=float)
    perceptron = Perceptron(weights=np.array([0.0, 0.0]), bias=0.0, learning_rate=0.2)
    for _ in range(20):
        errors = perceptron.train_epoch(X, Y)
        if errors == 0:
            break
    predictions = [perceptron.forward(x)["prediction"] for x in X]
    assert predictions == [0, 0, 0, 1]


def test_or_gate_convergence() -> None:
    X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
    Y = np.array([0, 1, 1, 1], dtype=float)
    perceptron = Perceptron(weights=np.array([0.0, 0.0]), bias=0.0, learning_rate=0.2)
    for _ in range(20):
        errors = perceptron.train_epoch(X, Y)
        if errors == 0:
            break
    predictions = [perceptron.forward(x)["prediction"] for x in X]
    assert predictions == [0, 1, 1, 1]


def test_reset_restores_weights_and_bias() -> None:
    perceptron = Perceptron(weights=np.array([2.0, -3.0]), bias=1.0)
    perceptron.reset(weights=np.array([1.0, 1.0]), bias=-0.5)
    assert np.allclose(perceptron.weights, np.array([1.0, 1.0]))
    assert perceptron.bias == -0.5

