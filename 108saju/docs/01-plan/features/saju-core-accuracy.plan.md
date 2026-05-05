# saju-core-accuracy - Plan Document

> Version: 1.0.0 | Date: 2026-05-05 | Status: Draft
> Level: Starter

---

## Summary

- Problem:
  현재 사주 핵심 계산은 단순 나머지 연산 기반 mock 로직이라 실제 양력/음력 변환과 간지 계산을 반영하지 못한다.
- User impact:
  입력한 날짜가 실제 간지 체계와 가깝게 계산되어야 결과 화면, 상세 분석, 궁합, 캘린더, 타임라인의 신뢰도가 올라간다.
- Constraints:
  현재 프런트엔드 구조를 유지해야 한다.
  네트워크 의존 없이 로컬에서 동작해야 한다.
  MVP 범위를 넘는 전체 명리학 완성본이 아니라 핵심 계산 정확도 개선에 집중한다.

## 1. Overview

### 1.1 Purpose

기존 mock 기반 사주 코어를 실제 음력 변환과 년/월/일 간지 계산을 반영하는 구현으로 교체한다.

### 1.2 Background

이전 PDCA feature에서 앱 골격과 흐름은 완료되었지만, 도메인 코어는 placeholder 성격이 강했다. 다음 단계에서는 가장 영향도가 큰 핵심 계산 부분부터 현실적인 정확도로 끌어올린다.

## 2. Goals

### 2.1 Primary Goals

- [ ] 양력/음력 입력을 실제 변환 가능한 로직으로 처리한다.
- [ ] 년주, 월주, 일주를 실제 간지 계산 결과로 생성한다.
- [ ] 시주는 일간과 출생 시각을 기준으로 계산한다.
- [ ] 기존 결과/분석 화면이 새 계산 코어를 그대로 사용하도록 연결한다.

### 2.2 Non-Goals

- 절기 기반 고급 월주 보정의 완전 구현
- 신살, 십성, 대운의 전문 명리 규칙 완성
- 인증, 결제, 저장소 기능 확장

## 3. Scope

### 3.1 In Scope

- `korean-lunar-calendar` 도입
- 사주 계산 유틸 재구성
- 시주 계산 로직 추가
- 오행 계산 입력 소스 개선
- 결과/분석 흐름과 회귀 검증

### 3.2 Out of Scope

- 전문가용 만세력 전체 재현
- 윤달 선택 UI 추가
- 프로덕션 백엔드 이전

## 4. Success Criteria

- [ ] `calculatePillars`가 실제 양력/음력 변환 결과를 사용한다.
- [ ] 년/월/일주는 라이브러리 gapja 결과를 기반으로 생성된다.
- [ ] 시주는 입력된 출생 시각 기준으로 계산된다.
- [ ] 기존 결과 페이지에서 새 계산값이 정상 표시된다.
- [ ] `npm run lint`와 `npm run build`가 통과한다.

## 5. Verification

- 대표 날짜 샘플에 대해 간지 문자열 생성 확인
- 양력/음력 입력 각각의 흐름 확인
- 결과 페이지 회귀 확인
- lint/build 실행

## 6. Schedule

| Phase | Target Date | Status |
|-------|------------|--------|
| Plan | 2026-05-05 | In Progress |
| Design | TBD | Pending |
| Implementation | TBD | Pending |
| Review | TBD | Pending |

## 7. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 라이브러리 값과 시주 계산 규칙 연결이 어긋남 | High | Medium | 년/월/일은 라이브러리, 시주는 별도 순수 함수로 분리 |
| 음력 입력에서 윤달 미지원으로 일부 케이스가 틀릴 수 있음 | Medium | Medium | 현재 UI에서는 일반 음력만 우선 지원하고 제약을 문서화 |
| 결과 텍스트가 새 계산값과 어색하게 섞일 수 있음 | Medium | Low | 기존 mock analysis가 새 pillars를 그대로 소비하도록 유지 |

## 8. References

- [saju-ai-mvp-foundation.report.md](F:/03llm/108saju/docs/04-report/saju-ai-mvp-foundation.report.md)
- `korean-lunar-calendar` npm readme
