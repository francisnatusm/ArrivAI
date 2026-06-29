import 'dotenv/config';

// Local dev only: set ANTHROPIC_INSECURE_SSL=true if your network blocks TLS to api.anthropic.com
if (process.env.ANTHROPIC_INSECURE_SSL === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import {
  KOREA_CITIES,
  getCityCode,
  getCityBaseline,
  getDiasporaFit,
  isDomesticOrigin,
  normalizeOrigin,
  resolveOriginRegion,
  getRegionLabel,
} from './lib/cities.js';
import {
  resolveSkill,
  getSkillJobBoost,
  getKoreanSkillFit,
  getLanguageGapPenalty,
  getOriginJobBoost,
} from './lib/skills.js';
import { cacheJobs, getCachedJobs, saveSession, cacheCityMetrics } from './lib/firestore.js';
import { scrapeJobsFromSaramin } from './lib/scraper.js';

export { KOREA_CITIES, getCityCode };

const app = express();
app.use(cors());
app.use(express.json());

// ─── IRS calculation ─────────────────────────────────────────────────────────

export function getLanguageScore(level) {
  const map = { none: 20, basic: 45, intermediate: 70, fluent: 100 };
  return map[String(level || 'none').toLowerCase()] ?? 20;
}

export function calculateIRS(profile, cityData, diasporaFit = 0) {
  const { koreanLevel, skill, origin } = profile;
  const { jobDemand, costOfLiving, communityPresence, trend30d } = cityData;

  const koreanFit = getKoreanSkillFit(skill, koreanLevel);
  const effectiveJobDemand = Math.min(100, jobDemand * koreanFit);
  const gapPenalty = getLanguageGapPenalty(skill, koreanLevel);

  const jobScore = effectiveJobDemand * 0.4;
  const costScore = (100 - costOfLiving) * 0.18;

  let languageRaw = getLanguageScore(koreanLevel);
  if (isDomesticOrigin(origin)) {
    languageRaw = Math.min(100, languageRaw + 20);
  }
  const languageScore = languageRaw * 0.18;

  const communityScore = communityPresence * 0.05;
  const diasporaScore = diasporaFit * 0.12;
  const trendScore = trend30d * 0.07;

  return Math.max(0, Math.round(
    jobScore + costScore + languageScore + communityScore + diasporaScore + trendScore - gapPenalty,
  ));
}

function buildProfileInfluence(profile, resolved, cities) {
  const sorted = [...cities].sort((a, b) => b.irs - a.irs);
  const best = sorted[0];
  const topSkillCity = [...cities].sort(
    (a, b) => getSkillJobBoost(profile.skill, b.id) - getSkillJobBoost(profile.skill, a.id),
  )[0];
  const topDiasporaCity = [...cities].sort((a, b) => b.diasporaFit - a.diasporaFit)[0];
  const koreanFit = getKoreanSkillFit(profile.skill, profile.koreanLevel);
  const gapPenalty = getLanguageGapPenalty(profile.skill, profile.koreanLevel);

  return {
    skill: {
      topCity: topSkillCity?.name,
      topSkillBoost: getSkillJobBoost(profile.skill, topSkillCity?.id),
    },
    korean: {
      skillFit: Math.round(koreanFit * 100),
      gapPenalty,
      meetsRequirement: gapPenalty === 0,
      fluentBonus: koreanFit > 1 ? Math.round((koreanFit - 1) * 100) : 0,
    },
    origin: {
      topDiasporaCity: topDiasporaCity?.name,
      topDiasporaFit: topDiasporaCity?.diasporaFit,
      region: resolveOriginRegion(profile.origin),
      regionLabel: getRegionLabel(resolveOriginRegion(profile.origin)),
    },
    bestMatch: { city: best?.name, irs: best?.irs },
  };
}

function getCityDataForProfile(cityId, profile) {
  const base = getCityBaseline(cityId);
  const skillBoost = getSkillJobBoost(profile?.skill, cityId);
  const originJobBoost = getOriginJobBoost(profile?.origin, profile?.skill, cityId);
  const diasporaFit = getDiasporaFit(profile?.origin, cityId);
  return {
    ...base,
    jobDemand: Math.min(100, base.jobDemand + skillBoost + originJobBoost),
    communityPresence: base.communityPresence,
    diasporaFit,
    koreanFit: getKoreanSkillFit(profile?.skill, profile?.koreanLevel),
  };
}

function buildCityScores(profile) {
  return KOREA_CITIES.map((city) => {
    const cityData = getCityDataForProfile(city.id, profile);
    const irs = calculateIRS(profile, cityData, cityData.diasporaFit);
    return {
      ...city,
      irs,
      jobDemand: cityData.jobDemand,
      costOfLiving: cityData.costOfLiving,
      communityPresence: cityData.communityPresence,
      diasporaFit: cityData.diasporaFit,
      trend30d: cityData.trend30d,
      koreanFit: cityData.koreanFit,
    };
  });
}

function mockJobListings(city, skill) {
  const cityName = KOREA_CITIES.find((c) => c.id === city.toLowerCase())?.name || city;
  const titles = [
    `${skill} — ${cityName} (Senior)`,
    `${skill} — ${cityName} (Mid-level)`,
    `${skill} — ${cityName} (Entry)`,
    `${skill} — ${cityName} (Contract)`,
    `${skill} — ${cityName} (Startup)`,
  ];
  return titles.map((title, i) => ({
    id: `${city}-${i}`,
    title,
    company: `Company ${i + 1}`,
    location: cityName,
    source: 'saramin',
    url: `https://www.saramin.co.kr/zf_user/search/recruit?searchword=${encodeURIComponent(skill)}`,
  }));
}

async function getJobsForCitySkill(city, skill) {
  const cached = await getCachedJobs(city, skill);
  if (cached?.length) return { jobs: cached, source: 'firestore' };

  try {
    const scraped = await scrapeJobsFromSaramin(city, skill);
    if (scraped?.length) {
      await cacheJobs(city, skill, scraped);
      return { jobs: scraped, source: 'saramin' };
    }
  } catch (err) {
    console.warn('[jobs]', city, skill, err.message);
  }

  const mock = mockJobListings(city, skill);
  return { jobs: mock, source: 'mock' };
}

// ─── Claude system prompt ────────────────────────────────────────────────────

export const ARRIVAAI_SYSTEM_PROMPT = `You are ArrivAI's integration assistant — a friendly, practical AI guide helping migrants and foreigners find economic opportunities in South Korea.

You have access to the user's profile:
- Skills: {skill}
- Korean language level: {koreanLevel}
- Country of origin: {origin}
- Their Integration Readiness Score (IRS): {irs} / 100
- Their target city: {city}

Your job is to:
1. Give specific, actionable advice for their situation
2. Recommend Korean job boards, language resources, and visa info relevant to their profile
3. Compare cities honestly based on their skill and language level
4. Suggest a 30-day action plan if asked
5. Be encouraging but realistic — don't sugarcoat low IRS scores, explain why and how to improve them

Always respond in English. Keep answers concise and practical. Never make up job listings or statistics — refer to what the platform shows.`;

function buildSystemPrompt(profile, cityScores) {
  const target = profile.targetCity || 'all cities';
  const best = [...(cityScores || [])].sort((a, b) => b.irs - a.irs)[0];
  return ARRIVAAI_SYSTEM_PROMPT
    .replace('{skill}', profile.skill || 'not specified')
    .replace('{koreanLevel}', profile.koreanLevel || 'not specified')
    .replace('{origin}', profile.origin || 'not specified')
    .replace('{irs}', String(best?.irs ?? profile.irs ?? '—'))
    .replace('{city}', target === 'suggest' ? (best?.name || 'Seoul') : target);
}

// ─── In-memory session store (replaced by Firestore in step 13) ──────────────

const sessions = new Map();

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'arrivai-api' });
});

/** Cron: refresh job data from Saramin via Bright Data */
app.post('/api/cron/refresh', async (_req, res) => {
  const skills = ['software engineering', 'nursing', 'teaching english', 'manufacturing'];
  let refreshed = 0;
  const errors = [];

  for (const city of KOREA_CITIES) {
    for (const skill of skills) {
      try {
        const { jobs } = await getJobsForCitySkill(city.id, skill);
        if (jobs?.length) refreshed += 1;
      } catch (err) {
        errors.push(`${city.id}/${skill}: ${err.message}`);
      }
    }
  }

  res.json({ ok: true, refreshed, errors: errors.slice(0, 5) });
});

/**
 * POST /api/profile
 * Body: { skill, koreanLevel, origin, targetCity? }
 * Returns IRS scores for all Korean cities.
 */
app.post('/api/profile', (req, res) => {
  const { skill, koreanLevel, origin, targetCity } = req.body || {};

  if (!skill || !koreanLevel || !origin) {
    return res.status(400).json({
      error: 'Missing required fields: skill, koreanLevel, origin',
    });
  }

  const profile = {
    skill: String(skill).trim(),
    koreanLevel: String(koreanLevel).toLowerCase(),
    origin: String(origin).trim(),
    targetCity: targetCity ? String(targetCity).toLowerCase() : 'suggest',
  };

  const resolved = resolveSkill(profile.skill);
  const cities = buildCityScores(profile);
  const influence = buildProfileInfluence(profile, resolved, cities);
  const sorted = [...cities].sort((a, b) => b.irs - a.irs);
  const recommended = profile.targetCity === 'suggest' ? sorted[0] : cities.find((c) => c.id === profile.targetCity) || sorted[0];
  const bestOverall = sorted[0];
  const targetCityData = profile.targetCity !== 'suggest' ? cities.find((c) => c.id === profile.targetCity) : null;

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  sessions.set(sessionId, { profile, cities, updatedAt: Date.now() });
  saveSession(sessionId, { profile, cities }).catch(() => {});
  cacheCityMetrics(cities).catch(() => {});

  res.json({
    sessionId,
    profile: {
      ...profile,
      normalizedOrigin: normalizeOrigin(profile.origin),
      diasporaRegion: resolveOriginRegion(profile.origin),
      diasporaRegionLabel: getRegionLabel(resolveOriginRegion(profile.origin)),
      profileType: isDomesticOrigin(profile.origin) ? 'domestic' : 'migrant',
      resolvedSkill: resolved.label,
      skillCategory: resolved.category,
      koreanRequired: resolved.koreanNeed,
    },
    recommendedCity: recommended,
    bestOverallCity: bestOverall,
    targetCityFit: targetCityData
      ? {
          city: targetCityData.name,
          irs: targetCityData.irs,
          vsBest: targetCityData.irs - bestOverall.irs,
        }
      : null,
    influence,
    cities,
  });
});

/**
 * GET /api/jobs/:city/:skill
 * Returns job listings for a city + skill (mock until Bright Data step 14).
 */
app.get('/api/cities', (req, res) => {
  const sessionId = req.query.sessionId;
  if (sessionId && sessions.has(sessionId)) {
    const { cities, profile } = sessions.get(sessionId);
    return res.json({ profile, cities });
  }
  res.json({ cities: KOREA_CITIES });
});

app.get('/api/predict/:city/:skill', (req, res) => {
  const city = req.params.city?.toLowerCase();
  const skill = decodeURIComponent(req.params.skill || '');
  if (!KOREA_CITIES.some((c) => c.id === city)) {
    return res.status(404).json({ error: `Unknown city: ${city}` });
  }
  const baseline = getCityBaseline(city);
  const boost = getSkillJobBoost(skill, city);
  const trendPct = Math.round((baseline.trend30d + boost * 0.5) / 10 - 5);
  const direction = trendPct >= 0 ? 'up' : 'down';
  res.json({
    city,
    skill,
    direction,
    changePercent: Math.abs(trendPct),
    label: `${skill} demand in ${KOREA_CITIES.find((c) => c.id === city)?.name || city} is trending ${direction.toUpperCase()} ${Math.abs(trendPct)}% over the next 30 days`,
  });
});

app.get('/api/jobs/:city/:skill', async (req, res) => {
  const city = req.params.city?.toLowerCase();
  const skill = decodeURIComponent(req.params.skill || '');

  if (!KOREA_CITIES.some((c) => c.id === city)) {
    return res.status(404).json({ error: `Unknown city: ${city}` });
  }

  try {
    const { jobs, source } = await getJobsForCitySkill(city, skill);
    res.json({ city, skill, jobs, source, count: jobs.length });
  } catch (err) {
    console.error('[jobs]', err);
    const jobs = mockJobListings(city, skill);
    res.json({ city, skill, jobs, source: 'mock', count: jobs.length });
  }
});

/**
 * POST /api/chat
 * Body: { message, profile?, sessionId?, cityScores? }
 */
app.post('/api/chat', async (req, res) => {
  const { message, profile: bodyProfile, sessionId, cityScores: bodyScores } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing required field: message' });
  }

  let profile = bodyProfile;
  let cityScores = bodyScores;

  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    profile = profile || session.profile;
    cityScores = cityScores || session.cities;
  }

  if (!profile?.skill) {
    return res.status(400).json({
      error: 'Profile context required. Submit /api/profile first or include profile in body.',
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'ANTHROPIC_API_KEY not configured',
      fallback: `Thanks for your question about "${message.slice(0, 80)}". Configure ANTHROPIC_API_KEY to enable the ArrivAI assistant.`,
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const system = buildSystemPrompt(profile, cityScores);
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: message }],
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    res.json({ reply: text, model: response.model });
  } catch (err) {
    console.error('[chat]', err);
    const msg = err.message || 'Unknown error';
    const sslHint = /certificate|UNABLE_TO_VERIFY|TLS|SSL|Connection error/i.test(msg)
      ? ' Network SSL issue — add ANTHROPIC_INSECURE_SSL=true to .env and restart the API (dev only).'
      : '';
    res.status(500).json({
      error: 'Chat request failed',
      detail: msg + sslHint,
    });
  }
});

// Local dev only — Vercel/production uses serverless (no app.listen)
const PORT = process.env.PORT || 3001;
const isServerless = Boolean(process.env.VERCEL);

if (!isServerless) {
  app.listen(PORT, () => {
    console.log(`ArrivAI API listening on http://localhost:${PORT}`);
  });
}

export default app;
