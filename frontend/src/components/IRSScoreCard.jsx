import { useEffect, useState } from 'react';
import { irsColor } from '../lib/api.js';

export default function IRSScoreCard({ score, cityName, label, profile }) {
  const [display, setDisplay] = useState(0);
  const color = irsColor(score ?? 0);
  const koreanBelowNeed =
    profile?.koreanRequired &&
    profile?.koreanLevel &&
    levelRank(profile.koreanLevel) < levelRank(profile.koreanRequired);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (display / 100) * circumference;

  useEffect(() => {
    if (score == null) return;
    let frame;
    const start = performance.now();
    const duration = 1200;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(eased * score));
      if (t < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-light/90 p-5 backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label || 'Integration Readiness Score'}
      </p>
      {cityName && (
        <p className="mt-1 font-heading text-lg font-semibold text-white">{cityName}</p>
      )}

      <div className="relative mx-auto mt-4 flex h-36 w-36 items-center justify-center">
        <svg className="-rotate-90" width="144" height="144" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        <div className="absolute text-center">
          <span className="font-heading text-4xl font-bold" style={{ color }}>
            {display}
          </span>
          <span className="block text-xs text-slate-500">/ 100</span>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
        {koreanBelowNeed && (
          <span className="block text-warning">
            Korean below skill requirement ({profile.koreanLevel} vs {profile.koreanRequired} needed)
          </span>
        )}
        {display >= 70 && 'Strong opportunity — high job fit for your profile'}
        {!koreanBelowNeed && display >= 45 && display < 70 && 'Moderate fit — language or cost may limit options'}
        {!koreanBelowNeed && display < 45 && 'Challenging market — focus on language & certifications'}
      </p>
    </div>
  );
}

function levelRank(level) {
  return { none: 0, basic: 1, intermediate: 2, fluent: 3 }[String(level).toLowerCase()] ?? 0;
}
