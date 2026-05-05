# saju-core-accuracy - Design Document (Starter)

> Version: 1.0.0 | Date: 2026-05-05 | Status: Draft
> Level: Starter | Plan: docs/01-plan/features/saju-core-accuracy.plan.md

---

## 1. Overview

This feature replaces the placeholder saju core with a more realistic calculation path. It keeps the existing UI and state flow intact while swapping the internals of pillar calculation from simple modulo math to real solar/lunar conversion and gapja-based year, month, and day pillar generation.

## 2. Approaches

### 2.1 Keep Internal Mock Math

- Complexity:
  Low
- Risk:
  High domain inaccuracy
- Change surface:
  Small
- Decision:
  Rejected. It does not materially improve correctness.

### 2.2 Library for Full Saju + Custom UI

- Complexity:
  Medium to high
- Risk:
  Dependency lock-in and harder debugging
- Change surface:
  Medium
- Decision:
  Not chosen for this iteration because only the core date and pillar accuracy needs improvement.

### 2.3 Pragmatic Default

- Complexity:
  Medium
- Risk:
  Limited by library coverage and current UI inputs
- Change surface:
  Small to medium
- Decision:
  Selected. Use `korean-lunar-calendar` for solar/lunar conversion and gapja indices, then compute the hour pillar in local code.

## 3. Page Structure

No new pages are required. Existing pages consume the improved calculation layer:

- `/input`
  Keeps the same input contract
- `/result`
  Shows improved pillar values
- `/analysis`
  Uses the improved analysis source
- `/compatibility`
  Inherits improved mock-analysis inputs automatically

## 4. Design

### 4.1 Calculation Boundaries

- `lib/saju/pillars.ts`
  Main entry for pillar calculation
- `lib/saju/calendar.ts`
  Thin wrapper around `korean-lunar-calendar`
- `lib/saju/mockAnalysis.ts`
  Keeps current text generation but consumes improved pillars

### 4.2 Data Flow

1. Receive `SajuInput`
2. Convert input date using solar or lunar path
3. Read gapja indices from the calendar library
4. Convert indices into `Ganji`
5. Compute hour branch from birth hour
6. Compute hour stem from day stem group and hour branch index
7. Return `SajuPillars`

### 4.3 Hour Pillar Rule

- Hour branch is derived from the 12 traditional two-hour windows
- Hour stem is derived from the day stem group base:
  - 甲/己 -> 甲 at 子時
  - 乙/庚 -> 丙 at 子時
  - 丙/辛 -> 戊 at 子時
  - 丁/壬 -> 庚 at 子時
  - 戊/癸 -> 壬 at 子時
- Then advance one stem per branch

## 5. Components

No new UI components are required.

Updated code modules:

- `src/lib/saju/calendar.ts`
- `src/lib/saju/pillars.ts`
- `src/lib/saju/mockAnalysis.ts`
- Any affected consumers if types or behavior change

## 6. Implementation Order

1. Add calendar wrapper and dependency integration
2. Replace pillar math with gapja-index based logic
3. Add hour pillar calculation
4. Validate result flow and dependent pages
5. Run lint and build

## 7. Verification Plan

- Known sample from package readme
  - Solar `2017-06-24` -> `丁酉年 丙午月 壬午日`
  - Lunar `1956-01-21` -> Solar `1956-03-03`, `丙申年 庚寅月 己巳日`
- Result page still renders pillars
- Compatibility page still computes
- `npm run lint`
- `npm run build`

## 8. Learning Points

- Separate domain accuracy work from UI work
- Use library indices instead of parsing formatted strings when possible
- Keep one boundary for external calendar logic and one boundary for local hour-pillar rules
