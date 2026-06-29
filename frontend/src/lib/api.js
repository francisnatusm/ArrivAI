const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p;
}

async function request(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (data.fallback) return { reply: data.fallback, _fallback: true };
    const msg = [data.error, data.detail].filter(Boolean).join(': ');
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return data;
}

export function submitProfile(profile) {
  return request('/api/profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export function fetchJobs(city, skill) {
  return request(`/api/jobs/${encodeURIComponent(city)}/${encodeURIComponent(skill)}`);
}

export function fetchPrediction(city, skill) {
  return request(`/api/predict/${encodeURIComponent(city)}/${encodeURIComponent(skill)}`);
}

export function sendChat(message, context) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      profile: context.profile,
      sessionId: context.sessionId,
      cityScores: context.cities,
    }),
  });
}

export function irsColor(score) {
  if (score >= 70) return '#00ff88';
  if (score >= 45) return '#ffaa00';
  return '#ff4757';
}
