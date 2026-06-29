import { useEffect, useState } from 'react';
import { fetchJobs, fetchPrediction } from '../lib/api.js';
import JobListings from './JobListings.jsx';
import PredictionBar from './PredictionBar.jsx';

export default function CityPanel({ city, profile, onClose }) {
  const [jobs, setJobs] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingPred, setLoadingPred] = useState(false);

  useEffect(() => {
    if (!city || !profile?.skill) return;

    setLoadingJobs(true);
    setLoadingPred(true);
    setJobs([]);
    setPrediction(null);

    fetchJobs(city.id, profile.skill)
      .then((data) => setJobs(data.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoadingJobs(false));

    fetchPrediction(city.id, profile.skill)
      .then(setPrediction)
      .catch(() => setPrediction(null))
      .finally(() => setLoadingPred(false));
  }, [city?.id, profile?.skill]);

  if (!city) return null;

  return (
    <aside className="animate-slide-in scrollbar-thin flex h-full max-h-[50vh] flex-col overflow-y-auto rounded-2xl border border-white/10 bg-navy-light/95 backdrop-blur md:max-h-none">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="font-heading text-lg font-semibold text-white">{city.name}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <Stat label="Job demand" value={Math.round(city.jobDemand)} />
          <Stat label="Cost index" value={Math.round(city.costOfLiving)} suffix=" (lower better)" />
          <Stat label="Community" value={Math.round(city.communityPresence)} />
          <Stat label="Diaspora fit" value={Math.round(city.diasporaFit ?? 0)} />
          <Stat label="Korean×skill fit" value={`${Math.round((city.koreanFit ?? 1) * 100)}%`} />
          <Stat label="30d trend" value={Math.round(city.trend30d)} />
        </div>

        <PredictionBar prediction={prediction} loading={loadingPred} />

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Top jobs (Saramin)
          </h3>
          <JobListings jobs={jobs} loading={loadingJobs} />
        </div>

        <p className="text-xs text-slate-500">
          Population ~{(city.population / 1e6).toFixed(1)}M · Click another city on the map to compare.
        </p>
      </div>
    </aside>
  );
}

function Stat({ label, value, suffix }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/5 px-2 py-2">
      <p className="text-slate-500">{label}</p>
      <p className="font-heading text-lg font-semibold text-accent">
        {value}
        {suffix && <span className="text-[10px] font-normal text-slate-500">{suffix}</span>}
      </p>
    </div>
  );
}
