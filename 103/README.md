# Smart Document Analyzer

로컬 텍스트 문서를 분석하는 `PySide6` 데스크톱 앱입니다. 규칙 기반 분석으로 통계, 키워드, 감성, 가독성을 계산하고, 선택적으로 `LM Studio`의 로컬 `qwen3.6` 모델을 호출해 요약과 톤 해석을 보강합니다.

## 기능

- `.txt`, `.md` 파일 열기
- 텍스트 직접 입력
- 기본 통계, 키워드, 문장 길이 분포
- 워드클라우드 생성
- 영어 가독성 점수
- JSON 저장, PNG 저장
- `LM Studio` 연동 실패 시 규칙 기반 분석만으로 fallback

## 실행

```powershell
$env:UV_CACHE_DIR = "$PWD\\.uv-cache"
uv sync
uv run python -m smart_doc_analyzer
```

윈도우에서는 그냥 [run.bat](/F:/03llm/103smart_analyzer/run.bat)를 실행해도 됩니다. 이 스크립트는 `uv sync`, `LM Studio` 모델 확인, 테스트 실행, 앱 실행까지 한 번에 처리합니다.

## LM Studio 설정

1. `LM Studio`를 실행합니다.
2. `qwen3.6` 모델을 로드합니다.
3. 로컬 서버를 활성화합니다.
4. 앱의 `File > Settings`에서 endpoint와 모델명을 확인합니다.

기본 endpoint는 `http://127.0.0.1:1234/v1` 입니다.

## 테스트

```powershell
$env:UV_CACHE_DIR = "$PWD\\.uv-cache"
uv run pytest
```

## 패키징

추후 `PyInstaller` 스펙 파일을 추가하면 Windows EXE로 패키징할 수 있습니다.
