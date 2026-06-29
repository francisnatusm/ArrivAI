import { useState } from 'react';
import { KOREA_CITIES, REGION_ORDER } from '@shared/cities.js';
import { SKILL_CATALOG, SKILL_CATEGORIES } from '@shared/skills.js';

const KOREAN_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'basic', label: 'Basic' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'fluent', label: 'Fluent' },
];

const citiesByRegion = REGION_ORDER.map((region) => ({
  region,
  cities: KOREA_CITIES.filter((c) => c.region === region).sort((a, b) => a.name.localeCompare(b.name)),
}));

const skillsByCategory = SKILL_CATEGORIES.map((category) => ({
  category,
  skills: SKILL_CATALOG.filter((s) => s.category === category),
}));

export default function ProfileForm({ onSubmit, loading }) {
  const [skill, setSkill] = useState('software engineering');
  const [customSkill, setCustomSkill] = useState('');
  const [koreanLevel, setKoreanLevel] = useState('intermediate');
  const [origin, setOrigin] = useState('');
  const [targetCity, setTargetCity] = useState('suggest');

  function handleSubmit(e) {
    e.preventDefault();
    const finalSkill = skill === 'other' ? customSkill.trim() : skill;
    if (!finalSkill || !origin.trim()) return;
    onSubmit({
      skill: finalSkill,
      koreanLevel,
      origin: origin.trim(),
      targetCity,
    });
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-navy-light px-4 py-3 text-sm text-white outline-none transition focus:border-accent focus:ring-1 focus:ring-accent';

  return (
    <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
          South Korea · Migrant Integration
        </p>
        <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
          Find your best city before you land
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Every field shapes your Integration Readiness Score — skill, language, origin, and target city.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-navy-light/80 p-6 shadow-2xl backdrop-blur">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Skills / field of work</label>
          <select value={skill} onChange={(e) => setSkill(e.target.value)} className={inputClass}>
            {skillsByCategory.map(({ category, skills }) => (
              <optgroup key={category} label={category}>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="other">Other (type your skill below)</option>
          </select>
          {skill === 'other' && (
            <input
              className={`${inputClass} mt-2`}
              placeholder="e.g. robotics, plumbing, social work"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Korean language level</label>
          <select value={koreanLevel} onChange={(e) => setKoreanLevel(e.target.value)} className={inputClass}>
            {KOREAN_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">Lower Korean reduces IRS — some skills need more Korean than others.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Country of origin</label>
          <input
            className={inputClass}
            placeholder="e.g. Colombia, Canada, Turkey, Burundi — any country"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
          />
          <p className="mt-1 text-[11px] text-slate-500">Any country works — mapped to a world region for diaspora & job scoring.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Target city</label>
          <select value={targetCity} onChange={(e) => setTargetCity(e.target.value)} className={inputClass}>
            <option value="suggest">Suggest best city for me</option>
            {citiesByRegion.map(({ region, cities }) => (
              <optgroup key={region} label={region}>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-3.5 text-sm font-semibold text-navy transition hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? 'Calculating your IRS…' : 'Calculate Integration Readiness'}
        </button>
      </form>
    </section>
  );
}
