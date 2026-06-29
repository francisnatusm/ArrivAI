# ArrivAI

---

ArrivAI is a migrant economic integration platform for South Korea. It combines IRS city scoring across 79 locations, a 3D satellite map, real Saramin job data via Bright Data, and a Claude-powered assistant — so migrants can compare cities by skill, language level, and country of origin before they arrive.

[Live Demo](https://arriv-ai-web.vercel.app) · [Repository](https://github.com/francisnatusm/ArrivAI)

<!-- API: https://arriv-ai.vercel.app -->

## Install as an app (PC & mobile)

ArrivAI is a **Progressive Web App (PWA)** — you can install it on your phone or computer and open it like a native app (no app store required).

| Platform | How to install |
|----------|----------------|
| **Live site** | Open [arriv-ai-web.vercel.app](https://arriv-ai-web.vercel.app) and tap **Install app** in the header |
| **iPhone / iPad** | Safari → **Share** → **Add to Home Screen** |
| **Android** | Chrome menu (⋮) → **Install app** or **Add to Home screen** |
| **Windows / Mac** | Chrome or Edge → install icon in the address bar, or menu → **Install ArrivAI** |

After install, ArrivAI appears on your home screen or desktop and runs in full-screen without the browser toolbar.

## Features

- **Installable PWA** — add to home screen on mobile or install on desktop (Chrome, Edge, Safari)
- **Integration Readiness Score (IRS)** — 79 Korean cities scored from your profile
- **Profile-driven scoring** — skill, Korean level, country of origin, and target city all affect results
- **3D satellite map** — MapLibre with IRS markers per city
- **AI chat assistant** — Claude-powered guide with your profile context
- **Job listings** — Saramin scrape via Bright Data
- **World region mapping** — any country of origin maps to diaspora regions for scoring

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React, Vite, Tailwind CSS, MapLibre GL |
| Backend | Node.js, Express |
| AI | Anthropic Claude API |
| Data | Firebase Firestore (cache) |
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

## Environment variables

**Never commit `.env` or `firebase-service-account.json`.** Use `.env.example` as a template only.

---

## API keys & external services (for reviewers)

External services integrated in this project and how they are used in the codebase.

### Data flow overview

```
User profile  →  IRS scoring (local logic)
City panel jobs →  Firestore cache → Bright Data → Saramin HTML → parse
Chat message    →  Anthropic Claude API (profile injected in system prompt)
Map tiles       →  MapTiler or Esri satellite fallback
Sessions/jobs   →  Firestore cache
Daily cron      →  POST /api/cron/refresh (re-scrapes sample skills via Bright Data)
```

---

### `ANTHROPIC_API_KEY` — Claude chat assistant

| | |
|---|---|
| **Provider** | [Anthropic](https://console.anthropic.com/) |
| **Used in** | `server.js` → `POST /api/chat` |
| **Purpose** | Powers the **ArrivAI Assistant** sidebar. Sends the user message to Claude with a system prompt that includes their skill, Korean level, origin, IRS, and target city. |
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
| **Caching** | Successful scrapes are stored in Firestore (`jobs` collection) to reduce Bright Data usage. |

**Example Saramin URL scraped:**
`https://www.saramin.co.kr/zf_user/search/recruit?searchword=software+engineering&loc_cd=101000`

---

### `FIREBASE_SERVICE_ACCOUNT_PATH` / `FIREBASE_SERVICE_ACCOUNT_JSON` — Firestore cache

| | |
|---|---|
| **Provider** | [Firebase / Firestore](https://firebase.google.com/) |
| **Used in** | `lib/firestore.js` |
| **Purpose** | Persistence layer used for: |
| | 1. **Job cache** — scraped Saramin results per city+skill (48h TTL) |
| | 2. **Session store** — user profile + city scores after `/api/profile` |
| | 3. **City metrics cache** — IRS breakdown per city for analytics |
| **Deployment** | On Vercel: paste minified JSON into `FIREBASE_SERVICE_ACCOUNT_JSON`. |

---

### `VITE_MAPTILER_KEY` — Map tiles & terrain (frontend only)

| | |
|---|---|
| **Provider** | [MapTiler](https://www.maptiler.com/) |
| **Used in** | `frontend/src/components/KoreaMap.jsx` |
| **Purpose** | Map tiles — **MapTiler hybrid** satellite with **3D terrain** (hills). Esri satellite is used as a fallback when this key is not set. |

---

### Other variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_MODEL` | Override Claude model ID (default `claude-sonnet-4-6`). |
| `ANTHROPIC_INSECURE_SSL` | Dev-only TLS workaround if Anthropic API is blocked on your network. Never set on Vercel. |
| `VITE_API_BASE_URL` | Production frontend API base URL. Leave empty when using Vercel rewrite proxy in `frontend/vercel.json`. |

---

### Quick reference

| Variable | Layer | Role in project |
|----------|-------|-----------------|
| `ANTHROPIC_API_KEY` | API | Claude chat assistant |
| `BRIGHTDATA_API_TOKEN` | API | Saramin job scraping via Web Unlocker |
| `FIREBASE_SERVICE_ACCOUNT_*` | API | Firestore cache (jobs, sessions, metrics) |
| `VITE_MAPTILER_KEY` | Frontend | MapTiler satellite / terrain tiles |

---

### API (`.env` at repo root)

See `.env.example` for variable names. Keys above are the external services used in this build.

---

## Deploy to Vercel

Use **two Vercel projects** from this repo:

| Project | Root directory | Purpose |
|---------|----------------|---------|
| API | `.` | Express serverless + cron |
| Frontend | `frontend` | Static Vite build |

1. Import [github.com/francisnatusm/ArrivAI](https://github.com/francisnatusm/ArrivAI) on Vercel
2. Deploy API first — add env vars from `.env.example` in the Vercel dashboard
3. Update `frontend/vercel.json` with your API URL if needed
4. Deploy frontend with root `frontend`

## IRS formula (summary)

Scores combine job demand, cost of living, Korean language fit, diaspora community fit, and market trend — weighted per city and personalized by skill + origin.

<div align="center">
  <a href="https://www.francisnatusm.com/">Francis Natus M.</a>
</div>
