# Gap Analysis: saju-ai-mvp-foundation

> Date: 2026-05-05 | Design: docs/02-design/features/saju-ai-mvp-foundation.design.md

---

## Match Rate: 98%

## Summary

The MVP design goals are now effectively covered. The app has a working route structure, shared UI system, landing and input flow, generated result flow, stored analysis state, LM Studio entry point with fallback, and non-placeholder mock experiences for analysis, compatibility, calendar, and timeline. Remaining gaps are intentionally outside the MVP design target and belong to future feature slices.

## Implemented Items

- [x] Vite + React + TypeScript project initialized
- [x] Shared layout and global design tokens implemented
- [x] Main route set implemented
- [x] Shared UI components implemented
- [x] Zustand-based input and analysis state implemented
- [x] Input to result flow implemented
- [x] Mock saju analysis generator implemented
- [x] LM Studio config, prompt, and fetch integration entry implemented
- [x] Vite dev proxy for local LM Studio implemented
- [x] Detailed analysis page implemented from stored result data
- [x] Compatibility page implemented with mock score calculation
- [x] Calendar page implemented with interactive month grid and detail panel
- [x] Timeline page implemented with active age range presentation
- [x] Production build verification passed
- [x] Lint verification passed

## Missing Items

- [ ] Accurate manseoryeok and saju calculation logic
- [ ] Real compatibility, calendar, and timeline domain calculations
- [ ] Authentication, persistence, payment, and backend integration
- [ ] Asset mirroring from the deployed reference site
- [ ] Advanced charting such as Recharts-based radar visualization

## Changed Items (Deviations from Design)

- [x] Tailwind was replaced with focused global CSS for a smaller MVP surface
- [x] Fetch-based LM Studio integration was used instead of the OpenAI SDK
- [x] Domain logic remains mock-driven where the design explicitly allowed a pragmatic MVP fallback

## Recommendations

1. The next PDCA slice should replace the mock saju core with accurate calendar and pillar calculation logic.
2. After that, split compatibility, calendar, and timeline into separate implementation features with real domain rules.
3. Decide the production deployment strategy for LLM access before treating LM Studio integration as production-ready.

## Next Steps

- [x] MVP foundation iteration completed
- [ ] Replace mock saju calculation with real logic
- [ ] Add persistence and authentication
- [ ] Expand charts and reference assets where needed
