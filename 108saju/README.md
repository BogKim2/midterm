# 108saju

AI-based saju web app built with React, TypeScript, and Vite.

## Stack

- React
- TypeScript
- Vite
- Framer Motion
- Zustand
- `korean-lunar-calendar`
- LM Studio compatible local API

## Features

- Landing page and app shell
- Saju input and result flow
- Detailed analysis page
- Compatibility mock flow
- Fortune calendar mock flow
- Timeline mock flow
- Local LM Studio integration entry
- Solar/lunar conversion and gapja-based pillar calculation

## Run

```powershell
npm install
npm run dev
```

Default local app:

- `http://127.0.0.1:5173`

If you want LM Studio integration, prepare environment variables based on `.env.example`.

## Verify

```powershell
npm run lint
npm run build
```

## Structure

- `src/` application code
- `public/` static files
- `docs/` PDCA planning, design, analysis, and report documents
- `plan.md` original implementation plan
