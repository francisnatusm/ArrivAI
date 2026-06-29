# ArrivAI

AI-powered platform helping migrants find the best Korean city for jobs and integration — **IRS scoring**, **interactive map**, and **Claude assistant**.

## Features

- **Integration Readiness Score (IRS)** — 79 Korean cities scored from your profile
- **Profile-driven scoring** — skill, Korean level, country of origin, and target city all affect results
- **3D satellite map** — MapLibre with IRS markers per city
- **AI chat assistant** — Claude-powered guide with your profile context
- **Job listings** — Saramin scrape (Bright Data) with mock fallback
- **World region mapping** — any country of origin maps to diaspora regions for scoring

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React, Vite, Tailwind CSS, MapLibre GL |
| Backend | Node.js, Express |
| AI | Anthropic Claude API |
| Data | Firebase Firestore (optional cache) |
| Deploy | Vercel (API + frontend) |

## Project structure

```
ArrivAI/
├── api/              # Vercel serverless entry
├── frontend/         # React app (Vite)
├── lib/              # Shared scoring logic (cities, skills, regions)
├── server.js         # Express API
└── vercel.json       # API deployment config
```

## Local development

### Prerequisites

- Node.js 18+
- API keys in `.env` (copy from `.env.example`)

### 1. Backend (port 3001)

```powershell
cd ArrivAI
npm install
copy .env.example .env   # then fill in secrets
npm run start
```

### 2. Frontend (port 5173)

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend proxies `/api` to `localhost:3001`.

### Useful commands

```powershell
npm run restart   # restart API (Windows)
npm run stop      # free port 3001
```

## Environment variables

### API (`.env` at repo root)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (chat) | Claude API key |
| `ANTHROPIC_MODEL` | No | Default `claude-sonnet-4-6` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | No | Local path to Firebase JSON |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | No | Inline JSON (use on Vercel) |
| `BRIGHTDATA_API_TOKEN` | No | Saramin job scraping |
| `ANTHROPIC_INSECURE_SSL` | No | Dev only — local SSL workaround |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_MAPTILER_KEY` | No | MapTiler satellite/terrain tiles |
| `VITE_API_BASE_URL` | No | Leave empty locally (uses Vite proxy) |

**Never commit `.env` or `firebase-service-account.json`.**

## Deploy to Vercel

Use **two Vercel projects** from this repo:

| Project | Root directory | Purpose |
|---------|----------------|---------|
| API | `.` | Express serverless + cron |
| Frontend | `frontend` | Static Vite build |

1. Import [github.com/francisnatusm/ArrivAI](https://github.com/francisnatusm/ArrivAI) on Vercel
2. Deploy API first — set `ANTHROPIC_API_KEY` in Vercel env vars
3. Update `frontend/vercel.json` with your API URL if needed
4. Deploy frontend with root `frontend`

## IRS formula (summary)

Scores combine job demand, cost of living, Korean language fit, diaspora community fit, and market trend — weighted per city and personalized by skill + origin.

## License

Private / portfolio project — see repository owner for usage terms.
