# Perceptron Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a uv-managed educational project with a PySide6 perceptron desktop app, a NumPy/Matplotlib learning-demo script, tests, and runnable documentation.

**Architecture:** Keep all math and translation logic in `perceptron_app/core/` so it is testable without Qt. Keep each GUI concern in a focused file under `perceptron_app/ui/` or `perceptron_app/widgets/`, and expose only simple state-sync methods/signals across tabs. Keep the standalone demo script at the repo root so it can generate `outputs/` images without depending on the GUI package.

**Tech Stack:** Python 3.13, uv, PySide6, NumPy, Matplotlib, pytest

---

### Task 1: Project skeleton and uv configuration

**Files:**
- Create: `pyproject.toml`
- Create: `README.md`
- Create: `perceptron_app/__init__.py`
- Create: `perceptron_app/main.py`
- Create: `perceptron_app/core/__init__.py`
- Create: `perceptron_app/ui/__init__.py`
- Create: `perceptron_app/widgets/__init__.py`
- Create: `perceptron_app/tests/__init__.py`
- Create: `perceptron_app/assets/style.qss`

- [ ] Define a uv-managed package with runtime deps `numpy`, `matplotlib`, `PySide6` and dev dep `pytest`.
- [ ] Create the package folders so `uv run python -m perceptron_app.main` works.
- [ ] Add a baseline README with setup, run, and test commands using uv.
- [ ] Add a base QSS file so the GUI can load a consistent dark theme.
- [ ] Verify package import with `uv run python -c "import perceptron_app; print('ok')"` expecting `ok`.

### Task 2: Core perceptron and i18n logic with tests

**Files:**
- Create: `perceptron_app/core/perceptron.py`
- Create: `perceptron_app/core/i18n.py`
- Create: `perceptron_app/tests/test_perceptron.py`
- Create: `perceptron_app/tests/test_i18n.py`

- [ ] Write tests for forward pass, activation behavior, epoch training, reset behavior, and translation lookup.
- [ ] Implement `Perceptron` as a dataclass with `forward`, `train_step`, `train_epoch`, and `reset`.
- [ ] Implement `I18N` with matched `ko`/`en` key sets and fallback-to-key behavior.
- [ ] Verify with `uv run pytest perceptron_app/tests/test_perceptron.py perceptron_app/tests/test_i18n.py`.

### Task 3: Structure visualization tab and main window

**Files:**
- Create: `perceptron_app/widgets/perceptron_canvas.py`
- Create: `perceptron_app/ui/tab_structure.py`
- Create: `perceptron_app/ui/main_window.py`
- Modify: `perceptron_app/main.py`

- [ ] Build `PerceptronCanvas` to draw inputs, weights, bias, weighted sum, activation, and output.
- [ ] Build `StructureTab` with sliders/combos for weights, bias, inputs, activation, plus reset/apply state helpers.
- [ ] Build `MainWindow` with header, language toggle, `QTabWidget`, and tab-to-tab signal wiring.
- [ ] Verify a headless smoke launch with `uv run python -c "from perceptron_app.ui.main_window import MainWindow; print(MainWindow)"`.

### Task 4: Simulation and derivation tabs

**Files:**
- Create: `perceptron_app/widgets/decision_boundary.py`
- Create: `perceptron_app/ui/tab_simulation.py`
- Create: `perceptron_app/ui/tab_derivation.py`
- Modify: `perceptron_app/ui/main_window.py`

- [ ] Implement a decision-boundary widget over `[-0.5, 1.5]` with colored truth-table points.
- [ ] Implement simulation tab for AND/OR/XOR with auto-weight presets and XOR warning copy.
- [ ] Implement derivation tab that explains the current forward pass in four cards with step reveal controls.
- [ ] Verify import and state-sync smoke coverage with `uv run pytest perceptron_app/tests/test_perceptron.py perceptron_app/tests/test_i18n.py`.

### Task 5: Training tab and loss chart

**Files:**
- Create: `perceptron_app/widgets/loss_chart.py`
- Create: `perceptron_app/ui/tab_training.py`
- Modify: `perceptron_app/ui/main_window.py`

- [ ] Implement a lightweight loss chart showing epoch vs misclassification count.
- [ ] Implement `TrainingWorker` on `QThread`-compatible signals so repeated training does not block the UI thread.
- [ ] Implement a training tab with editable data table, learning-rate/epoch controls, log output, start/stop, and completion sync back into the structure tab.
- [ ] Verify the module imports with `uv run python -c "from perceptron_app.ui.tab_training import TrainingTab; print(TrainingTab)"`.

### Task 6: Standalone learning demo script

**Files:**
- Create: `03_nn_learning_process.py`
- Create: `outputs/.gitkeep`

- [ ] Implement activation functions and gradients.
- [ ] Implement a small NumPy MLP supporting `sigmoid`, `tanh`, `relu` and `sgd`, `momentum`, `adam`.
- [ ] Generate four output figures: activation functions, XOR comparison, learning-rate comparison, optimizer comparison.
- [ ] Verify with `uv run python 03_nn_learning_process.py` and confirm the four PNG files exist under `outputs/`.

### Task 7: Final documentation and end-to-end verification

**Files:**
- Modify: `README.md`
- Modify: `PLAN.md`

- [ ] Update the README so a new user can set up, run the GUI, generate demo images, and run tests entirely through uv.
- [ ] Keep `PLAN.md` as the source project spec and ensure the implementation matches its required artifacts.
- [ ] Run `uv run pytest`.
- [ ] Run `uv run python 03_nn_learning_process.py`.
- [ ] Run `uv run python -c "from perceptron_app.main import main; print('entrypoint ok')"` expecting `entrypoint ok`.

### Self-Review

- Spec coverage: covers the two required deliverables from `PLAN.md` (`perceptron_app/` and `03_nn_learning_process.py`) plus tests, docs, and uv-based execution.
- Placeholder scan: no `TODO`, `TBD`, or vague "add tests later" items remain.
- Type consistency: all planned file and class names match the names required by `PLAN.md`.
