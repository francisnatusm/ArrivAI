import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let db = null;

function loadServiceAccount() {
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path) {
    const file = resolve(process.cwd(), path);
    return JSON.parse(readFileSync(file, 'utf8'));
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  return JSON.parse(raw);
}

export function initFirestore() {
  if (db) return db;

  try {
    const cred = loadServiceAccount();
    if (!cred) return null;
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(cred) });
    }
    db = admin.firestore();
    return db;
  } catch (err) {
    console.warn('[firestore] init failed:', err.message);
    return null;
  }
}

export async function cacheJobs(city, skill, jobs) {
  const firestore = initFirestore();
  if (!firestore) return;
  const id = `${city}_${skill}`.replace(/\s+/g, '_').toLowerCase();
  await firestore.collection('jobs').doc(id).set({
    city,
    skill,
    jobs,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function getCachedJobs(city, skill) {
  const firestore = initFirestore();
  if (!firestore) return null;
  const id = `${city}_${skill}`.replace(/\s+/g, '_').toLowerCase();
  const snap = await firestore.collection('jobs').doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data();
  const updated = data.updatedAt?.toDate?.() || new Date(0);
  const ageHours = (Date.now() - updated.getTime()) / 36e5;
  if (ageHours > 48) return null;
  return data.jobs;
}

export async function saveSession(sessionId, payload) {
  const firestore = initFirestore();
  if (!firestore) return;
  await firestore.collection('sessions').doc(sessionId).set({
    ...payload,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function cacheCityMetrics(cities) {
  const firestore = initFirestore();
  if (!firestore) return;
  const batch = firestore.batch();
  cities.forEach((city) => {
    const ref = firestore.collection('city_metrics').doc(city.id);
    batch.set(ref, {
      irs: city.irs,
      jobDemand: city.jobDemand,
      costOfLiving: city.costOfLiving,
      communityPresence: city.communityPresence,
      trend30d: city.trend30d,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
}
