# Completion Report: saju-core-accuracy

> Date: 2026-05-05 | Level: Starter

---

## 1. Summary

### 1.1 Feature Overview

Replaced the previous mock saju core with a library-backed calculation flow. The application now resolves solar or lunar input dates through `korean-lunar-calendar`, derives year/month/day pillars from gapja indices, and computes the hour pillar locally from the day stem and hour branch.

### 1.2 Final Match Rate

98% (Target: 90%)

## 2. Completed Items

- [x] Plan and design documents created
- [x] Calendar conversion dependency integrated
- [x] Real gapja-index based pillar calculation implemented
- [x] Hour pillar logic implemented
- [x] Existing analysis flow kept compatible
- [x] Lint and build verification passed

## 3. Deviations from Design

- A dedicated automated fixture suite was not added in this slice; verification was done through package samples, lint, and build.
- Leap-month input handling remains fixed to non-intercalation because the current UI does not expose that choice.

## 4. Metrics

| Metric | Value |
|--------|-------|
| Match Rate | 98% |
| PDCA Iterations | 1 |
| Dependency Added | 1 |
| Verification | `npm run lint`, `npm run build` |

## 5. Learnings

1. Using gapja indices is more robust than parsing formatted strings from the calendar library.
2. Splitting year/month/day calculation from hour-pillar logic keeps the external dependency boundary clean.
3. Accuracy improvements can be delivered without touching route or UI structure if the domain core boundary is well isolated.

## 6. Follow-up Items

- [ ] Add fixture-based verification for known dates
- [ ] Add leap-month UI support for lunar input
- [ ] Propagate richer saju metadata into compatibility, calendar, and timeline logic
