# Technical Requirements Document (TRD)

# 스마트 문서 분석 데스크톱 앱

**프로젝트명:** AI Midterm Project — Smart Document Analyzer  
**버전:** 2.1  
**작성일:** 2026-05-05  
**작성자:** ehddud11k123-code  
**기술 방향:** PySide6 + Python + LM Studio 로컬 LLM 기반 데스크톱 애플리케이션

---

## 1. 기술 개요

Smart Document Analyzer는 PySide6 기반의 로컬 데스크톱 애플리케이션이다. UI는 Qt Widgets 기반으로 구성하고, 분석 로직은 독립적인 Python 모듈로 분리한다. 시각화는 Matplotlib와 WordCloud를 사용하며, 분석 작업은 별도 Worker Thread에서 수행하여 UI 프리징을 방지한다.

이번 버전에서는 NLP 전략을 순수 규칙 기반에서 하이브리드 구조로 조정한다.

1. **규칙 기반 빠른 분석:** 통계, 토큰화, 빈도 기반 키워드, 워드클라우드, 문장 길이 분포는 로컬 Python 모듈로 처리한다.
2. **로컬 LLM 해석 보강:** 요약, 톤 해석, 핵심 인사이트, 의미 기반 키워드 보강은 `LM Studio`에 설치된 `qwen3.6` 모델을 호출해 처리한다.
3. **로컬 우선:** 문서 내용은 외부 클라우드 API로 전송하지 않는다.
4. **비차단 실행:** LLM 호출도 Worker Thread 내부에서 실행하여 UI를 멈추지 않게 한다.
5. **장애 허용:** LM Studio 미실행, 모델 미선택, 응답 실패 시에도 규칙 기반 분석 결과는 정상 제공한다.

핵심 설계 원칙은 다음과 같다.

1. **로컬 우선:** 문서 내용은 외부 서버로 전송하지 않는다.
2. **모듈 분리:** UI, 분석, 시각화, 파일 입출력, LLM 연동을 분리한다.
3. **반응형 데스크톱 UX:** 긴 분석 작업은 백그라운드에서 실행한다.
4. **패키징 가능성:** Windows 실행 파일로 배포할 수 있는 구조를 유지한다.
5. **현실적 성능:** 1만 단어 5초 목표를 위해 LLM은 전체 문서 분석 엔진이 아니라 해석 보강 계층으로 제한한다.

---

## 2. 기술 스택

| 구분 | 기술 | 권장 버전 | 용도 |
|---|---|---:|---|
| 언어 | Python | 3.11+ | 전체 애플리케이션 |
| GUI | PySide6 | 6.x | Qt 기반 데스크톱 UI |
| 차트 | Matplotlib | 3.8+ | Qt 내장 차트 렌더링 |
| 워드클라우드 | WordCloud | 1.9+ | 워드클라우드 이미지 생성 |
| 이미지 처리 | Pillow | 10+ | 이미지 변환 및 저장 |
| 데이터 처리 | Pandas | 2.1+ | 표 형태 데이터 처리 |
| 영어 NLP | NLTK | 3.8+ | 토큰화, 문장 분리, 불용어 |
| 한국어 형태소 분석 | kiwipiepy | 0.20+ | 한국어 키워드 추출 |
| 가독성 | textstat | 0.7+ | Flesch Reading Ease 등 |
| 로컬 LLM 연동 | requests 또는 httpx | 최신 안정 버전 | LM Studio 로컬 API 호출 |
| 로컬 LLM | LM Studio + qwen3.6 | 설치형 | 요약, 톤, 인사이트, 의미 키워드 |
| 테스트 | pytest | 8+ | 단위 테스트 |
| UI 테스트 | pytest-qt | 4.4+ | Qt 위젯 테스트 |
| 패키징 | PyInstaller 또는 pyside6-deploy | 최신 안정 버전 | 실행 파일 생성 |

### 2.1 Streamlit 대신 PySide6를 사용하는 이유

| 항목 | Streamlit | PySide6 |
|---|---|---|
| 적합한 형태 | 웹 프로토타입 | 데스크톱 앱 |
| 실행 방식 | 브라우저 기반 | 독립 창 기반 |
| 파일 열기/저장 | 제한적 | 네이티브 파일 다이얼로그 |
| UI 제어 | 제한적 | 세밀한 레이아웃 제어 |
| 배포 | 웹 배포 중심 | 실행 파일 패키징 가능 |
| 과제 데모 | 서버 실행 필요 | 로컬 앱 실행 가능 |

### 2.2 순수 LLM 기반 대신 하이브리드 구조를 사용하는 이유

| 항목 | 순수 LLM 분석 | 하이브리드 분석 |
|---|---|---|
| 응답 시간 | 문서 길이에 크게 영향 | 핵심 지표는 빠르게 고정 시간 처리 |
| 결과 안정성 | 프롬프트/샘플링 영향 큼 | 통계와 차트는 결정적 |
| 오프라인성 | 로컬 모델이면 가능 | 동일 |
| 장애 대응 | 모델 실패 시 전체 기능 영향 | LLM 실패 시도 핵심 기능 유지 |
| MVP 적합성 | 과도한 복잡도 | 요구사항 충족에 적절 |

---

## 3. 시스템 아키텍처

```text
[사용자]
   |
   v
[PySide6 MainWindow]
   |
   +-- [Input Panel]
   |      +-- Text Editor
   |      +-- File Open Dialog
   |
   +-- [Analysis Controller]
   |      +-- Worker Thread
   |      +-- Progress Signal
   |      +-- Result Signal
   |
   +-- [Core Rule-Based Modules]
   |      +-- stats.py
   |      +-- tokenizer.py
   |      +-- keywords.py
   |      +-- sentiment.py
   |      +-- readability.py
   |
   +-- [LLM Interpretation Modules]
   |      +-- llm_client.py
   |      +-- llm_analysis.py
   |
   +-- [Visualization Modules]
   |      +-- charts.py
   |      +-- wordcloud_generator.py
   |
   +-- [Export Modules]
          +-- json_exporter.py
          +-- image_exporter.py
```

### 3.1 레이어 구조

| 레이어 | 책임 |
|---|---|
| Presentation Layer | PySide6 UI, 화면 전환, 입력 검증, 사용자 이벤트 |
| Application Layer | 분석 실행 흐름 제어, Worker Thread 관리, 단계별 진행률 관리 |
| Domain Layer | 통계, 키워드, 감성, 가독성 계산, LLM 프롬프트 조립 및 응답 파싱 |
| Infrastructure Layer | 파일 입출력, JSON 저장, 이미지 저장, 설정 관리, LM Studio HTTP 호출 |

### 3.2 분석 파이프라인

```text
입력 텍스트 수신
 -> 입력 검증
 -> 규칙 기반 분석 실행
    -> 통계 계산
    -> 토큰화
    -> 빈도 기반 키워드
    -> 감성/가독성
    -> 워드클라우드/히스토그램용 데이터
 -> LLM 컨텍스트 축약
 -> LM Studio qwen3.6 호출
 -> 구조화 JSON 응답 파싱
 -> 규칙 기반 결과와 병합
 -> UI 업데이트
```

---

## 4. 프로젝트 구조

```text
smart-document-analyzer/
├── README.md
├── PRD.md
├── TRD.md
├── pyproject.toml
├── requirements.txt
├── src/
│   └── smart_doc_analyzer/
│       ├── __init__.py
│       ├── __main__.py
│       ├── app.py
│       ├── ui/
│       │   ├── main_window.py
│       │   ├── input_panel.py
│       │   ├── result_panel.py
│       │   ├── overview_tab.py
│       │   ├── keywords_tab.py
│       │   ├── visualization_tab.py
│       │   ├── export_tab.py
│       │   └── settings_dialog.py
│       ├── controllers/
│       │   ├── analysis_controller.py
│       │   └── worker.py
│       ├── core/
│       │   ├── models.py
│       │   ├── stats.py
│       │   ├── tokenizer.py
│       │   ├── keywords.py
│       │   ├── sentiment.py
│       │   ├── readability.py
│       │   ├── llm_client.py
│       │   ├── llm_analysis.py
│       │   └── pipeline.py
│       ├── visualization/
│       │   ├── charts.py
│       │   └── wordcloud_generator.py
│       ├── io/
│       │   ├── file_loader.py
│       │   ├── json_exporter.py
│       │   └── image_exporter.py
│       ├── resources/
│       │   ├── stopwords_ko.txt
│       │   └── sample_text.txt
│       └── config/
│           └── settings.py
├── tests/
│   ├── test_stats.py
│   ├── test_keywords.py
│   ├── test_sentiment.py
│   ├── test_readability.py
│   ├── test_llm_analysis.py
│   ├── test_pipeline.py
│   ├── test_file_loader.py
│   └── test_worker.py
└── packaging/
    ├── pyinstaller.spec
    └── build_windows.ps1
```

---

## 5. 주요 컴포넌트 상세

### 5.1 UI 컴포넌트

#### MainWindow

| 항목 | 설명 |
|---|---|
| 클래스 | `QMainWindow` |
| 역할 | 전체 앱 프레임, 메뉴바, 상태바, 중앙 위젯 관리 |
| 주요 기능 | 파일 열기, 결과 저장, 앱 종료, 도움말 표시, LLM 설정 진입 |

#### InputPanel

| 항목 | 설명 |
|---|---|
| 구성 | `QPlainTextEdit`, 파일 열기 버튼, 초기화 버튼, 분석 버튼 |
| 역할 | 텍스트 입력 및 파일 로드 |
| 검증 | 빈 텍스트, 너무 짧은 텍스트, 과도하게 긴 텍스트 감지 |

#### ResultPanel

| 항목 | 설명 |
|---|---|
| 구성 | `QTabWidget` |
| 탭 | Overview, Keywords, Visualization, Export |
| 역할 | 분석 결과를 카테고리별로 표시 |

#### SettingsDialog

| 항목 | 설명 |
|---|---|
| 구성 | LLM 사용 여부, endpoint, 모델명, timeout 입력 |
| 기본값 | `enabled=True`, `endpoint=http://127.0.0.1:1234/v1`, `model=qwen3.6` |
| 역할 | LM Studio 연결 설정 관리 |

#### 상태바

| 상태 | 메시지 |
|---|---|
| 대기 | Ready |
| 파일 로드 | Loaded: filename.txt |
| 규칙 분석 중 | Running rule-based analysis... |
| LLM 해석 중 | Interpreting with local qwen3.6... |
| 완료 | Analysis completed in 2.14s |
| 오류 | Error: reason |

---

## 6. 분석 컨트롤러

### 6.1 AnalysisController

분석 버튼 클릭 후 전체 분석 흐름을 관리한다.

```text
입력 텍스트 수신
 -> 입력 검증
 -> AnalysisWorker 생성
 -> QThread 시작
 -> progress signal 수신
 -> partial result 또는 final result 수신
 -> UI 업데이트
```

### 6.2 AnalysisWorker

| 항목 | 설명 |
|---|---|
| 기반 | `QObject` + `QThread` |
| 입력 | 원문 텍스트, 소스명, 분석 옵션, LLM 설정 |
| 출력 | `AnalysisResult` 객체 |
| 통신 | Signal/Slot 방식 |
| 목적 | 분석 중 UI 프리징 방지 |

### 6.3 Worker 실행 정책

1. 규칙 기반 분석을 먼저 실행한다.
2. 규칙 기반 분석이 끝나면 결과를 임시로 표시할 수 있다.
3. LLM 사용이 켜져 있으면 축약 컨텍스트를 생성한다.
4. LM Studio 로컬 API로 `qwen3.6`을 호출한다.
5. 응답이 정상이면 최종 결과를 병합한다.
6. 응답 실패 시 `llm_error`만 채우고 나머지 결과는 유지한다.

---

## 7. 데이터 모델

```python
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BasicStats:
    character_count: int
    word_count: int
    sentence_count: int
    paragraph_count: int
    unique_word_count: int
    average_sentence_length: float


@dataclass
class SentimentResult:
    polarity: Optional[float]
    subjectivity: Optional[float]
    label: str
    source: str


@dataclass
class ReadabilityResult:
    flesch_reading_ease: Optional[float]
    grade: str
    description: str


@dataclass
class LlmInsightResult:
    summary: str
    tone: str
    insights: list[str] = field(default_factory=list)
    semantic_keywords: list[str] = field(default_factory=list)
    llm_used: bool = False
    llm_error: Optional[str] = None


@dataclass
class AnalysisResult:
    source_name: str
    language: str
    elapsed_seconds: float
    stats: BasicStats
    keywords: list[tuple[str, int]]
    sentiment: SentimentResult
    readability: ReadabilityResult
    sentence_lengths: list[int]
    warnings: list[str]
    llm: LlmInsightResult
```

---

## 8. 모듈별 기술 명세

### 8.1 `file_loader.py`

| 항목 | 내용 |
|---|---|
| 책임 | 로컬 파일 선택 및 읽기, 지원 확장자 검증, 인코딩 처리 |
| 지원 형식 | `.txt`, `.md` |
| 인코딩 | UTF-8 우선, 실패 시 `utf-8-sig`, `cp949` 순서로 재시도 |
| 실패 처리 | 사용자에게 파일 읽기 오류 메시지 표시 |

### 8.2 `tokenizer.py`

| 언어 | 토큰화 방식 |
|---|---|
| 영어 | NLTK 기반 단어/문장 토큰화 |
| 한국어 | kiwipiepy 기반 형태소 분석 |
| 기타 | 정규식 기반 fallback |

전처리 규칙은 소문자 변환, 특수문자 제거, 숫자-only 토큰 제거, 불용어 제거, 길이 1 이하 토큰 제거를 포함한다.

### 8.3 `stats.py`

| 항목 | 계산 방법 |
|---|---|
| 글자 수 | `len(text)` |
| 단어 수 | 토큰 수 |
| 문장 수 | 문장 토큰 수 |
| 문단 수 | 빈 줄 기준 분리 |
| 고유 단어 수 | `len(set(tokens))` |
| 평균 문장 길이 | 단어 수 / 문장 수 |

### 8.4 `keywords.py`

MVP에서는 단순 빈도 기반 키워드 추출을 기본으로 사용한다.

1. 토큰 정규화
2. 불용어 제거
3. `Counter`로 빈도 계산
4. 상위 `top_n`개 반환

LLM은 이 결과를 대체하지 않고 보강한다. 따라서 최종 UI에는 아래 두 종류를 구분 표시한다.

- `Top Keywords`: 빈도 기반 상위 키워드
- `Semantic Keywords`: `qwen3.6`이 제안한 의미 기반 키워드

### 8.5 `sentiment.py`

MVP의 감성 처리는 하이브리드로 설계한다.

| 언어 | 방식 |
|---|---|
| 영어 | 규칙 기반 polarity/subjectivity 또는 경량 라이브러리 기반 계산 |
| 한국어 | 숫자 점수 강제 대신 LLM 톤 해석 중심 |
| 혼합 문서 | 숫자 감성보다 설명형 tone 결과 우선 |

최종 결과는 아래처럼 분리한다.

- `sentiment.label`: Positive/Neutral/Negative 또는 Informational
- `sentiment.source`: `rule-based` 또는 `llm-assisted`
- `llm.tone`: Formal, Critical, Positive, Neutral, Analytical 등 설명형 값

### 8.6 `readability.py`

영어 텍스트는 Flesch Reading Ease 점수를 계산한다.

```text
206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
```

| 점수 | 등급 | 설명 |
|---:|---|---|
| 90 이상 | Very Easy | 매우 쉬움 |
| 70 이상 | Easy | 쉬움 |
| 50 이상 | Moderate | 보통 |
| 30 이상 | Difficult | 어려움 |
| 30 미만 | Very Difficult | 매우 어려움 |

한국어는 Flesch 점수를 제공하지 않고 평균 문장 길이, 평균 어절 수, 긴 문장 비율을 대체 지표로 표시한다.

### 8.7 `llm_client.py`

| 항목 | 설명 |
|---|---|
| 목적 | LM Studio OpenAI-compatible endpoint 호출 |
| 기본 endpoint | `http://127.0.0.1:1234/v1` |
| 기본 모델명 | `qwen3.6` |
| 요청 형식 | `chat/completions` 또는 LM Studio 호환 형식 |
| timeout | 기본 20초 |
| 실패 처리 | 예외를 상위로 전달하고 worker에서 fallback 처리 |

### 8.8 `llm_analysis.py`

| 항목 | 설명 |
|---|---|
| 입력 | 축약된 텍스트 컨텍스트, 상위 키워드, 기본 통계 |
| 출력 | 구조화된 `LlmInsightResult` |
| 프롬프트 전략 | JSON 강제 응답 |
| 생성 항목 | 요약, 톤, 핵심 인사이트 3~5개, 의미 키워드 5~10개 |

프롬프트는 자유 서술보다 구조화 응답을 우선한다.

```text
Return valid JSON with keys:
summary, tone, insights, semantic_keywords
```

### 8.9 `charts.py`

Matplotlib Figure를 PySide6 위젯에 임베딩한다.

| 함수 | 출력 |
|---|---|
| `create_keyword_bar_chart(keywords)` | 키워드 빈도 가로 막대 차트 |
| `create_sentence_length_histogram(lengths)` | 문장 길이 히스토그램 |
| `create_sentiment_view(sentiment, tone)` | 감성 라벨과 톤을 함께 보여주는 뷰 |

### 8.10 `wordcloud_generator.py`

| 항목 | 설명 |
|---|---|
| 입력 | 토큰 목록, 폰트 경로 |
| 출력 | `PIL.Image.Image` |
| 영어 | 기본 폰트 사용 |
| 한국어 | 한글 폰트 경로 필요 |
| 저장 | PNG 저장 지원 |

---

## 9. UI 레이아웃 상세

```text
+--------------------------------------------------------------+
| Smart Document Analyzer              [Settings] [Help] [Quit] |
+------------------------------+-------------------------------+
| Input                        | Results                       |
| +--------------------------+ | +---------------------------+ |
| | Text Editor              | | | Overview Tab              | |
| |                          | | | [Stats] [Summary] [Tone]  | |
| +--------------------------+ | +---------------------------+ |
| [Open File] [Clear] [Analyze] | | Keywords Tab              | |
|                              | | [Top Keywords]            | |
|                              | | [Semantic Keywords]       | |
|                              | +---------------------------+ |
|                              | | Visualization Tab         | |
|                              | | [WordCloud] [Histogram]   | |
|                              | +---------------------------+ |
|                              | | Export Tab                | |
|                              | | [Save JSON] [Save PNG]    | |
+------------------------------+-------------------------------+
| Status: Ready                                                 |
+--------------------------------------------------------------+
```

### 9.1 권장 Qt 위젯

| 목적 | Qt 위젯 |
|---|---|
| 메인 창 | `QMainWindow` |
| 중앙 레이아웃 | `QSplitter` |
| 텍스트 입력 | `QPlainTextEdit` |
| 결과 탭 | `QTabWidget` |
| 통계 카드 | `QFrame` + `QLabel` |
| 키워드 표 | `QTableWidget` 또는 `QTableView` |
| 진행 상태 | `QProgressBar` |
| 파일 선택 | `QFileDialog` |
| 경고/오류 | `QMessageBox` |
| 상태 표시 | `QStatusBar` |

---

## 10. 비동기 처리 설계

분석은 UI 스레드에서 직접 실행하지 않는다.

```python
class AnalysisWorker(QObject):
    progress_changed = Signal(int, str)
    result_ready = Signal(AnalysisResult)
    error_occurred = Signal(str)
    finished = Signal()
```

| 단계 | 진행률 |
|---|---:|
| 입력 검증 | 10% |
| 토큰화 | 25% |
| 통계 계산 | 40% |
| 키워드 추출 | 55% |
| 감성/가독성 | 70% |
| LLM 컨텍스트 준비 | 80% |
| LM Studio qwen3.6 호출 | 90% |
| 완료 | 100% |

### 10.1 성능 보호 전략

1. 긴 문서를 통째로 LLM에 전달하지 않는다.
2. 앞부분 본문, 대표 문장 샘플, 상위 키워드, 기본 통계만 컨텍스트로 보낸다.
3. LLM 호출은 옵션으로 끌 수 있게 한다.
4. timeout 초과 시 규칙 기반 결과만 유지한다.

---

## 11. 오류 처리

| 오류 코드 | 상황 | 처리 |
|---|---|---|
| E-001 | 입력 텍스트 없음 | 분석 버튼 비활성화 또는 안내 메시지 |
| E-002 | 지원하지 않는 파일 | 파일 형식 오류 메시지 |
| E-003 | 파일 읽기 실패 | 인코딩 안내 및 재시도 |
| E-004 | NLP 리소스 누락 | 설치 안내 표시 |
| E-005 | 워드클라우드 생성 실패 | 폰트 설정 안내 |
| E-006 | 분석 중 예외 | 상세 로그 저장, 사용자 메시지 표시 |
| E-007 | 저장 실패 | 권한/경로 확인 메시지 |
| E-008 | LM Studio 연결 실패 | 규칙 기반 결과 유지, LLM 오류 표시 |
| E-009 | qwen3.6 응답 파싱 실패 | 요약 섹션에 실패 메시지 표시 후 계속 진행 |
| E-010 | 모델 미설정 또는 미로드 | 설정 화면 안내 |

---

## 12. 성능 요구사항

| 항목 | 기준 |
|---|---|
| 1만 단어 이하 규칙 기반 분석 | 5초 이내 목표 |
| 앱 최초 실행 | 3초 이내 |
| 파일 열기 | 2MB 이하 텍스트 파일 1초 이내 |
| UI 응답성 | 분석 중 버튼 클릭/창 이동 가능 |
| 메모리 사용량 | 일반 문서 분석 시 500MB 이하 목표 |

주의할 점은 LLM 해석은 로컬 모델 속도에 영향을 받으므로 문서 전체에 대한 실시간 완전 분석이 아니라 보강 계층으로 제한해야 한다는 것이다.

---

## 13. 보안 및 개인정보

- 문서 원문은 외부 서버로 전송하지 않는다.
- LM Studio는 로컬 프로세스로만 사용한다.
- 기본 설정에서는 원문을 로컬 디스크에 자동 저장하지 않는다.
- 오류 로그에는 원문 전체를 기록하지 않는다.
- 저장 기능은 사용자의 명시적 액션이 있을 때만 수행한다.
- 실행 파일 배포 시 외부 API 키, 토큰, 개인 설정 파일을 포함하지 않는다.

---

## 14. 의존성 파일

### 14.1 `requirements.txt`

```text
PySide6>=6.7
matplotlib>=3.8
pandas>=2.1
nltk>=3.8
textstat>=0.7
wordcloud>=1.9
Pillow>=10.0
kiwipiepy>=0.20
requests>=2.32
pytest>=8.0
pytest-qt>=4.4
```

### 14.2 NLP 리소스 설치

```bash
python -m nltk.downloader punkt stopwords averaged_perceptron_tagger
```

앱 시작 시 리소스가 없으면 사용자에게 설치 안내를 표시한다.

### 14.3 LM Studio 준비 조건

1. LM Studio를 실행한다.
2. `qwen3.6` 모델을 로드한다.
3. 로컬 서버 기능을 활성화한다.
4. 앱 설정에서 endpoint와 모델명을 확인한다.

---

## 15. 실행 방법

### 15.1 개발 환경 실행

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
python -m nltk.downloader punkt stopwords averaged_perceptron_tagger
python -m smart_doc_analyzer
```

### 15.2 대체 실행

```bash
python src/smart_doc_analyzer/app.py
```

---

## 16. 패키징

### 16.1 Windows EXE 생성 방향

MVP에서는 PyInstaller를 사용한다.

```bash
pyinstaller packaging/pyinstaller.spec
```

### 16.2 PyInstaller 고려사항

- PySide6 플러그인 포함 여부 확인
- Matplotlib 백엔드 포함 여부 확인
- WordCloud 한글 폰트 포함 여부 확인
- NLTK 데이터 리소스 포함 여부 확인
- LM Studio 자체는 앱 내부에 번들하지 않고 외부 설치 전제로 문서화
- 기본 endpoint와 모델명 설정 파일 포함 여부 확인

### 16.3 산출물

```text
dist/
└── SmartDocumentAnalyzer/
    ├── SmartDocumentAnalyzer.exe
    ├── _internal/
    └── resources/
```

---

## 17. 테스트 전략

### 17.1 단위 테스트

| 테스트 파일 | 대상 |
|---|---|
| `test_stats.py` | 단어/문장/문단 수 계산 |
| `test_keywords.py` | 불용어 제거, 상위 키워드 추출 |
| `test_sentiment.py` | 감성 라벨 분류 |
| `test_readability.py` | 가독성 점수 범위 |
| `test_file_loader.py` | 파일 읽기 및 인코딩 |
| `test_llm_analysis.py` | 프롬프트 조립 및 JSON 파싱 |
| `test_pipeline.py` | 규칙 기반 결과와 LLM 결과 병합 |
| `test_worker.py` | worker 생성 및 신호 흐름 |

### 17.2 통합 테스트

| 시나리오 | 기대 결과 |
|---|---|
| LM Studio 꺼진 상태에서 분석 | 규칙 기반 결과 표시, LLM 오류 안내 |
| LM Studio + qwen3.6 정상 상태에서 분석 | 요약, 톤, 인사이트 표시 |
| 긴 문서 분석 | UI 비정지, 컨텍스트 축약 후 처리 |
| 결과 JSON 저장 | 파일 생성 |
| 워드클라우드 저장 | PNG 파일 생성 |

### 17.3 UI 테스트

| 시나리오 | 기대 결과 |
|---|---|
| 빈 텍스트 분석 | 경고 메시지 |
| 정상 `.txt` 파일 열기 | 텍스트 표시 |
| 분석 버튼 클릭 | 진행률 표시 후 결과 출력 |
| 설정 창 진입 | endpoint, model 편집 가능 |
| 한국어 문서 입력 | 빈도 키워드와 LLM 해석 표시 |

---

## 18. 개발 일정 예시

| 주차 | 작업 |
|---|---|
| 1주차 | 프로젝트 구조 생성, PySide6 메인 UI 구현 |
| 2주차 | 파일 입력, 텍스트 입력, 기본 통계 구현 |
| 3주차 | 키워드, 감성, 가독성, 워드클라우드 구현 |
| 4주차 | LM Studio client, qwen3.6 연동, JSON 응답 파싱 |
| 5주차 | Worker Thread, fallback, 설정 화면, export 구현 |
| 6주차 | 테스트, 패키징, README/시연자료 작성 |

---

## 19. 구현 우선순위

### Sprint 1 — 앱 뼈대

- `QMainWindow`
- 입력 패널
- 결과 탭
- 파일 열기
- 상태바

### Sprint 2 — 규칙 기반 분석

- 기본 통계
- 키워드 추출
- 가독성 점수
- 워드클라우드

### Sprint 3 — 로컬 LLM 해석

- LM Studio 연결
- `qwen3.6` 프롬프트 설계
- 요약, 톤, 인사이트, 의미 키워드
- 실패 시 fallback

### Sprint 4 — 안정화

- Worker Thread
- 오류 처리
- JSON/PNG 저장
- 패키징

---

## 20. 개발 리스크와 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| PySide6 패키징 크기 증가 | 제출 파일이 커질 수 있음 | 소스 제출 + 실행 가이드 병행 |
| NLTK 리소스 누락 | 실행 오류 | 앱 시작 시 리소스 체크 |
| 한국어 폰트 누락 | 워드클라우드 깨짐 | 기본 한글 폰트 포함 또는 설정 안내 |
| UI 프리징 | 사용성 저하 | QThread 기반 분석 |
| LM Studio 미실행 | LLM 결과 누락 | fallback 처리 |
| qwen3.6 응답 지연 | 전체 완료 시간 증가 | 컨텍스트 축약, timeout, 후행 해석 |
| LLM JSON 형식 일탈 | 파싱 실패 | 구조화 프롬프트와 파싱 보호 |
| PDF/DOCX 파싱 복잡도 | 일정 지연 | Phase 2로 분리 |

---

## 21. 완료 기준

MVP는 다음 조건을 만족하면 완료로 본다.

1. 앱이 로컬에서 실행된다.
2. 사용자가 텍스트를 입력하거나 `.txt`, `.md` 파일을 열 수 있다.
3. 분석 버튼 클릭 후 UI가 멈추지 않는다.
4. 기본 통계, 빈도 키워드, 워드클라우드, 가독성 결과가 표시된다.
5. LM Studio의 로컬 `qwen3.6`을 이용한 요약, 톤, 인사이트가 표시된다.
6. LM Studio가 실패해도 규칙 기반 결과는 유지된다.
7. 결과를 JSON으로 저장할 수 있다.
8. 워드클라우드를 PNG로 저장할 수 있다.
9. README에 설치, 실행, LM Studio 준비 방법이 정리되어 있다.
10. 핵심 분석 함수와 LLM 파서 테스트가 통과한다.
