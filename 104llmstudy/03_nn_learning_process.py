from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np


OUTPUT_DIR = Path(__file__).resolve().parent / "outputs"
SEED = 7


def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def sigmoid_grad(x: np.ndarray) -> np.ndarray:
    s = sigmoid(x)
    return s * (1.0 - s)


def tanh_act(x: np.ndarray) -> np.ndarray:
    return np.tanh(x)


def tanh_grad(x: np.ndarray) -> np.ndarray:
    return 1.0 - np.tanh(x) ** 2


def relu(x: np.ndarray) -> np.ndarray:
    return np.maximum(0.0, x)


def relu_grad(x: np.ndarray) -> np.ndarray:
    return (x > 0).astype(float)


def leaky_relu(x: np.ndarray, alpha: float = 0.1) -> np.ndarray:
    return np.where(x > 0, x, alpha * x)


def leaky_relu_grad(x: np.ndarray, alpha: float = 0.1) -> np.ndarray:
    return np.where(x > 0, 1.0, alpha)


ACTIVATIONS = {
    "sigmoid": (sigmoid, sigmoid_grad),
    "tanh": (tanh_act, tanh_grad),
    "relu": (relu, relu_grad),
}


@dataclass
class LayerCache:
    z: np.ndarray
    a: np.ndarray


class MLP:
    def __init__(
        self,
        layers: list[int],
        activation: str = "tanh",
        optimizer: str = "sgd",
        learning_rate: float = 0.1,
        seed: int = SEED,
    ) -> None:
        self.layers = layers
        self.activation_name = activation
        self.optimizer = optimizer
        self.learning_rate = learning_rate
        self.rng = np.random.default_rng(seed)
        self.weights = []
        self.biases = []
        for fan_in, fan_out in zip(layers[:-1], layers[1:], strict=True):
            scale = np.sqrt(2.0 / max(fan_in, 1))
            self.weights.append(self.rng.normal(0, scale, size=(fan_in, fan_out)))
            self.biases.append(np.zeros((1, fan_out)))
        self.vel_w = [np.zeros_like(w) for w in self.weights]
        self.vel_b = [np.zeros_like(b) for b in self.biases]
        self.m_w = [np.zeros_like(w) for w in self.weights]
        self.m_b = [np.zeros_like(b) for b in self.biases]
        self.v_w = [np.zeros_like(w) for w in self.weights]
        self.v_b = [np.zeros_like(b) for b in self.biases]
        self.step_count = 0

    def forward(self, X: np.ndarray) -> tuple[np.ndarray, list[np.ndarray], list[LayerCache]]:
        hidden_act, _ = ACTIVATIONS[self.activation_name]
        activations = [X]
        caches: list[LayerCache] = []
        a = X
        for index, (w, b) in enumerate(zip(self.weights, self.biases, strict=True)):
            z = a @ w + b
            if index == len(self.weights) - 1:
                a = sigmoid(z)
            else:
                a = hidden_act(z)
            caches.append(LayerCache(z=z, a=a))
            activations.append(a)
        return a, activations, caches

    def backward(
        self,
        X: np.ndarray,
        y: np.ndarray,
        activations: list[np.ndarray],
        caches: list[LayerCache],
    ) -> tuple[list[np.ndarray], list[np.ndarray]]:
        _, hidden_grad = ACTIVATIONS[self.activation_name]
        batch_size = len(X)
        grads_w = [np.zeros_like(w) for w in self.weights]
        grads_b = [np.zeros_like(b) for b in self.biases]

        y_hat = activations[-1]
        delta = (y_hat - y) * sigmoid_grad(caches[-1].z)
        grads_w[-1] = activations[-2].T @ delta / batch_size
        grads_b[-1] = np.mean(delta, axis=0, keepdims=True)

        for index in range(len(self.weights) - 2, -1, -1):
            delta = (delta @ self.weights[index + 1].T) * hidden_grad(caches[index].z)
            grads_w[index] = activations[index].T @ delta / batch_size
            grads_b[index] = np.mean(delta, axis=0, keepdims=True)

        return grads_w, grads_b

    def _update(self, grads_w: list[np.ndarray], grads_b: list[np.ndarray]) -> None:
        self.step_count += 1
        if self.optimizer == "sgd":
            for index in range(len(self.weights)):
                self.weights[index] -= self.learning_rate * grads_w[index]
                self.biases[index] -= self.learning_rate * grads_b[index]
            return
        if self.optimizer == "momentum":
            beta = 0.9
            for index in range(len(self.weights)):
                self.vel_w[index] = beta * self.vel_w[index] - self.learning_rate * grads_w[index]
                self.vel_b[index] = beta * self.vel_b[index] - self.learning_rate * grads_b[index]
                self.weights[index] += self.vel_w[index]
                self.biases[index] += self.vel_b[index]
            return

        beta1 = 0.9
        beta2 = 0.999
        eps = 1e-8
        for index in range(len(self.weights)):
            self.m_w[index] = beta1 * self.m_w[index] + (1 - beta1) * grads_w[index]
            self.m_b[index] = beta1 * self.m_b[index] + (1 - beta1) * grads_b[index]
            self.v_w[index] = beta2 * self.v_w[index] + (1 - beta2) * (grads_w[index] ** 2)
            self.v_b[index] = beta2 * self.v_b[index] + (1 - beta2) * (grads_b[index] ** 2)
            m_w_hat = self.m_w[index] / (1 - beta1**self.step_count)
            m_b_hat = self.m_b[index] / (1 - beta1**self.step_count)
            v_w_hat = self.v_w[index] / (1 - beta2**self.step_count)
            v_b_hat = self.v_b[index] / (1 - beta2**self.step_count)
            self.weights[index] -= self.learning_rate * m_w_hat / (np.sqrt(v_w_hat) + eps)
            self.biases[index] -= self.learning_rate * m_b_hat / (np.sqrt(v_b_hat) + eps)

    def train(self, X: np.ndarray, y: np.ndarray, epochs: int = 1000) -> list[float]:
        losses: list[float] = []
        for _ in range(epochs):
            y_hat, activations, caches = self.forward(X)
            loss = float(np.mean((y_hat - y) ** 2))
            losses.append(loss)
            grads_w, grads_b = self.backward(X, y, activations, caches)
            self._update(grads_w, grads_b)
        return losses

    def predict(self, X: np.ndarray) -> np.ndarray:
        y_hat, _, _ = self.forward(X)
        return (y_hat >= 0.5).astype(int)


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)


def plot_activation_functions() -> None:
    x = np.linspace(-5, 5, 400)
    functions = [
        ("Sigmoid", sigmoid(x), sigmoid_grad(x)),
        ("Tanh", tanh_act(x), tanh_grad(x)),
        ("ReLU", relu(x), relu_grad(x)),
        ("Leaky ReLU", leaky_relu(x), leaky_relu_grad(x)),
    ]
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    for ax, (name, values, grads) in zip(axes.flat, functions, strict=True):
        ax.plot(x, values, label="f(x)", color="#2a5fff")
        ax.plot(x, grads, label="f'(x)", color="#ff9d57")
        ax.set_title(name)
        ax.grid(alpha=0.3)
        ax.legend()
    fig.suptitle("Activation Functions and Gradients")
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "03_activation_functions.png", dpi=180)
    plt.close(fig)


def make_xor_data() -> tuple[np.ndarray, np.ndarray]:
    X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
    y = np.array([[0], [1], [1], [0]], dtype=float)
    return X, y


def decision_grid(model: MLP, points: int = 200) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    xs = np.linspace(-0.2, 1.2, points)
    ys = np.linspace(-0.2, 1.2, points)
    xx, yy = np.meshgrid(xs, ys)
    grid = np.column_stack([xx.ravel(), yy.ravel()])
    zz = model.predict(grid).reshape(xx.shape)
    return xx, yy, zz


def plot_xor_problem() -> None:
    X, y = make_xor_data()
    shallow = MLP([2, 1], activation="tanh", optimizer="adam", learning_rate=0.1, seed=SEED)
    deep = MLP([2, 4, 1], activation="tanh", optimizer="adam", learning_rate=0.1, seed=SEED)
    shallow_losses = shallow.train(X, y, epochs=1500)
    deep_losses = deep.train(X, y, epochs=2500)

    fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))
    for ax, model, title in [
        (axes[0], shallow, "Single Layer"),
        (axes[1], deep, "Hidden Layer"),
    ]:
        xx, yy, zz = decision_grid(model)
        ax.contourf(xx, yy, zz, levels=[-0.1, 0.5, 1.1], alpha=0.35, cmap="coolwarm")
        preds = model.predict(X).ravel()
        for point, target, pred in zip(X, y.ravel(), preds, strict=True):
            marker = "o" if pred == target else "x"
            ax.scatter(point[0], point[1], c=["#2a5fff" if target == 1 else "#ff9d57"], s=110, marker=marker)
        ax.set_title(title)
        ax.set_xlim(-0.2, 1.2)
        ax.set_ylim(-0.2, 1.2)
        ax.grid(alpha=0.3)

    axes[2].plot(shallow_losses, label="Single Layer", color="#ff9d57")
    axes[2].plot(deep_losses, label="Hidden Layer", color="#2a5fff")
    axes[2].set_title("XOR Loss Curves")
    axes[2].set_xlabel("Epoch")
    axes[2].set_ylabel("MSE")
    axes[2].legend()
    axes[2].grid(alpha=0.3)
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "03_xor_problem.png", dpi=180)
    plt.close(fig)


def plot_learning_rate_comparison() -> None:
    X, y = make_xor_data()
    fig, ax = plt.subplots(figsize=(10, 5))
    for lr in [0.001, 0.01, 0.1, 1.0, 5.0]:
        model = MLP([2, 4, 1], activation="tanh", optimizer="sgd", learning_rate=lr, seed=SEED)
        losses = model.train(X, y, epochs=400)
        ax.plot(losses, label=f"lr={lr}")
    ax.set_title("Learning Rate Comparison on XOR")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("MSE")
    ax.set_ylim(0, 0.5)
    ax.grid(alpha=0.3)
    ax.legend()
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "03_learning_rate.png", dpi=180)
    plt.close(fig)


def make_spiral_data(points_per_class: int = 100, noise: float = 0.18) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(SEED)
    n = points_per_class
    theta = np.linspace(0, np.pi, n)
    radius = np.linspace(0.1, 1.0, n)
    class_a = np.column_stack([radius * np.cos(theta), radius * np.sin(theta)])
    class_b = np.column_stack([-radius * np.cos(theta), -radius * np.sin(theta)])
    class_a += rng.normal(0, noise, class_a.shape)
    class_b += rng.normal(0, noise, class_b.shape)
    X = np.vstack([class_a, class_b])
    y = np.vstack([np.ones((n, 1)), np.zeros((n, 1))])
    return X, y


def plot_optimizer_comparison() -> None:
    X, y = make_spiral_data()
    configs = [
        ("sgd", "#ff9d57"),
        ("momentum", "#58b8ff"),
        ("adam", "#5bd5a8"),
    ]
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    loss_ax = axes[0, 0]
    for optimizer, color in configs:
        model = MLP([2, 12, 8, 1], activation="tanh", optimizer=optimizer, learning_rate=0.05, seed=SEED)
        losses = model.train(X, y, epochs=800)
        loss_ax.plot(losses, label=optimizer.upper(), color=color)
        row, col = (0, 1) if optimizer == "sgd" else ((1, 0) if optimizer == "momentum" else (1, 1))
        ax = axes[row, col]
        xx, yy = np.meshgrid(np.linspace(-1.6, 1.6, 180), np.linspace(-1.6, 1.6, 180))
        grid = np.column_stack([xx.ravel(), yy.ravel()])
        zz = model.predict(grid).reshape(xx.shape)
        ax.contourf(xx, yy, zz, levels=[-0.1, 0.5, 1.1], alpha=0.35, cmap="coolwarm")
        ax.scatter(X[:, 0], X[:, 1], c=y.ravel(), cmap="coolwarm", s=12, alpha=0.85)
        ax.set_title(f"{optimizer.upper()} Boundary")
        ax.set_xlim(-1.6, 1.6)
        ax.set_ylim(-1.6, 1.6)
        ax.grid(alpha=0.2)
    loss_ax.set_title("Optimizer Loss Curves")
    loss_ax.set_xlabel("Epoch")
    loss_ax.set_ylabel("MSE")
    loss_ax.grid(alpha=0.3)
    loss_ax.legend()
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "03_optimizer_comparison.png", dpi=180)
    plt.close(fig)


def main() -> None:
    np.random.seed(SEED)
    ensure_output_dir()
    print("Generating activation function figure...")
    plot_activation_functions()
    print("Generating XOR comparison figure...")
    plot_xor_problem()
    print("Generating learning-rate comparison figure...")
    plot_learning_rate_comparison()
    print("Generating optimizer comparison figure...")
    plot_optimizer_comparison()
    print("Saved outputs:")
    for path in sorted(OUTPUT_DIR.glob("03_*.png")):
        print(f"- {path.name}")


if __name__ == "__main__":
    main()
