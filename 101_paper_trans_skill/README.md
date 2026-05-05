# 101_paper_trans_skill — 영문 학술논문 → 한글 Word 변환 스킬

영문 학술논문 PDF를 입력받아 **그림·표·참고문헌이 포함된 한글 번역본 Word(.docx)** 를 자동 생성하는 Claude Code 스킬 및 예제 프로젝트입니다.

## 개요

| 항목 | 내용 |
|---|---|
| 입력 | 영문 학술논문 PDF |
| 출력 | 한글 번역본 `.docx` (그림·표·참고문헌 포함) |
| 주요 도구 | PyMuPDF (fitz), docx (npm), Claude Code |
| 대상 논문 형식 | ACL / NeurIPS / EACL / 저널 논문 등 표준 학술 레이아웃 |

## 디렉터리 구조

```
101_paper_trans_skill/
├── input/                      # 원본 PDF
├── work/                       # 중간 산출물
│   ├── build_helpers.js        # docx 헬퍼 함수 (P, H1, Img, HCell, Ref, ...)
│   ├── build_main.js           # KCL 논문 빌드 스크립트
│   ├── build_nf.js             # 나노유체 논문 빌드 스크립트
│   ├── fix_nf_figures.py       # ImageMask 반전 수정 스크립트
│   ├── extract_figures.py      # PDF 페이지 클립 방식 그림 추출
│   ├── extract_nf_figures.py   # 내장 이미지 직접 추출
│   ├── extract_text.py         # 전체 텍스트 추출
│   ├── references.json         # 정제된 참고문헌 JSON
│   └── figure*.png / nf_figure*.png  # 추출된 그림들
├── output/                     # 최종 산출물
│   ├── KCL_paper_korean.docx
│   └── nanofluid_paper_korean.docx
└── .claude/skills/paper_trans_en_to_kr/
    └── SKILL.md                # Claude Code 스킬 정의 (워크플로우 + 이슈 해결 모음)
```

## 번역 대상 논문

### 1. KCL 논문
**"KCL-MCQA: A Korean Criminal Law Multiple-Choice Question-Answering Benchmark"**

- 페이지: 12페이지 (ACL 형식)
- 그림: 3개 (개요 박스, 히트맵, 히스토그램)
- 표: 3개 (데이터셋 통계, 모델 비교 30+개, 에세이 평가)
- 부록: 5개 (A~E, 평가 지침 박스)
- 참고문헌: 51개

### 2. 나노유체 논문
**"A New Parameter to Control Heat Transport in Nanofluids: Surface Charge State of the Particle in Suspension"**

- 페이지: 6페이지 (저널 논문, 2컬럼)
- 그림: 11개 (ζ 전위 측정, 상관관계 그래프 등)
- 수식: 8개 (전기이중층, DLVO 이론 등)
- 표: 1개 (ζ 전위 매개변수)
- 참고문헌: 23개

## 워크플로우 요약

```
1. PDF 페이지 렌더링 → 그림 위치 시각 확인 (120 DPI)
2. 그림 추출
   - 방법 A: page.get_pixmap(clip=rect)  ← 페이지 클립 (KCL 논문)
   - 방법 B: page.get_images() + fitz.Pixmap(doc, xref)  ← 내장 이미지 (나노유체)
3. 본문 번역 (학술체, 한글 헤더, 원어 병기)
4. build_helpers.js + build_main.js 로 docx 조립
5. node build_main.js → output.docx
```

## 주요 이슈 해결 사례

SKILL.md에 상세 코드 예제와 함께 수록됨.

| # | 이슈 | 해결 |
|---|---|---|
| 9 | colspan 사용 시 빈 5번째 열 생성 | colspan:2 뒤 추가 빈 셀 제거 |
| 10 | rowSpan이 페이지 경계에서 헤더만 분리 | GroupCell 대신 isFirst 행에 독립 셀 사용 |
| 11 | ImageMask 이미지가 검은 배경으로 추출 | PIL `ImageOps.invert()` 로 반전 (pix.invert_irect()는 stencil에서 무시됨) |

### 이슈 #11 상세: ImageMask 검은 배경

PDF의 `/ImageMask true` 이미지는 CCITTFax 인코딩에서 비트 0=흰색(배경), 비트 1=검정(잉크)으로 저장되지만, `fitz.Pixmap(doc, xref)`로 추출하면 픽셀 값이 반전되어 배경이 검정으로 나온다.

```python
from PIL import Image, ImageOps

pix = fitz.Pixmap(doc, xref)
pix.save(fname)

obj_str = doc.xref_object(xref)
if 'ImageMask true' in obj_str:
    img = Image.open(fname)
    ImageOps.invert(img.convert('L')).save(fname)  # 흰 배경으로 복원
```

## 환경 설정

```bash
# Python 의존성
pip install PyMuPDF Pillow

# Node.js 의존성
npm install docx
```

## 출력 예시

| 논문 | 출력 파일 | 크기 |
|---|---|---|
| KCL (12p, 51 refs) | `KCL_paper_korean.docx` | 545 KB |
| 나노유체 (6p, 23 refs) | `nanofluid_paper_korean.docx` | 319 KB |

## 스킬 상세 문서

Claude Code 스킬 정의 파일: `.claude/skills/paper_trans_en_to_kr/SKILL.md`

- 단계별 워크플로우 (Step 0~5)
- 헬퍼 함수 전체 코드 (`build_helpers.js`)
- 번역 방침 (학술체, 용어 처리, 참고문헌)
- 자주 발생하는 이슈 11개 및 해결 코드

---

*Claude Code `paper_trans_en_to_kr` 스킬을 사용하여 생성됨.*
