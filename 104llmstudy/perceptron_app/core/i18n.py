from __future__ import annotations

STRINGS = {
    "ko": {
        "app_title": "퍼셉트론 트레이너",
        "language": "언어",
        "toggle_language": "EN",
        "tab_structure": "구조 시각화",
        "tab_simulation": "시뮬레이션",
        "tab_derivation": "수식 설명",
        "tab_training": "훈련",
        "weights": "가중치",
        "bias": "편향",
        "inputs": "입력값",
        "activation": "활성화 함수",
        "output": "출력",
        "prediction": "예측",
        "reset": "초기화",
        "gate": "게이트",
        "auto_weights": "예시 가중치 적용",
        "truth_table": "진리표",
        "xor_warning": "XOR는 단층 퍼셉트론으로 완전히 분리되지 않습니다.",
        "step_1": "1단계: 가중합 계산",
        "step_2": "2단계: 현재 값 대입",
        "step_3": "3단계: 활성화 함수 적용",
        "step_4": "4단계: 최종 출력",
        "next_step": "다음 단계",
        "show_all": "전체 펼치기",
        "training_data": "학습 데이터",
        "learning_rate": "학습률",
        "epochs": "에폭 수",
        "start_training": "훈련 시작",
        "stop_training": "중지",
        "training_log": "훈련 로그",
        "epoch_label": "에폭",
        "errors_label": "오분류 수",
        "status_ready": "준비됨",
        "status_training": "훈련 중",
        "status_completed": "훈련 완료",
        "status_stopped": "훈련 중지",
    },
    "en": {
        "app_title": "Perceptron Trainer",
        "language": "Language",
        "toggle_language": "KO",
        "tab_structure": "Structure",
        "tab_simulation": "Simulation",
        "tab_derivation": "Derivation",
        "tab_training": "Training",
        "weights": "Weights",
        "bias": "Bias",
        "inputs": "Inputs",
        "activation": "Activation",
        "output": "Output",
        "prediction": "Prediction",
        "reset": "Reset",
        "gate": "Gate",
        "auto_weights": "Apply Preset Weights",
        "truth_table": "Truth Table",
        "xor_warning": "XOR cannot be perfectly separated by a single-layer perceptron.",
        "step_1": "Step 1: Weighted sum",
        "step_2": "Step 2: Plug in current values",
        "step_3": "Step 3: Apply activation",
        "step_4": "Step 4: Final output",
        "next_step": "Next Step",
        "show_all": "Show All",
        "training_data": "Training Data",
        "learning_rate": "Learning Rate",
        "epochs": "Epochs",
        "start_training": "Start Training",
        "stop_training": "Stop",
        "training_log": "Training Log",
        "epoch_label": "Epoch",
        "errors_label": "Misclassifications",
        "status_ready": "Ready",
        "status_training": "Training",
        "status_completed": "Training complete",
        "status_stopped": "Training stopped",
    },
}


class I18N:
    def __init__(self, lang: str = "ko") -> None:
        self.lang = "ko"
        self.set_lang(lang)

    def set_lang(self, lang: str) -> None:
        self.lang = lang if lang in STRINGS else "ko"

    def t(self, key: str) -> str:
        return STRINGS[self.lang].get(key, key)

