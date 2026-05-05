# PLAN.md

# SoriSori 로컬 AI 버전 구현 계획

**목표:** `pusannano000202-tech/sorisori` 저장소를 기준으로, OpenAI Realtime STT + DeepL 번역 의존도를 낮추고 **로컬 STT + 로컬 LLM 번역** 중심으로 실행 가능한 버전을 만든다.

**선택 모델:**

```txt
STT: faster-whisper large-v3-turbo
LLM: LM Studio + Qwen3.6
```

**권장 기본 조합:**

```txt
STT model: large-v3-turbo
STT runtime: faster-whisper / CTranslate2
LLM model: qwen/qwen3.6-27b
LLM runtime: LM Studio Local Server
LLM API: OpenAI-compatible /v1/chat/completions
Main OS target: Windows
Audio capture: Tauri desktop + WASAPI loopback
Subtitle target language: Korean
```

---

## 1. 프로젝트 이해

SoriSori는 PC에서 재생되는 외국어 오디오를 실시간으로 받아 한국어 자막으로 보여주는 웹 + 데스크톱 앱이다.

현재 저장소의 주요 구조는 다음과 같다.

```txt
sorisori/
├── .ops/
├── apps/
│   ├── web/
│   └── desktop/
├── docs/
│   ├── PRD.md
│   └── TRD.md
├── packages/
│   ├── contracts/
│   ├── ui/
│   └── config/
├── services/
│   ├── realtime/
│   ├── pipeline/
│   └── local-ai/
├── .env.example
├── docker-compose.yml
├── package.json
└── rust-toolchain.toml
```

README 기준 현재 구현 범위는 다음과 같다.

```txt
apps/desktop:
  - WASAPI loopback 캡처
  - realtime uplink
  - transcript debug 화면

services/realtime:
  - WebSocket gateway
  - OpenAI realtime transcription
  - DeepL translation

services/pipeline:
  - 세션/세그먼트 저장
  - summary/segments REST API
  - PostgreSQL 저장 코드

services/local-ai:
  - faster-whisper STT
  - Argos/Marian/NLLB 기반 번역
  - 선택적 LLM 번역 backend 구조

apps/web:
  - live viewer /session
  - history /history
  - archive detail /session/[id]
```

이번 계획의 핵심은 기존 OpenAI/DeepL cloud route를 완전히 버리는 것이 아니라, **로컬 AI route를 기본값으로 승격**하는 것이다.

---

## 2. 최종 목표 아키텍처

## 2.1 목표 파이프라인

```txt
[PC Audio]
   ↓
[apps/desktop: Tauri]
   - WASAPI loopback capture
   - stereo/float32/48kHz → mono/PCM16/24kHz 변환
   ↓
[services/realtime]
   - WebSocket gateway
   - session id 관리
   - audio chunk relay
   ↓
[services/local-ai]
   - faster-whisper large-v3-turbo: STT
   - LM Studio Qwen3.6: 한국어 자막 번역/보정
   ↓
[services/pipeline]
   - transcript segment 저장
   - translation segment 저장
   - session summary/history API
   ↓
[apps/web]
   - live subtitle viewer
   - session history
   - archive detail
```

## 2.2 로컬 AI 책임 분리

```txt
faster-whisper:
  소리 → 원문 텍스트

Qwen3.6 via LM Studio:
  원문 텍스트 → 자연스러운 한국어 자막

Argos/Marian/NLLB:
  LM Studio 실패 시 fallback 번역
```

중요한 점은 **LLM에게 음성을 직접 넣지 않는 것**이다. LM Studio의 Qwen3.6은 번역/자막 보정에 사용하고, 실제 음성 인식은 faster-whisper가 담당한다.

---

## 3. 모델 선택 기준

## 3.1 STT: faster-whisper large-v3-turbo

### 선택 이유

- `large-v3` 계열 품질을 유지하면서 latency를 줄이기 좋다.
- `faster-whisper`는 CTranslate2 기반이라 로컬 실행에 적합하다.
- 실시간 자막은 완벽한 긴 문장 번역보다 빠른 segment 단위 전사가 중요하다.
- 영어/일본어/다국어 오디오를 한 모델로 처리하기 쉽다.

### 권장 설정

```env
WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=auto
WHISPER_COMPUTE_TYPE=float16
LOCAL_AI_STT_BEAM_SIZE=5
LOCAL_AI_STT_BEAM_SIZE_JA=5
LOCAL_AI_STT_VAD_FILTER=true
LOCAL_AI_STT_CONDITION_ON_PREVIOUS_TEXT=false
LOCAL_AI_STT_NO_SPEECH_THRESHOLD=0.6
LOCAL_AI_STT_LOG_PROB_THRESHOLD=-1.0
LOCAL_AI_STT_COMPRESSION_RATIO_THRESHOLD=2.4
```

### 하드웨어별 설정

| 환경 | WHISPER_DEVICE | WHISPER_COMPUTE_TYPE | 권장 |
|---|---|---|---|
| NVIDIA GPU 8GB 이상 | cuda | float16 | 권장 |
| NVIDIA GPU 6GB 이하 | cuda | int8_float16 | 품질/속도 절충 |
| CPU only | cpu | int8 | 동작 우선, 실시간성은 떨어질 수 있음 |
| 데모 안정성 우선 | auto | int8 | 느리지만 crash 가능성 낮음 |

### 모델 다운로드 방식

기본적으로 첫 실행 시 자동 다운로드를 시도한다. 안정적으로 미리 받고 싶다면 Hugging Face CLI로 다운로드한다.

```bash
pip install -U "huggingface_hub[cli]"
```

Windows PowerShell 예시:

```powershell
mkdir "$env:APPDATA\sorisori\models\large-v3-turbo"

huggingface-cli download h2oai/faster-whisper-large-v3-turbo `
  --local-dir "$env:APPDATA\sorisori\models\large-v3-turbo"
```

그리고 `.env`에 다음처럼 지정한다.

```env
WHISPER_MODEL=C:\Users\<USER>\AppData\Roaming\sorisori\models\large-v3-turbo
```

만약 경로 지정 대신 모델 이름으로 자동 다운로드를 쓰려면 다음을 먼저 시도한다.

```env
WHISPER_MODEL=large-v3-turbo
```

사용 중인 `faster-whisper` 버전에서 `large-v3-turbo` 이름을 인식하지 못하면 다음 중 하나로 바꾼다.

```env
WHISPER_MODEL=h2oai/faster-whisper-large-v3-turbo
```

또는 위의 local path 방식을 사용한다.

---

## 3.2 LLM: LM Studio + Qwen3.6

### 기본 추천 모델

```txt
qwen/qwen3.6-27b
```

### 선택 이유

- LM Studio에서 GGUF로 바로 받을 수 있다.
- Dense 27B라 번역/문장 다듬기 품질이 안정적일 가능성이 높다.
- 자막 번역에서는 reasoning보다 짧고 자연스러운 output이 중요하므로 27B dense가 기본값으로 적합하다.
- 최소 시스템 메모리 요구가 17GB 수준이므로 32GB RAM PC에서 현실적으로 시도 가능하다.

### 고사양 선택지

```txt
qwen/qwen3.6-35b-a3b
```

장점:

- 35B MoE 계열
- active parameter가 적어 응답 속도가 나을 수 있음
- LM Studio 기준 최소 메모리 요구가 21GB 수준

단점:

- 27B보다 실제 번역 품질이 항상 좋다고 보장할 수 없음
- 로컬 실시간 자막에서는 안정성이 더 중요하므로 27B를 먼저 추천

### 권장 LM Studio 설정

```txt
Model: qwen/qwen3.6-27b
Server: http://127.0.0.1:1234/v1
Temperature: 0.1
Top P: 0.9
Max tokens: 128
Context length: 4096 ~ 8192
Streaming: false
Reasoning / Thinking: off 또는 최소화
GPU offload: 가능한 만큼
```

### LM Studio 모델 다운로드

1. LM Studio 실행
2. Models 또는 Discover 화면에서 `Qwen3.6` 검색
3. `qwen/qwen3.6-27b` 선택
4. `Get` 또는 Download 클릭
5. 다운로드 완료 후 모델 로드
6. Developer 탭으로 이동
7. Local Server 시작
8. server URL 확인

기본 서버 주소는 다음을 사용한다.

```txt
http://127.0.0.1:1234/v1
```

CLI를 쓰는 경우:

```bash
lms server start
```

---

## 4. 환경 변수 계획

루트 `.env.example` 또는 `.env.local`에 다음 값을 추가/수정한다.

```env
# ------------------------------------------------------------
# Local AI service
# ------------------------------------------------------------
LOCAL_AI_URL=http://127.0.0.1:8789
LOCAL_AI_HOST=127.0.0.1
LOCAL_AI_PORT=8789

# ------------------------------------------------------------
# STT: faster-whisper large-v3-turbo
# ------------------------------------------------------------
WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=auto
WHISPER_COMPUTE_TYPE=float16
MODELS_DIR=%APPDATA%\sorisori\models

LOCAL_AI_STT_BEAM_SIZE=5
LOCAL_AI_STT_BEAM_SIZE_JA=5
LOCAL_AI_STT_VAD_FILTER=true
LOCAL_AI_STT_CONDITION_ON_PREVIOUS_TEXT=false
LOCAL_AI_STT_NO_SPEECH_THRESHOLD=0.6
LOCAL_AI_STT_LOG_PROB_THRESHOLD=-1.0
LOCAL_AI_STT_COMPRESSION_RATIO_THRESHOLD=2.4

LOCAL_AI_STT_INITIAL_PROMPT_EN=Transcribe spoken English clearly. Keep natural words and punctuation.
LOCAL_AI_STT_INITIAL_PROMPT_JA=Transcribe spoken Japanese in Japanese script. Do not use romaji.

# ------------------------------------------------------------
# LLM translation: LM Studio + Qwen3.6
# ------------------------------------------------------------
LOCAL_AI_LLM_BACKEND=lmstudio
LOCAL_AI_LLM_URL=http://127.0.0.1:1234/v1
LOCAL_AI_LLM_MODEL=qwen/qwen3.6-27b
LOCAL_AI_LLM_TIMEOUT_S=5.0
LOCAL_AI_LLM_NUM_PREDICT=128
LOCAL_AI_LLM_TEMPERATURE=0.1
LOCAL_AI_LLM_TOP_P=0.9

# ------------------------------------------------------------
# Translation fallback
# ------------------------------------------------------------
LOCAL_AI_JA_TRANSLATION_MODE=auto
LOCAL_AI_JA_DIRECT_MODEL=facebook/nllb-200-distilled-600M
LOCAL_AI_LANGUAGE_HINT_MODE=strict

# ------------------------------------------------------------
# Realtime gateway
# ------------------------------------------------------------
REALTIME_HOST=127.0.0.1
REALTIME_PORT=8787

# ------------------------------------------------------------
# Pipeline service
# ------------------------------------------------------------
PIPELINE_HOST=127.0.0.1
PIPELINE_PORT=8788
REALTIME_GATEWAY_WS_URL=ws://127.0.0.1:8787/ws
PIPELINE_SESSION_IDS=mvp-session-001

# 기존 pipeline이 PostgreSQL을 요구하면 우선 기존값 유지
DATABASE_URL=postgresql://sorisori:sorisori@localhost:5432/sorisori

# ------------------------------------------------------------
# Web app
# ------------------------------------------------------------
PIPELINE_API_URL=http://127.0.0.1:8788
NEXT_PUBLIC_REALTIME_WS_URL=ws://127.0.0.1:8787/ws
NEXT_PUBLIC_DEFAULT_SESSION_ID=mvp-session-001

# ------------------------------------------------------------
# Cloud fallback keys
# 이번 로컬 플랜에서는 기본적으로 비워둔다.
# ------------------------------------------------------------
OPENAI_API_KEY=
DEEPL_API_KEY=
```

주의:

- Windows `.env`에서 `%APPDATA%`가 프로그램 내부에서 자동 확장되지 않을 수 있다.
- 안전하게는 절대 경로를 직접 넣는 것이 좋다.

예시:

```env
MODELS_DIR=C:\Users\myname\AppData\Roaming\sorisori\models
```

---

## 5. 설치 계획

## 5.1 필수 설치 항목

```txt
Node.js >= 24
npm
Python 3.11 권장
Rust toolchain
LM Studio
Visual Studio Build Tools 또는 Windows C++ build tools
NVIDIA GPU 사용 시 CUDA/cuDNN 환경
```

## 5.2 저장소 설치

```bash
git clone https://github.com/pusannano000202-tech/sorisori.git
cd sorisori
npm install
```

루트 `package.json`에는 다음 workspace가 있다.

```txt
apps/*
services/*
packages/*
```

그리고 주요 실행 스크립트는 다음이다.

```bash
npm run dev:local-ai
npm run dev:realtime
npm run dev:pipeline
npm run dev:web
npm run dev:desktop
```

## 5.3 local-ai Python 환경 구성

Windows PowerShell 기준:

```powershell
cd services/local-ai

python -m venv .venv
.\.venv\Scripts\activate

python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -U faster-whisper ctranslate2 huggingface_hub openai
```

`requirements.txt`에 `openai` 또는 `httpx`가 없다면 LM Studio adapter 구현 방식에 따라 추가한다.

권장:

```txt
openai>=1.0.0
httpx>=0.27.0
```

다만 기존 `main.py`가 `urllib.request`를 이미 쓰고 있으므로, 외부 의존성을 줄이고 싶다면 `urllib`만으로도 LM Studio 호출을 구현할 수 있다.

---

## 6. services/local-ai 수정 계획

현재 `services/local-ai/main.py`는 faster-whisper STT와 Argos/Marian/NLLB 번역을 담당한다. LLM backend는 현재 주로 Ollama를 가정하고 있으므로, LM Studio backend를 추가한다.

## 6.1 수정 목표

```txt
LOCAL_AI_LLM_BACKEND=lmstudio
```

일 때 다음 endpoint를 호출한다.

```txt
POST http://127.0.0.1:1234/v1/chat/completions
```

## 6.2 추가 환경 변수

```py
LLM_BACKEND = os.environ.get("LOCAL_AI_LLM_BACKEND", "").strip().lower()
LLM_URL = os.environ.get("LOCAL_AI_LLM_URL", "http://127.0.0.1:1234/v1").rstrip("/")
LLM_MODEL = os.environ.get("LOCAL_AI_LLM_MODEL", "qwen/qwen3.6-27b")
LLM_TIMEOUT_S = float(os.environ.get("LOCAL_AI_LLM_TIMEOUT_S", "5.0"))
LLM_NUM_PREDICT = int(os.environ.get("LOCAL_AI_LLM_NUM_PREDICT", "128"))
LLM_TEMPERATURE = float(os.environ.get("LOCAL_AI_LLM_TEMPERATURE", "0.1"))
LLM_TOP_P = float(os.environ.get("LOCAL_AI_LLM_TOP_P", "0.9"))
```

## 6.3 LM Studio 호출 함수 예시

기존 코드 스타일에 맞춰 `urllib.request` 기반으로 작성할 수 있다.

```py
def _llm_translate_lmstudio(text: str, source_lang: str, target_lang: str = "ko") -> str:
    if not text.strip():
        return ""

    url = f"{LLM_URL}/chat/completions"

    system_prompt = (
        "You are a professional Korean subtitle translator. "
        "Translate the user's transcript into natural Korean subtitles. "
        "Keep the meaning faithful. Keep it short and readable. "
        "Do not explain. Do not include markdown. Output only Korean."
    )

    user_prompt = (
        f"Source language: {source_lang}\n"
        f"Target language: Korean\n"
        f"Transcript:\n{text.strip()}"
    )

    payload = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": LLM_TEMPERATURE,
        "top_p": LLM_TOP_P,
        "max_tokens": LLM_NUM_PREDICT,
        "stream": False,
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=LLM_TIMEOUT_S) as res:
        data = json.loads(res.read().decode("utf-8"))

    return (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )
```

## 6.4 backend 분기

기존 `_llm_translate` 함수가 있다면 다음처럼 확장한다.

```py
def _llm_translate(text: str, source_lang: str, target_lang: str = "ko") -> str:
    if LLM_BACKEND == "lmstudio":
        return _llm_translate_lmstudio(text, source_lang, target_lang)

    if LLM_BACKEND == "ollama":
        return _llm_translate_ollama(text, source_lang, target_lang)

    return ""
```

## 6.5 fallback 원칙

LM Studio가 실패하면 앱이 멈추면 안 된다.

```txt
1. LM Studio Qwen3.6 번역 시도
2. timeout / empty output / non-Korean output이면 fallback
3. en→ko: Marian/Argos fallback
4. ja→ko: NLLB direct 또는 ja→en→ko bridge fallback
5. 그래도 실패하면 원문을 그대로 표시하되 warning counter 증가
```

---

## 7. Qwen3.6 자막 번역 프롬프트

## 7.1 기본 프롬프트

```txt
System:
You are a professional Korean subtitle translator.
Translate the user's transcript into natural Korean subtitles.
Keep the meaning faithful.
Keep it short, conversational, and readable as subtitles.
Do not explain.
Do not include markdown.
Output only Korean.

User:
Source language: {source_lang}
Target language: Korean
Transcript:
{source_text}
```

## 7.2 영어 오디오용 프롬프트

```txt
System:
You translate English speech transcripts into natural Korean subtitles.
Preserve names, product names, numbers, and technical terms.
Do not summarize unless the sentence is too long for subtitles.
Output only Korean.

User:
{source_text}
```

## 7.3 일본어 오디오용 프롬프트

```txt
System:
You translate Japanese speech transcripts into natural Korean subtitles.
Preserve speaker intent and casual tone.
Convert Japanese expressions into natural Korean, not word-for-word Korean.
Output only Korean.

User:
{source_text}
```

## 7.4 실시간 자막용 출력 규칙

```txt
- 한 번에 1~2문장만 출력
- 불필요한 주어 반복 제거
- 너무 긴 문장은 40자 내외로 압축
- 이름/숫자/전문 용어는 보존
- 감탄사와 fillers는 필요하면 생략
- 절대 설명하지 않기
- 절대 "번역:" 같은 prefix 붙이지 않기
```

---

## 8. 실행 순서

## 8.1 LM Studio 실행

1. LM Studio 실행
2. `qwen/qwen3.6-27b` 다운로드
3. 모델 로드
4. Developer 탭에서 Local Server 시작
5. 서버 주소 확인

```txt
http://127.0.0.1:1234/v1
```

테스트:

```powershell
curl http://127.0.0.1:1234/v1/models
```

정상이라면 model list가 나온다.

## 8.2 local-ai 실행

루트 폴더에서:

```powershell
npm run dev:local-ai
```

또는 직접 실행:

```powershell
cd services/local-ai
.\.venv\Scripts\activate
python main.py
```

확인:

```powershell
curl http://127.0.0.1:8789/health
```

## 8.3 realtime 실행

```powershell
npm run dev:realtime
```

## 8.4 pipeline 실행

```powershell
npm run dev:pipeline
```

## 8.5 web 실행

```powershell
npm run dev:web
```

웹 확인:

```txt
http://localhost:3000/session
http://localhost:3000/history
```

## 8.6 desktop 실행

```powershell
npm run dev:desktop
```

Desktop에서 PC loopback audio capture를 켜고, Web live viewer에서 segment가 표시되는지 확인한다.

---

## 9. 다운로드/캐시 경로 계획

## 9.1 모델 캐시 권장 위치

Windows:

```txt
C:\Users\<USER>\AppData\Roaming\sorisori\models
```

macOS:

```txt
~/Library/Application Support/sorisori/models
```

Linux:

```txt
~/.local/share/sorisori/models
```

## 9.2 faster-whisper 모델

권장 구조:

```txt
models/
└── large-v3-turbo/
    ├── config.json
    ├── model.bin
    ├── tokenizer.json
    └── vocabulary.*
```

## 9.3 LM Studio 모델

LM Studio는 자체 모델 저장소를 관리하므로 SoriSori 폴더 안에 넣지 않는다. 앱에서는 API endpoint만 본다.

```txt
LM Studio manages:
  qwen/qwen3.6-27b
```

SoriSori `.env`는 다음만 알면 된다.

```env
LOCAL_AI_LLM_URL=http://127.0.0.1:1234/v1
LOCAL_AI_LLM_MODEL=qwen/qwen3.6-27b
```

---

## 10. Docker 사용 여부

이번 로컬 AI 플랜에서는 **Docker 사용을 권장하지 않는다**.

이유:

1. Tauri desktop과 Windows WASAPI loopback은 로컬 OS와 직접 연결된다.
2. LM Studio는 보통 host에서 실행된다.
3. GPU/CUDA를 Docker와 연결하면 설정 복잡도가 커진다.
4. 중간과제/데모에서는 로컬 실행이 더 안정적이다.

그래도 Docker를 사용할 경우 LM Studio 주소는 다음처럼 바뀔 수 있다.

```env
LOCAL_AI_LLM_URL=http://host.docker.internal:1234/v1
```

---

## 11. 성능 목표

## 11.1 MVP 목표

| 항목 | 목표 |
|---|---|
| 오디오 chunk 길이 | 1.5초 ~ 3초 |
| STT 처리 시간 | chunk 길이 이하 |
| 번역 처리 시간 | 0.5초 ~ 2초 |
| 전체 자막 지연 | 3초 ~ 6초 |
| 한국어 자막 품질 | 의미 보존 우선 |
| 안정성 | LM Studio 실패 시 fallback으로 계속 표시 |

## 11.2 튜닝 포인트

| 문제 | 조정 |
|---|---|
| STT가 느림 | `WHISPER_COMPUTE_TYPE=int8_float16` 또는 `int8` |
| GPU 메모리 부족 | `WHISPER_DEVICE=cpu`, 더 작은 Whisper model |
| 번역이 느림 | Qwen3.6 27B 대신 35B-A3B 또는 더 작은 Qwen3 계열 |
| 자막이 너무 장황함 | max_tokens 80~128, prompt에 "short subtitle" 강화 |
| 원문이 반복됨 | `condition_on_previous_text=false` 유지 |
| 무음에서 hallucination | VAD on, no_speech_threshold 상향 |
| 일본어가 로마자로 나옴 | Japanese initial prompt 강화 |
| Qwen이 설명을 붙임 | system prompt에 "Output only Korean" 반복 |

---

## 12. 코드 변경 상세 체크리스트

## 12.1 `services/local-ai/main.py`

- [ ] `LOCAL_AI_LLM_BACKEND=lmstudio` 지원
- [ ] LM Studio OpenAI-compatible chat completions 호출 추가
- [ ] `LOCAL_AI_LLM_TEMPERATURE`
- [ ] `LOCAL_AI_LLM_TOP_P`
- [ ] LLM timeout fallback
- [ ] LLM empty output fallback
- [ ] Korean output guard 추가
- [ ] `/health`에 LLM backend 상태 표시
- [ ] `/health`에 whisper model name 표시
- [ ] `/health`에 LM Studio 연결 여부 표시

권장 `/health` 응답 예시:

```json
{
  "ok": true,
  "stt": {
    "backend": "faster-whisper",
    "model": "large-v3-turbo",
    "device": "cuda",
    "compute_type": "float16"
  },
  "translation": {
    "llm_backend": "lmstudio",
    "llm_url": "http://127.0.0.1:1234/v1",
    "llm_model": "qwen/qwen3.6-27b",
    "fallback": "argos/marian/nllb"
  }
}
```

## 12.2 `.env.example`

- [ ] 기본 `WHISPER_MODEL`을 `large-v3-turbo`로 변경
- [ ] LM Studio 관련 env 추가
- [ ] OpenAI/DeepL은 fallback으로 비워둠
- [ ] `LOCAL_AI_URL` 기본값 유지
- [ ] Windows 경로 주석 추가

## 12.3 `README.md`

- [ ] Local AI 실행 방법 추가
- [ ] LM Studio Qwen3.6 다운로드 방법 추가
- [ ] faster-whisper large-v3-turbo 다운로드 방법 추가
- [ ] 5개 서비스 실행 순서 정리
- [ ] 문제 해결 섹션 추가
- [ ] OpenAI/DeepL 없이 실행하는 로컬 모드 강조

## 12.4 `package.json`

현재 루트에는 다음 스크립트가 있다.

```json
{
  "dev:local-ai": "services/local-ai/.venv/Scripts/python services/local-ai/main.py",
  "dev:realtime": "npm run dev -w @sorisori/realtime",
  "dev:pipeline": "npm run dev -w @sorisori/pipeline",
  "dev:web": "npm run dev -w @sorisori/web",
  "dev:desktop": "npm run dev -w @sorisori/desktop"
}
```

Windows 전용 `.venv/Scripts/python` 경로가 들어 있으므로 macOS/Linux 지원을 원하면 별도 스크립트가 필요하다.

권장:

```json
{
  "dev:local-ai:win": "services/local-ai/.venv/Scripts/python services/local-ai/main.py",
  "dev:local-ai:unix": "services/local-ai/.venv/bin/python services/local-ai/main.py"
}
```

## 12.5 `services/realtime`

- [ ] `LOCAL_AI_URL`이 있으면 OpenAI Realtime 대신 local-ai 사용
- [ ] local-ai STT response schema 확인
- [ ] local-ai translate response schema 확인
- [ ] WebSocket segment event가 기존 contract와 맞는지 확인
- [ ] OpenAI/DeepL fallback은 명시적으로 opt-in 처리

## 12.6 `packages/contracts`

- [ ] transcript segment event type 확인
- [ ] language field 추가 필요 여부 확인
- [ ] `sourceText`, `translatedText`, `confidence`, `latencyMs` 등 metadata 정리
- [ ] local-ai health type 추가 가능

## 12.7 `apps/web`

- [ ] live viewer에서 local-ai latency 표시
- [ ] 원문/번역 toggle 추가 가능
- [ ] STT/LLM backend badge 표시
- [ ] "Local mode" 표시
- [ ] 번역 실패 시 fallback badge 표시

## 12.8 `apps/desktop`

- [ ] audio chunk 크기 조절 옵션 확인
- [ ] capture start/stop 안정화
- [ ] session id가 web/pipeline과 일치하는지 확인
- [ ] debug 화면에 local-ai 상태 표시 가능

---

## 13. 테스트 계획

## 13.1 LM Studio 단독 테스트

```powershell
curl http://127.0.0.1:1234/v1/models
```

Chat completion 테스트:

```powershell
curl http://127.0.0.1:1234/v1/chat/completions `
  -H "Content-Type: application/json" `
  -d "{\"model\":\"qwen/qwen3.6-27b\",\"messages\":[{\"role\":\"system\",\"content\":\"Output only Korean.\"},{\"role\":\"user\",\"content\":\"Translate: Hello, how are you?\"}],\"temperature\":0.1,\"max_tokens\":64}"
```

기대 출력:

```txt
안녕하세요, 어떻게 지내세요?
```

## 13.2 faster-whisper 단독 테스트

테스트용 wav 파일을 준비한다.

```powershell
cd services/local-ai
.\.venv\Scripts\activate
python
```

Python REPL:

```py
from faster_whisper import WhisperModel

model = WhisperModel("large-v3-turbo", device="auto", compute_type="float16")
segments, info = model.transcribe("sample.wav", language="en")
print(info.language, info.language_probability)
for s in segments:
    print(s.start, s.end, s.text)
```

이름 인식 실패 시:

```py
model = WhisperModel("h2oai/faster-whisper-large-v3-turbo", device="auto", compute_type="float16")
```

또는 local path:

```py
model = WhisperModel(r"C:\Users\<USER>\AppData\Roaming\sorisori\models\large-v3-turbo", device="auto", compute_type="float16")
```

## 13.3 local-ai 통합 테스트

```powershell
curl http://127.0.0.1:8789/health
```

번역 테스트:

```powershell
curl http://127.0.0.1:8789/translate `
  -H "Content-Type: application/json" `
  -d "{\"text\":\"I think we should deploy this feature tomorrow morning.\",\"source_lang\":\"en\",\"target_lang\":\"ko\"}"
```

기대:

```txt
내일 아침에 이 기능을 배포하는 게 좋겠어요.
```

## 13.4 전체 서비스 테스트

순서:

```powershell
npm run dev:local-ai
npm run dev:realtime
npm run dev:pipeline
npm run dev:web
npm run dev:desktop
```

확인:

1. LM Studio server running
2. local-ai health OK
3. realtime gateway OK
4. pipeline OK
5. web `/session` 접속
6. desktop capture start
7. YouTube 영어/일본어 영상 재생
8. 한국어 자막 표시 확인
9. history에 segment 저장 확인

---

## 14. 품질 평가 기준

## 14.1 STT 품질

| 항목 | 기준 |
|---|---|
| 영어 고유명사 | 핵심 이름이 유지되는가 |
| 일본어 전사 | 히라가나/가타카나/한자가 적절히 나오는가 |
| 반복 hallucination | 무음 구간에서 엉뚱한 문장이 나오지 않는가 |
| 짧은 발화 | 1~2초 발화를 놓치지 않는가 |
| 문장 경계 | 자막 단위로 읽을 만한가 |

## 14.2 번역 품질

| 항목 | 기준 |
|---|---|
| 자연스러움 | 한국어 자막처럼 읽히는가 |
| 충실성 | 원문 의미가 유지되는가 |
| 길이 | 너무 길지 않은가 |
| 용어 보존 | 이름, 숫자, 기술 용어가 유지되는가 |
| 출력 청결도 | 설명/마크다운/prefix가 없는가 |

## 14.3 지연 시간

권장 logging:

```txt
capture_ms
stt_ms
translation_ms
pipeline_ms
end_to_end_ms
```

목표:

```txt
end_to_end_ms <= 6000
```

데모 기준으로는 3~6초 지연이면 허용 가능하다.

---

## 15. 성능별 모델 fallback 계획

## 15.1 고사양 PC

```env
WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=cuda
WHISPER_COMPUTE_TYPE=float16

LOCAL_AI_LLM_MODEL=qwen/qwen3.6-27b
```

또는:

```env
LOCAL_AI_LLM_MODEL=qwen/qwen3.6-35b-a3b
```

## 15.2 중간 사양 PC

```env
WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=auto
WHISPER_COMPUTE_TYPE=int8_float16

LOCAL_AI_LLM_MODEL=qwen/qwen3.6-27b
LOCAL_AI_LLM_NUM_PREDICT=96
```

## 15.3 낮은 사양 PC

```env
WHISPER_MODEL=medium
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8

LOCAL_AI_LLM_MODEL=qwen/qwen3.6-27b
LOCAL_AI_LLM_NUM_PREDICT=64
```

만약 Qwen3.6 자체가 너무 느리면, 데모 안정성 목적으로 작은 Qwen 계열을 fallback으로 둔다.

```env
LOCAL_AI_LLM_MODEL=qwen/qwen3-4b-2507
```

단, 이번 계획의 기본 목표는 Qwen3.6이다.

---

## 16. 문제 해결 가이드

## 16.1 LM Studio 연결 실패

증상:

```txt
Connection refused: http://127.0.0.1:1234/v1
```

확인:

- LM Studio가 실행 중인가?
- Developer server를 켰는가?
- 포트가 1234인가?
- 모델을 실제로 로드했는가?
- 방화벽이 막고 있지 않은가?

테스트:

```powershell
curl http://127.0.0.1:1234/v1/models
```

## 16.2 Whisper 모델 다운로드 실패

확인:

- 인터넷 연결
- Hugging Face 접근 가능 여부
- `MODELS_DIR` 쓰기 권한
- 모델 이름 지원 여부

해결:

```powershell
pip install -U faster-whisper ctranslate2 huggingface_hub
```

또는 local path 다운로드:

```powershell
huggingface-cli download h2oai/faster-whisper-large-v3-turbo `
  --local-dir "$env:APPDATA\sorisori\models\large-v3-turbo"
```

## 16.3 CUDA 오류

증상:

```txt
CUDA failed
cuDNN not found
```

임시 해결:

```env
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8
```

성능은 떨어지지만 데모를 계속 진행할 수 있다.

## 16.4 Qwen3.6이 설명을 붙이는 경우

프롬프트를 강화한다.

```txt
Output only Korean subtitle text.
No explanations.
No markdown.
No prefix.
```

그리고 max token을 줄인다.

```env
LOCAL_AI_LLM_NUM_PREDICT=80
```

## 16.5 번역이 너무 느린 경우

조치 순서:

1. `LOCAL_AI_LLM_NUM_PREDICT=80`
2. `LOCAL_AI_LLM_TIMEOUT_S=3`
3. LM Studio GPU offload 증가
4. `qwen/qwen3.6-35b-a3b` 테스트
5. 더 작은 Qwen fallback
6. LLM 실패 시 Marian/NLLB fallback 허용

## 16.6 무음 구간에서 자막이 생기는 경우

```env
LOCAL_AI_STT_VAD_FILTER=true
LOCAL_AI_STT_NO_SPEECH_THRESHOLD=0.7
LOCAL_AI_STT_LOG_PROB_THRESHOLD=-0.8
```

---

## 17. 구현 우선순위

## Phase 1. 로컬 모델 준비

- [ ] LM Studio 설치
- [ ] Qwen3.6 27B 다운로드
- [ ] LM Studio server 시작
- [ ] `/v1/models` 확인
- [ ] faster-whisper large-v3-turbo 다운로드 또는 자동 다운로드 확인
- [ ] local-ai Python venv 생성
- [ ] requirements 설치

완료 기준:

```txt
LM Studio /v1/models OK
faster-whisper sample.wav transcription OK
```

## Phase 2. local-ai LM Studio adapter 추가

- [ ] `LOCAL_AI_LLM_BACKEND=lmstudio` 추가
- [ ] `/chat/completions` 호출 함수 구현
- [ ] prompt 작성
- [ ] timeout/fallback 처리
- [ ] `/health` 확장

완료 기준:

```txt
POST /translate → Qwen3.6 한국어 번역 반환
LM Studio 종료 시 fallback 번역 반환
```

## Phase 3. realtime과 local-ai 연결 확인

- [ ] `LOCAL_AI_URL`이 있으면 local-ai route 사용
- [ ] OpenAI/DeepL key 없이 실행 확인
- [ ] transcript event schema 확인
- [ ] error log 정리

완료 기준:

```txt
OPENAI_API_KEY와 DEEPL_API_KEY가 비어 있어도 live transcript/translation이 동작
```

## Phase 4. desktop capture와 end-to-end 테스트

- [ ] desktop capture start
- [ ] 영어 영상 재생
- [ ] 일본어 영상 재생
- [ ] web `/session`에서 한국어 자막 표시
- [ ] history 저장 확인

완료 기준:

```txt
PC audio → STT → Qwen3.6 번역 → Web subtitle 표시
```

## Phase 5. 품질 튜닝

- [ ] beam size 조정
- [ ] VAD 설정 조정
- [ ] Qwen prompt 튜닝
- [ ] max token 조정
- [ ] latency logging 추가
- [ ] fallback 통계 확인

완료 기준:

```txt
일반 영어/일본어 영상에서 자막 지연 3~6초 내외
설명문 없는 한국어 자막 출력
```

## Phase 6. 문서화

- [ ] README local AI mode 섹션 추가
- [ ] `.env.example` 업데이트
- [ ] 모델 다운로드 가이드 추가
- [ ] 문제 해결 FAQ 추가
- [ ] 데모 시나리오 작성

완료 기준:

```txt
새 사용자가 PLAN.md와 README만 보고 로컬 실행 가능
```

---

## 18. 최종 파일 변경 예상 목록

```txt
sorisori/
├── PLAN.md                                  # 신규
├── .env.example                             # 수정
├── README.md                                # 수정
├── package.json                             # 선택 수정
├── services/
│   └── local-ai/
│       ├── main.py                          # LM Studio adapter 추가
│       └── requirements.txt                 # openai/httpx 선택 추가
├── services/
│   └── realtime/
│       └── ...                              # local-ai route 확인/수정
├── packages/
│   └── contracts/
│       └── ...                              # 필요 시 latency/backend metadata 타입 추가
└── apps/
    ├── web/
    │   └── ...                              # local mode badge/latency 표시 선택
    └── desktop/
        └── ...                              # debug status 표시 선택
```

---

## 19. 권장 커밋 순서

```txt
commit 1: docs: add local faster-whisper and qwen3.6 plan
commit 2: config: update env example for local ai mode
commit 3: local-ai: add lm studio openai-compatible translation backend
commit 4: local-ai: switch default stt model to large-v3-turbo
commit 5: realtime: prefer local-ai when LOCAL_AI_URL is configured
commit 6: web: show local ai status and latency badges
commit 7: docs: add setup and troubleshooting guide
```

---

## 20. 최종 완료 기준

이 계획은 다음 조건을 만족하면 완료로 본다.

1. LM Studio에서 Qwen3.6이 로드된다.
2. `http://127.0.0.1:1234/v1/models`가 응답한다.
3. `services/local-ai`가 `faster-whisper large-v3-turbo`로 STT를 수행한다.
4. `services/local-ai`가 LM Studio Qwen3.6으로 한국어 자막 번역을 수행한다.
5. OpenAI API key와 DeepL API key 없이 전체 스택이 실행된다.
6. Desktop 앱에서 PC 오디오를 캡처한다.
7. Web 앱 `/session`에서 한국어 자막이 표시된다.
8. LM Studio가 꺼져도 fallback 번역으로 서비스가 완전히 중단되지 않는다.
9. README와 PLAN.md에 설치/실행/문제 해결 방법이 정리되어 있다.

---

## 21. 한 줄 요약

```txt
SoriSori의 로컬 AI 버전은
faster-whisper large-v3-turbo로 음성을 텍스트로 바꾸고,
LM Studio의 Qwen3.6으로 그 텍스트를 자연스러운 한국어 자막으로 바꾸는 구조로 구현한다.
```
