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

**Never commit `.env` or `firebase-service-account.json`.** Use `.env.example` as a template only.

---

## API keys & external services (for reviewers)

Each integration is **optional except Anthropic** (chat). The app degrades gracefully when a key is missing.

### Data flow overview

```
User profile  →  IRS scoring (local logic, no API key)
City panel jobs →  Firestore cache? → Bright Data → Saramin HTML → parse
                →  else mock listings
Chat message    →  Anthropic Claude API (profile injected in system prompt)
Map tiles       →  MapTiler (optional) or free Esri satellite fallback
Sessions/jobs   →  Firestore cache (optional)
Daily cron      →  POST /api/cron/refresh (re-scrapes sample skills via Bright Data)
```

---

### `ANTHROPIC_API_KEY` — Claude chat assistant

| | |
|---|---|
| **Provider** | [Anthropic](https://console.anthropic.com/) |
| **Used in** | `server.js` → `POST /api/chat` |
| **Purpose** | Powers the **ArrivAI Assistant** sidebar. Sends the user message to Claude with a system prompt that includes their skill, Korean level, origin, IRS, and target city. |
| **Required?** | **Yes** for live chat. Without it, the API returns a fallback message telling the user to configure the key. |
| **Related** | `ANTHROPIC_MODEL` (default `claude-sonnet-4-6`) |

---

### `BRIGHTDATA_API_TOKEN` — Saramin job scraping (Web Unlocker)

| | |
|---|---|
| **Provider** | [Bright Data](https://brightdata.com/) — **Web Unlocker API** |
| **Used in** | `lib/scraper.js` → `scrapeJobsFromSaramin()` |
| **Called from** | `server.js` → `GET /api/jobs/:city/:skill` and daily `POST /api/cron/refresh` |
| **Purpose** | Fetches **real job listings** from **Saramin** (Korea's major job board). Saramin blocks simple server-side HTTP requests; Bright Data acts as a proxy that returns the raw HTML so we can parse job titles and companies. |
| **How it works** | 1. Build Saramin search URL with skill keyword + city location code (`loc_cd` from `lib/cities.js`).<br>2. `POST https://api.brightdata.com/request` with zone `web_unlocker1`, target URL, format `raw`.<br>3. Parse HTML in `parseJobListings()` for `.job_tit` / `.corp_name` CSS classes.<br>4. Return up to 5 jobs to the frontend `JobListings` component. |
| **Required?** | **No.** If missing or scrape fails, the API falls back to **mock listings** (same UI, placeholder company names). IRS scoring does **not** depend on this key. |
| **Caching** | Successful scrapes are stored in Firestore (`jobs` collection) when Firebase is configured, to reduce Bright Data usage. |
| **Cost note** | Bright Data is a paid proxy service; use for demos/production job data, not required for core IRS/map/chat features. |

**Example Saramin URL scraped:**
`https://www.saramin.co.kr/zf_user/search/recruit?searchword=software+engineering&loc_cd=101000`

---

### `FIREBASE_SERVICE_ACCOUNT_PATH` / `FIREBASE_SERVICE_ACCOUNT_JSON` — Firestore cache

| | |
|---|---|
| **Provider** | [Firebase / Firestore](https://firebase.google.com/) |
| **Used in** | `lib/firestore.js` |
| **Purpose** | Optional persistence layer for three things: |
| | 1. **Job cache** — scraped Saramin results per city+skill (48h TTL) |
| | 2. **Session store** — user profile + city scores after `/api/profile` |
| | 3. **City metrics cache** — IRS breakdown per city for analytics |
| **Required?** | **No.** In-memory sessions work locally; without Firebase, jobs skip cache and sessions are not persisted across serverless cold starts (chat still works because the frontend sends full profile in each request). |
| **Local vs Vercel** | Local: path to `firebase-service-account.json`. Vercel: paste minified JSON into `FIREBASE_SERVICE_ACCOUNT_JSON`. |

---

### `VITE_MAPTILER_KEY` — Map tiles & terrain (frontend only)

| | |
|---|---|
| **Provider** | [MapTiler](https://www.maptiler.com/) |
| **Used in** | `frontend/src/components/KoreaMap.jsx` |
| **Purpose** | Upgrades the map from free **Esri satellite** tiles to **MapTiler hybrid** satellite + optional **3D terrain** (hills). |
| **Required?** | **No.** Without it, the map still works using Esri imagery and 3D tilt. |

---

### Other variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_MODEL` | Override Claude model ID (default `claude-sonnet-4-6`). |
| `ANTHROPIC_INSECURE_SSL` | **Local dev only** — bypasses TLS verification if your network blocks Anthropic API. Never set on Vercel. |
| `VITE_API_BASE_URL` | Production frontend API base URL. Leave empty when using Vercel rewrite proxy in `frontend/vercel.json`. |
| `PORT` | Local API port (default `3001`). |

---

### Quick reference table

| Variable | Layer | Required | If missing |
|----------|-------|----------|------------|
| `ANTHROPIC_API_KEY` | API | For chat | Chat shows fallback / error |
| `BRIGHTDATA_API_TOKEN` | API | No | Mock job listings shown |
| `FIREBASE_SERVICE_ACCOUNT_*` | API | No | No cache; sessions ephemeral on Vercel |
| `VITE_MAPTILER_KEY` | Frontend | No | Esri satellite map (still works) |

---

### API (`.env` at repo root) — copy template

See `.env.example` for the full list. Minimum for a full demo: **`ANTHROPIC_API_KEY`**. Add **Bright Data** when you want real Saramin jobs for mentors to verify live scraping.

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_MAPTILER_KEY` | No | MapTiler satellite/terrain tiles |
| `VITE_API_BASE_URL` | No | Leave empty locally (uses Vite proxy) |

---

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
