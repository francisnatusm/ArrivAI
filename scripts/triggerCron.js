/**
 * Manual cron trigger: node scripts/triggerCron.js
 * Requires API running locally or CRON_URL env.
 */
const base = (process.env.CRON_URL || 'http://localhost:3001').replace(/\/$/, '');

const res = await fetch(`${base}/api/cron/refresh`, { method: 'POST' });
const data = await res.json();
console.log(res.status, data);
