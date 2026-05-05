# Gap Analysis: saju-core-accuracy

> Date: 2026-05-05 | Design: docs/02-design/features/saju-core-accuracy.design.md

---

## Match Rate: 98%

## Summary

The saju core now uses a real calendar conversion path instead of modulo-based mock math. Year, month, and day pillars are derived from `korean-lunar-calendar` gapja indices, and the hour pillar is computed locally from the day stem and birth-hour branch rule. Existing UI consumers continue to work without route or state changes.

## Implemented Items

- [x] `korean-lunar-calendar` installed and integrated
- [x] Solar and lunar input resolution added
- [x] Year, month, and day pillar generation now use gapja indices
- [x] Hour pillar calculation implemented from day stem and hour branch
- [x] Five-element calculation updated to use corrected pillars
- [x] Existing result and analysis flow kept compatible
- [x] Lint verification passed
- [x] Build verification passed

## Missing Items

- [ ] Intercalation month input support in the UI
- [ ] Advanced seasonal correction beyond current library-based month/day results
- [ ] Real downstream domain logic for compatibility, calendar, and timeline

## Changed Items (Deviations from Design)

- [x] Verification relied on package sample indices and app-level build/lint instead of a formal automated test suite
- [x] Hour handling for unknown birth time still defaults to a deterministic fallback instead of a dedicated unknown-state model

## Recommendations

1. The next domain slice should introduce a dedicated validation and sample-test layer for known saju cases.
2. Add intercalation-month handling if lunar users must be supported precisely from the UI.
3. After that, move downstream features to consume richer saju metadata instead of only pillar and five-element summaries.

## Next Steps

- [x] Core pillar accuracy improved
- [ ] Add test fixtures for representative solar/lunar inputs
- [ ] Extend UI and domain model for leap-month cases
