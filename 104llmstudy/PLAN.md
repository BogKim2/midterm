# PLAN.md

# 202512109 프로젝트 구현 계획

## 1. 프로젝트 목표

이 프로젝트의 목표는 **신경망 학습 원리를 시각적으로 설명하는 교육용 프로그램 모음**을 작성하는 것이다.

구성은 두 갈래로 나눈다.

1. `03_nn_learning_process.py`  
   순수 NumPy와 Matplotlib만 사용해 활성화 함수, XOR 문제, 학습률, 옵티마이저 비교를 시각화하고 결과 이미지를 `outputs/`에 저장하는 데모 스크립트.

2. `perceptron_app/`  
   PySide6로 만든 데스크톱 GUI 앱. 사용자가 가중치, 편향, 입력값을 바꿔가며 퍼셉트론 구조, 논리 게이트 시뮬레이션, 수식 전개, 학습 과정을 확인할 수 있는 앱.

---

## 2. 현재 레포 구조 파악

```text
202512109/
├── 03_nn_learning_process.py
├── outputs/
└── perceptron_app/
    ├── main.py
    ├── requirements.txt
    ├── assets/
    ├── core/
    ├── tests/
    ├── ui/
    └── widgets/
```

`perceptron_app` 내부에는 `assets`, `core`, `tests`, `ui`, `widgets`, `main.py`, `requirements.txt`가 있으며, `__pycache__`는 실행 중 생기는 캐시 폴더이므로 직접 작성 대상에서 제외한다.

`outputs/`에는 `03_activation_functions.png`, `03_xor_problem.png`, `03_learning_rate.png`, `03_optimizer_comparison.png` 등 학습 과정 데모 스크립트가 생성하거나 참조하는 결과 이미지들이 들어 있다.

---

## 3. 전체 개발 순서

## Phase 0. 개발 환경 구성

먼저 `perceptron_app/requirements.txt` 기준으로 환경을 만든다.

```bash
cd 202512109/perceptron_app

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

실행 방식은 현재 `main.py`가 `QApplication`을 만들고 `MainWindow`를 띄우는 구조이므로, 기본 실행 명령은 다음으로 잡는다.

```bash
python main.py
```

---

# 4. 프로그램 1: `03_nn_learning_process.py` 작성 계획

## 4.1 목적

`03_nn_learning_process.py`는 GUI 앱과 별개로 동작하는 **신경망 학습 원리 데모 스크립트**다. 스크립트는 `outputs` 폴더를 만들고, 활성화 함수, XOR 문제, 학습률 비교, 옵티마이저 비교 이미지를 저장하는 흐름으로 작성한다.

## 4.2 구현할 주요 기능

### A. 기본 설정

```python
import numpy as np
import matplotlib.pyplot as plt
import os
```

역할:

- `outputs/` 폴더 자동 생성
- 난수 시드 고정
- 콘솔에 진행 로그 출력

---

### B. 활성화 함수 구현

작성 대상:

```python
sigmoid()
sigmoid_grad()
tanh_act()
tanh_grad()
relu()
relu_grad()
leaky_relu()
leaky_relu_grad()
```

목표:

- 각 활성화 함수의 출력값과 도함수를 계산
- 한 이미지에 함수별 그래프 저장
- 저장 파일: `outputs/03_activation_functions.png`

---

### C. 순수 NumPy MLP 클래스 구현

작성 대상:

```python
class MLP:
    __init__()
    forward()
    backward()
    _update()
    train()
    predict()
```

지원 항목:

- 활성화 함수: `sigmoid`, `tanh`, `relu`
- 옵티마이저: `sgd`, `momentum`, `adam`
- 손실 함수: MSE
- 역전파: 직접 구현

---

### D. XOR 문제 비교

목표:

- 단층 모델 `MLP([2, 1])`
- 다층 모델 `MLP([2, 4, 1])`
- 두 모델의 XOR 학습 성능 비교
- 결정 경계 시각화
- 저장 파일: `outputs/03_xor_problem.png`

핵심 설명:

- 단층 퍼셉트론은 XOR를 선형 분리할 수 없음
- 은닉층이 있는 MLP는 비선형 결정 경계를 만들 수 있음

---

### E. 학습률 비교

비교 대상:

```text
0.001
0.01
0.1
1.0
5.0
```

목표:

- 학습률이 너무 작을 때, 적절할 때, 너무 클 때의 loss curve 비교
- 저장 파일: `outputs/03_learning_rate.png`

---

### F. 옵티마이저 비교

비교 대상:

```text
SGD
Momentum
Adam
```

데이터셋:

- 2D spiral 이진 분류 데이터

목표:

- 옵티마이저별 loss curve 비교
- 옵티마이저별 decision boundary 비교
- 저장 파일: `outputs/03_optimizer_comparison.png`

---

# 5. 프로그램 2: `perceptron_app/` 작성 계획

## 5.1 앱 목적

`perceptron_app`은 **퍼셉트론 학습기** 데스크톱 앱이다. `main.py`는 PySide6 `QApplication`을 생성하고, 앱 이름을 “Perceptron Trainer”로 설정한 뒤 `MainWindow`를 실행한다.

앱은 네 개의 탭으로 구성한다.

```text
1. 구조 시각화
2. 시뮬레이션
3. 수식 설명
4. 훈련
```

`MainWindow`는 실제로 `StructureTab`, `SimulationTab`, `DerivationTab`, `TrainingTab`을 `QTabWidget`에 붙이고, 언어 전환 버튼과 탭 간 상태 동기화도 담당한다.

---

## 5.2 `core/` 작성 계획

현재 `core/`에는 `__init__.py`, `i18n.py`, `perceptron.py`가 있다.

### `core/perceptron.py`

역할:

- 퍼셉트론의 핵심 계산 로직
- GUI와 테스트가 공통으로 사용하는 도메인 모듈

작성 대상:

```python
@dataclass
class Perceptron:
    weights: np.ndarray
    bias: float
    learning_rate: float
    activation: Literal["step", "sigmoid"]

    def _activate(self, z: float) -> float
    def forward(self, x: np.ndarray) -> dict
    def train_step(self, x: np.ndarray, y: float) -> bool
    def train_epoch(self, X: np.ndarray, Y: np.ndarray) -> int
    def reset(self, weights=None, bias: float = 0.0) -> None
```

구현 방향:

- 단층 퍼셉트론을 dataclass로 구현한다.
- step/sigmoid 활성화 함수를 지원한다.
- forward pass 결과로 `z`, `output`, `prediction` 등을 반환한다.
- 단일 샘플 업데이트와 epoch 단위 학습을 제공한다.
- reset 기능으로 가중치와 편향을 초기화한다.

### `core/i18n.py`

역할:

- 한국어/영어 UI 문자열 관리
- 언어 전환 기능 지원

작성 대상:

```python
STRINGS = {
    "ko": {...},
    "en": {...}
}

class I18N:
    def __init__(self, lang="ko")
    def set_lang(self, lang: str)
    def t(self, key: str) -> str
```

포함해야 할 문자열:

- 앱 제목
- 탭 이름
- 가중치/편향/입력/출력
- 학습 버튼
- XOR 경고
- 수식 설명 단계
- 오류/상태 메시지

---

## 5.3 `widgets/` 작성 계획

현재 `widgets/`에는 `decision_boundary.py`, `loss_chart.py`, `perceptron_canvas.py`가 있다.

### `widgets/perceptron_canvas.py`

역할:

- 퍼셉트론 구조를 QPainter로 직접 그림
- 입력 노드, 가중치 선, bias, 합산 노드, 활성화 노드, 출력 노드를 시각화

작성 대상:

```python
class PerceptronCanvas(QWidget):
    def set_state(self, weights, bias, inputs, z, output)
    def paintEvent(self, event)
    def _draw_edges(self, painter)
    def _draw_nodes(self, painter)
    def _draw_bottom_label(self, painter)
```

화면에 표시할 요소:

- 입력 노드 `x1`, `x2`
- 가중치 `w1`, `w2`
- 편향 `b`
- 가중합 `z = w1*x1 + w2*x2 + b`
- 활성화 함수
- 최종 출력 `y`

---

### `widgets/decision_boundary.py`

역할:

- 2D 입력 공간에서 결정 경계와 데이터 포인트를 그림
- AND/OR/XOR 결과를 시각적으로 확인

작성 대상:

```python
class DecisionBoundaryWidget(QWidget):
    def set_state(self, weights, bias, data_points, predictions)
    def paintEvent(self, event)
    def _draw_grid(self, painter)
    def _draw_axes(self, painter)
    def _draw_boundary(self, painter)
    def _draw_points(self, painter)
```

구현 방향:

- 입력 공간 범위는 `[-0.5, 1.5]`로 설정한다.
- `w1*x1 + w2*x2 + b = 0`을 기준으로 결정 경계를 그린다.
- 실제 라벨과 예측값을 색상으로 구분한다.
- XOR는 선형 경계로 완벽히 분리되지 않음을 시각적으로 보여준다.

---

### `widgets/loss_chart.py`

역할:

- epoch별 오분류 수를 선 그래프로 그림
- 훈련 탭에서 학습 진행 상황 표시

작성 대상:

```python
class LossChartWidget(QWidget):
    def set_history(self, history: list[int])
    def clear(self)
    def paintEvent(self, event)
    def _draw_grid(self, painter)
    def _draw_axes(self, painter)
    def _draw_line(self, painter)
    def _draw_axis_labels(self, painter)
```

표시 항목:

- x축: epoch
- y축: misclassification count
- 학습이 진행되면서 오분류 수가 감소하는지 확인

---

## 5.4 `ui/` 작성 계획

현재 `ui/`에는 `main_window.py`, `tab_structure.py`, `tab_simulation.py`, `tab_derivation.py`, `tab_training.py`가 있다.

### `ui/main_window.py`

역할:

- 전체 앱의 메인 윈도우
- 4개 탭 생성
- 언어 전환
- 탭 간 상태 동기화

작성 순서:

1. `QMainWindow` 상속
2. `I18N` 인스턴스 생성
3. QSS 스타일 로드
4. 상단 타이틀 + 언어 전환 버튼 생성
5. `QTabWidget` 생성
6. 4개 탭 추가
7. 탭 간 signal/slot 연결

탭 간 동기화:

- 구조 탭의 weight 변경을 시뮬레이션/수식 탭에 전달한다.
- 훈련 완료 결과를 구조 탭과 다른 탭에 반영한다.
- 언어 전환 버튼 클릭 시 모든 탭의 `retranslate()`를 호출한다.

---

### `ui/tab_structure.py`

역할:

- 퍼셉트론 구조 시각화
- 사용자가 weight, bias, input, activation function을 직접 조절
- 변경값을 다른 탭으로 signal 전파

주요 구성:

```text
왼쪽: PerceptronCanvas
오른쪽: weight slider, bias slider, input combo, activation combo, output label
```

작성 대상:

```python
class StructureTab(QWidget):
    weights_changed = Signal(list, float)

    def _build_ui()
    def _make_weight_row()
    def _make_input_row()
    def _get_weights()
    def _get_inputs()
    def _refresh()
    def _on_activation_changed()
    def _reset_weights()
    def apply_weights()
    def get_state()
    def retranslate()
```

완료 기준:

- weight, bias slider 변경 시 canvas가 즉시 갱신된다.
- input combo 변경 시 output이 즉시 갱신된다.
- 현재 weight/bias가 다른 탭으로 전달된다.
- reset 버튼으로 기본값 복원이 가능하다.

---

### `ui/tab_simulation.py`

역할:

- AND/OR/XOR 논리 게이트 시뮬레이션
- 진리표와 결정 경계 동시 표시
- XOR는 단층 퍼셉트론으로 풀 수 없다는 경고 표시

주요 데이터:

```python
GATES = {
    "AND": [...],
    "OR": [...],
    "XOR": [...]
}

OPTIMAL_WEIGHTS = {
    "AND": ([1.0, 1.0], -1.5),
    "OR": ([1.0, 1.0], -0.5),
    "XOR": ([1.0, 1.0], -0.5)
}
```

작성 대상:

```python
class SimulationTab(QWidget):
    def _build_ui()
    def _current_gate()
    def _update_table()
    def _update_boundary()
    def _refresh()
    def on_weights_changed()
    def _on_gate_changed()
    def _auto_weights()
    def retranslate()
```

완료 기준:

- AND/OR/XOR를 선택할 수 있다.
- 진리표에 입력값, 정답, 예측값이 표시된다.
- 예측이 맞으면 성공 색상, 틀리면 경고 색상으로 표시된다.
- 결정 경계가 현재 weight/bias를 기준으로 갱신된다.
- XOR 선택 시 단층 퍼셉트론 한계를 설명한다.

---

### `ui/tab_derivation.py`

역할:

- 현재 입력과 가중치 기준으로 forward pass를 단계별 수식으로 설명
- “다음 단계”, “전체 펼치기” 버튼 제공
- step/sigmoid 활성화 함수 전환 가능

표시 단계:

```text
Step 1 — 가중합 계산
Step 2 — 현재 값 대입
Step 3 — 활성화 함수 적용
Step 4 — 최종 출력
```

작성 대상:

```python
class StepCard(QFrame)
class DerivationTab(QWidget):
    def _build_ui()
    def _build_steps()
    def _render_cards()
    def _update_state()
    def on_weights_changed()
    def on_inputs_changed()
    def _next_step()
    def _show_all()
    def _reset_steps()
    def _on_activation_changed()
    def retranslate()
```

완료 기준:

- `z = w1*x1 + w2*x2 + b` 수식이 표시된다.
- 현재 값 대입 결과가 표시된다.
- 활성화 함수 적용 결과가 표시된다.
- 단계별 카드 UI로 학습 과정을 설명한다.

---

### `ui/tab_training.py`

역할:

- 사용자가 학습 데이터를 입력
- 학습률, epoch 수를 조절
- QThread로 훈련을 실행해 UI 멈춤 방지
- loss chart와 training log 표시
- 학습 완료 시 최종 weight/bias를 다른 탭에 반영

작성 대상:

```python
class TrainingWorker(QObject)
class TrainingTab(QWidget):
    training_completed = Signal(list, float)

    def _build_ui()
    def _build_data_table()
    def _collect_training_data()
    def _start_training()
    def _stop_training()
    def _on_epoch_finished()
    def _on_training_finished()
    def _append_log()
    def retranslate()
```

완료 기준:

- 학습 데이터 테이블에서 입력값과 라벨을 수정할 수 있다.
- 학습률과 epoch 수를 설정할 수 있다.
- 훈련 시작/중지 버튼이 동작한다.
- 학습 중 UI가 멈추지 않는다.
- epoch별 오분류 수가 차트에 표시된다.
- 학습 완료 후 최종 weight/bias가 다른 탭에 반영된다.

---

## 5.5 `assets/` 작성 계획

현재 `assets/`에는 `style.qss`가 있다.

작성 목표:

- 전체 앱을 다크 테마로 통일
- 교육용 데모 앱처럼 시각적으로 완성도 있게 구성
- 색상 규칙 유지:
  - 파란색: 주요 액션/결정 경계
  - 초록색: positive/output/class 1
  - 주황색: warning/class 0/error
  - 보라색: bias

스타일 적용 대상:

- `QMainWindow`
- `QTabWidget`
- `QPushButton`
- `QSlider`
- `QComboBox`
- `QTableWidget`
- `QGroupBox`
- `QFrame`
- `QLabel`
- `QScrollBar`

---

## 5.6 `tests/` 작성 계획

현재 `tests/`에는 `test_i18n.py`, `test_perceptron.py`가 있다.

### `tests/test_perceptron.py`

검증 대상:

- step activation positive/negative
- sigmoid output range
- z 계산
- AND 수렴
- OR 수렴
- weight update 방향
- reset 기능

테스트 예시:

```python
def test_and_gate_convergence():
    ...
```

완료 기준:

- 기본 forward pass가 정확하다.
- AND/OR 게이트가 지정 epoch 안에 수렴한다.
- reset 후 weight/bias가 정상 초기화된다.

### `tests/test_i18n.py`

검증 대상:

- 한국어 필수 키 존재
- 영어 필수 키 존재
- 언어 전환 시 문자열 변경
- 없는 key는 key 자체 반환
- 한국어/영어 key set 일치

완료 기준:

- `STRINGS["ko"]`와 `STRINGS["en"]`의 key set이 일치한다.
- `i18n.t("missing_key")`는 `"missing_key"`를 반환한다.
- 언어 전환 후 UI 문자열이 바뀐다.

---

# 6. 구현 우선순위

## 1순위: 실행 가능한 최소 앱

```text
core/perceptron.py
core/i18n.py
widgets/perceptron_canvas.py
ui/tab_structure.py
ui/main_window.py
main.py
```

완료 기준:

- `python main.py` 실행
- 창이 뜸
- 구조 시각화 탭에서 weight/bias/input 조절 가능
- output 값 실시간 변경

---

## 2순위: 시뮬레이션 탭

```text
widgets/decision_boundary.py
ui/tab_simulation.py
```

완료 기준:

- AND/OR/XOR 선택 가능
- 진리표 표시
- 예측값 맞으면 초록색, 틀리면 주황색 표시
- 결정 경계가 화면에 표시
- XOR 경고 표시

---

## 3순위: 수식 설명 탭

```text
ui/tab_derivation.py
```

완료 기준:

- 현재 weight/bias/input 기준 수식 표시
- 다음 단계 버튼 동작
- 전체 펼치기 동작
- step/sigmoid 전환 반영

---

## 4순위: 훈련 탭

```text
widgets/loss_chart.py
ui/tab_training.py
```

완료 기준:

- 학습 데이터 입력
- 학습률/epoch 입력
- 훈련 시작/중지
- epoch별 오분류 수 차트 표시
- 최종 weight/bias가 구조 탭에 반영

---

## 5순위: 독립 데모 스크립트

```text
03_nn_learning_process.py
outputs/
```

완료 기준:

- 스크립트 실행 시 `outputs/` 자동 생성
- 활성화 함수 이미지 생성
- XOR 비교 이미지 생성
- 학습률 비교 이미지 생성
- 옵티마이저 비교 이미지 생성
- 콘솔에 요약 설명 출력

---

## 6순위: 테스트와 제출 정리

```text
tests/test_perceptron.py
tests/test_i18n.py
README.md
PLAN.md
```

완료 기준:

```bash
pytest
```

통과.

---

# 7. 권장 개발 일정

| 단계 | 작업 | 예상 소요 |
|---|---|---:|
| Day 1 | 환경 구성, 폴더 정리, requirements 확인 | 0.5일 |
| Day 1~2 | `core/perceptron.py`, `core/i18n.py` 작성 | 1일 |
| Day 2 | `main.py`, `main_window.py`, QSS 적용 | 1일 |
| Day 3 | 구조 시각화 탭 + PerceptronCanvas | 1일 |
| Day 4 | 논리 게이트 시뮬레이션 + 결정 경계 | 1일 |
| Day 5 | 수식 설명 탭 | 0.5~1일 |
| Day 6 | 훈련 탭 + loss chart + QThread | 1~1.5일 |
| Day 7 | `03_nn_learning_process.py` 완성 및 outputs 생성 | 1일 |
| Day 8 | 테스트, README, 시연 체크 | 1일 |

---

# 8. 주의할 점

1. `__pycache__`는 직접 작성하거나 커밋할 필요가 없다.
2. 현재 import가 `from ui.main_window import MainWindow` 같은 방식이라면, 가장 안전한 실행 방식은 `perceptron_app` 폴더 안에서 `python main.py`를 실행하는 것이다.
3. `StructureTab`의 weight 변경은 다른 탭과 동기화되어야 하므로 signal 연결을 먼저 안정화해야 한다.
4. XOR는 단층 퍼셉트론으로 해결되지 않는 것이 정상 동작이므로, 오류처럼 보이지 않게 경고 문구와 설명을 명확히 넣어야 한다.
5. 훈련 탭은 반복 학습 때문에 UI가 멈출 수 있으므로 QThread 구조를 유지해야 한다.
6. GUI 위젯은 먼저 정적 화면을 만든 뒤, Signal/Slot 연결을 추가하는 순서가 좋다.
7. 테스트 가능한 로직은 UI에서 분리해 `core/`에 둔다.
8. 이미지 저장 스크립트는 실행할 때마다 동일한 파일명을 생성하도록 한다.

---

# 9. 최종 산출물

최종적으로 아래 상태가 되면 완성으로 본다.

```text
202512109/
├── PLAN.md
├── README.md
├── 03_nn_learning_process.py
├── outputs/
│   ├── 03_activation_functions.png
│   ├── 03_xor_problem.png
│   ├── 03_learning_rate.png
│   └── 03_optimizer_comparison.png
└── perceptron_app/
    ├── main.py
    ├── requirements.txt
    ├── assets/
    │   └── style.qss
    ├── core/
    │   ├── __init__.py
    │   ├── i18n.py
    │   └── perceptron.py
    ├── ui/
    │   ├── main_window.py
    │   ├── tab_structure.py
    │   ├── tab_simulation.py
    │   ├── tab_derivation.py
    │   └── tab_training.py
    ├── widgets/
    │   ├── perceptron_canvas.py
    │   ├── decision_boundary.py
    │   └── loss_chart.py
    └── tests/
        ├── test_perceptron.py
        └── test_i18n.py
```

---

# 10. 데모 시나리오

## 10.1 GUI 앱 데모

1. `perceptron_app` 폴더에서 앱 실행

```bash
python main.py
```

2. 구조 시각화 탭에서 가중치와 편향 변경
3. 입력값을 바꾸며 출력값이 변하는지 확인
4. 시뮬레이션 탭에서 AND/OR/XOR 선택
5. XOR가 선형 분리되지 않는다는 설명 확인
6. 수식 설명 탭에서 forward pass 단계별 확인
7. 훈련 탭에서 AND 또는 OR 데이터로 학습 실행
8. loss chart가 감소하는지 확인
9. 최종 weight/bias가 구조 탭에 반영되는지 확인

## 10.2 독립 스크립트 데모

1. 루트 폴더에서 스크립트 실행

```bash
python 03_nn_learning_process.py
```

2. `outputs/` 폴더에 이미지 생성 확인

```text
03_activation_functions.png
03_xor_problem.png
03_learning_rate.png
03_optimizer_comparison.png
```

3. 각 이미지를 열어 활성화 함수, XOR 한계, 학습률 차이, 옵티마이저 차이를 설명한다.

---

# 11. 평가 포인트

이 프로젝트는 다음 항목을 중심으로 평가받을 수 있다.

| 평가 항목 | 설명 |
|---|---|
| 실행 가능성 | `python main.py`, `python 03_nn_learning_process.py`가 정상 실행되는가 |
| 구조화 | `core`, `ui`, `widgets`, `tests`가 역할별로 분리되어 있는가 |
| 시각화 | 퍼셉트론 구조, 결정 경계, loss chart가 명확한가 |
| 교육성 | XOR 한계, 가중합, 활성화 함수, 학습 과정을 이해하기 쉽게 보여주는가 |
| 안정성 | UI가 멈추지 않고 오류가 적절히 처리되는가 |
| 테스트 | 핵심 로직에 대한 pytest가 존재하고 통과하는가 |
| 문서화 | README와 PLAN이 프로젝트 목적과 실행 방법을 충분히 설명하는가 |

---

# 12. README에 포함하면 좋은 실행 안내

```markdown
## 실행 방법

### 1. 환경 설치

```bash
cd perceptron_app
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. GUI 앱 실행

```bash
python main.py
```

### 3. 학습 과정 이미지 생성

```bash
cd ..
python 03_nn_learning_process.py
```

### 4. 테스트

```bash
cd perceptron_app
pytest
```
```

---

# 13. 구현 체크리스트

## Core

- [ ] `Perceptron.forward()` 구현
- [ ] `Perceptron.train_step()` 구현
- [ ] `Perceptron.train_epoch()` 구현
- [ ] `Perceptron.reset()` 구현
- [ ] `I18N.t()` 구현
- [ ] 한국어/영어 문자열 key 일치 확인

## Widgets

- [ ] `PerceptronCanvas` 구조 그림 구현
- [ ] `DecisionBoundaryWidget` 좌표계 구현
- [ ] `DecisionBoundaryWidget` 결정 경계 구현
- [ ] `LossChartWidget` epoch별 chart 구현

## UI

- [ ] `MainWindow` 생성
- [ ] QSS 로드
- [ ] 언어 전환 버튼
- [ ] `StructureTab` 컨트롤 연결
- [ ] `SimulationTab` 진리표 구현
- [ ] `DerivationTab` 단계별 카드 구현
- [ ] `TrainingTab` QThread 학습 구현

## Script

- [ ] 활성화 함수 그래프 생성
- [ ] XOR 문제 비교 그래프 생성
- [ ] 학습률 비교 그래프 생성
- [ ] 옵티마이저 비교 그래프 생성

## Test

- [ ] `test_perceptron.py` 통과
- [ ] `test_i18n.py` 통과
- [ ] GUI 수동 테스트 완료

---

# 14. 결론

이 계획대로 진행하면 프로젝트는 단순한 코드 모음이 아니라, **신경망 학습 과정 시각화 스크립트 + 퍼셉트론 교육용 GUI 앱**이라는 명확한 형태를 갖추게 된다.

핵심은 다음 세 가지다.

1. `core/`에 수학적 계산 로직을 깔끔하게 분리한다.
2. `widgets/`에서 교육용 시각화를 직접 구현한다.
3. `ui/`에서 사용자가 실험하고 이해할 수 있는 흐름을 만든다.

최종적으로는 `PLAN.md`, `README.md`, 실행 가능한 코드, 테스트, 결과 이미지가 함께 제출 가능한 형태가 된다.
