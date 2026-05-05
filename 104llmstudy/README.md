# Perceptron Trainer

`PLAN.md`를 구현한 교육용 프로젝트다. 두 가지 실행 대상이 있다.

- `perceptron_app`: PySide6 기반 퍼셉트론 학습 GUI
- `03_nn_learning_process.py`: NumPy/Matplotlib 기반 학습 시각화 스크립트

## Environment

```bash
uv sync --dev
```

`uv`가 표준 실행 환경이다. 별도 `venv` 활성화 없이 `uv run ...` 형태로 실행하면 된다.

## Run The GUI

```bash
uv run python -m perceptron_app.main
```

PySide6를 Windows 오프스크린 환경에서 점검하면 폰트 디렉터리 경고가 보일 수 있는데, 현재 구현 결함은 아니고 런타임 배포 경고다.

## Generate Demo Images

```bash
uv run python 03_nn_learning_process.py
```

생성 결과:

- `outputs/03_activation_functions.png`
- `outputs/03_xor_problem.png`
- `outputs/03_learning_rate.png`
- `outputs/03_optimizer_comparison.png`

## Run Tests

```bash
uv run pytest
```

## Project Layout

```text
.
├── 03_nn_learning_process.py
├── outputs/
├── perceptron_app/
│   ├── assets/
│   ├── core/
│   ├── tests/
│   ├── ui/
│   └── widgets/
├── PLAN.md
└── pyproject.toml
```
