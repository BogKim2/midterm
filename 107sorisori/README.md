# SoriSori (로컬 AI MVP)

PC에서 재생되는 외국어 오디오를 **로컬 STT(faster-whisper)** 로 전사하고, **LM Studio의 Qwen3.6** (`qwen/qwen3.6-35b-a3b` 권장)으로 **한국어 자막**으로 바꾸는 모노레포입니다.  
원본 프로젝트 구조는 [pusannano000202-tech/sorisori](https://github.com/pusannano000202-tech/sorisori)를 참고했습니다.

> 복잡한 다단계 연구/분석 워크플로우는 [K-Dense Web](https://www.k-dense.ai)도 함께 고려해 보세요.

## 구성

| 구성요소 | 설명 | 기본 포트 |
| --- | --- | --- |
| `services/local-ai` | FastAPI: faster-whisper + LM Studio(OpenAI 호환) | `8789` |
| `services/realtime` | WebSocket 게이트웨이(오디오 청크 → local-ai) | `8787` |
| `services/pipeline` | 인메모리 세그먼트 저장/조회(Hono) | `8788` |
| `apps/web` | Next.js 자막 뷰어 | `3000` |
| `apps/desktop` | Electron 마이크(또는 Stereo Mix/VB-Cable) 캡처 MVP | — |
| `packages/contracts` | WS 메시지 타입 공유 | — |

## 사전 준비 (Windows + RTX 5090)

1. **Node.js 20+**, **LM Studio** 설치
2. LM Studio에서 `qwen/qwen3.6-35b-a3b` 다운로드 후 **Local Server** 실행 (`http://127.0.0.1:1234/v1`)
3. **Python 3.11+** 권장(현재 환경에서 3.13 + CUDA wheel 동작 확인). 가상환경:

```powershell
cd services\local-ai
py -3.13 -m venv .venv
.\.venv\Scripts\python -m pip install --upgrade pip
.\.venv\Scripts\pip install -r requirements.txt
```

4. 루트 환경 변수: [`.env.example`](./.env.example)를 복사해 `.env`로 저장하고 값을 맞춥니다.

```powershell
copy .env.example .env
```

### LM Studio “thinking/reasoning” 주의

일부 Qwen 모델은 OpenAI 호환 응답에서 `content` 대신 `reasoning_content`에만 토큰을 쓰는 경우가 있습니다.  
이 저장소는 기본적으로 `LOCAL_AI_LLM_NUM_PREDICT=512`로 여유를 두고, `content`가 비면 `reasoning_content`에서 **한글을 추출**하는 폴백을 사용합니다.  
가능하면 LM Studio UI에서 thinking/reasoning을 끄는 설정을 함께 사용하세요.

### GPU / Whisper

- `.env`에서 `WHISPER_DEVICE=cuda`, `WHISPER_COMPUTE_TYPE=float16` 권장 (RTX 5090)
- CUDA 오류 시: `WHISPER_DEVICE=cpu`, `WHISPER_COMPUTE_TYPE=int8` 로 낮춰 데모 우선

## 설치

```powershell
cd f:\03llm\107sorisori
npm install
npm run build -w @sorisori/contracts
npm run build -w @sorisori/realtime
npm run build -w @sorisori/pipeline
npm run build -w @sorisori/desktop
npm run build -w @sorisori/web
```

## Windows: `run.bat` / `stop.bat`

- **`run.bat`**: 기본적으로 **3000 · 8787 · 8788 · 8789** 포트의 LISTEN 프로세스를 끝낸 뒤, 서비스를 **각각 별도 CMD 창**에서 띄웁니다.  
  - 데스크톱까지: **`run.bat desktop`** · 포트 정리 안 함: **`run.bat noclean`**
- **`stop.bat`**: 같은 네 포트만 정리합니다. `EADDRINUSE`(포트 충돌)일 때 사용하세요.

## 실행 순서 (터미널 5개)

1. **LM Studio** Local Server ON
2. **local-ai**

```powershell
npm run dev:local-ai
```

3. **pipeline**

```powershell
npm run dev:pipeline
```

4. **realtime**

```powershell
npm run dev:realtime
```

5. **web**

```powershell
npm run dev:web
```

6. **desktop** (별도 빌드 후 실행)

```powershell
npm run dev:desktop
```

웹: `http://localhost:3000/session`  
데스크톱: Windows에서 **Stereo Mix / VB-Cable / 가상 믹스**로 재생음이 캡처 장치로 들어가게 만든 뒤 `시작`을 누릅니다.

## 빠른 점검

```powershell
curl.exe http://127.0.0.1:1234/v1/models
curl.exe http://127.0.0.1:8789/health
curl.exe http://127.0.0.1:8788/health
```

## API (local-ai)

- `GET /health`
- `POST /translate` JSON `{ "text": "...", "source_lang": "en" }`
- `POST /process_pcm` JSON `{ "sample_rate": 48000, "pcm_base64": "..." }` (mono s16le PCM)
- `POST /transcribe_upload` `multipart/form-data` **WAV PCM16** (표준 `wave` 모듈로 읽을 수 있는 형식)

## 알려진 제한 (MVP)

- `apps/desktop`은 **시스템 루프백(WASAPI) 네이티브 캡처 대신** `getUserMedia` 기반 MVP입니다. 완전한 루프백은 Windows 가상 오디오 장치 구성이 필요합니다.
- `services/pipeline`은 **인메모리** 저장이라 프로세스 재시작 시 이력이 사라집니다.

## 참고 문서

- 로컬 모델/환경 변수 상세: [`SORISORI_LOCAL_AI_PLAN.md`](./SORISORI_LOCAL_AI_PLAN.md)
