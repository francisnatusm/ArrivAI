export default function ProfileSummary({ profile, recommendedCity, cityCount, targetCityFit, bestOverallCity, influence }) {
  if (!profile) return null;

  const target =
    profile.targetCity === 'suggest'
      ? `Best match: ${recommendedCity?.name || '—'} (IRS ${recommendedCity?.irs ?? '—'})`
      : `Your target: ${recommendedCity?.name || profile.targetCity} (IRS ${recommendedCity?.irs ?? '—'})`;

  return (
    <div className="border-b border-white/10 px-4 py-2">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <Chip label="Skill" value={profile.resolvedSkill || profile.skill} />
        <Chip label="Korean" value={profile.koreanLevel} />
        <Chip label="From" value={profile.origin} />
        {profile.diasporaRegionLabel && profile.profileType !== 'domestic' && (
          <Chip label="Region" value={profile.diasporaRegionLabel} />
        )}
        {profile.koreanRequired && (
          <Chip label="Korean needed" value={profile.koreanRequired} accent />
        )}
        {profile.profileType === 'domestic' && (
          <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-success">
            Domestic profile
          </span>
        )}
        <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-accent">
          {target}
        </span>
        {cityCount > 0 && <span className="text-slate-500">{cityCount} cities scored</span>}
      </div>

      {influence && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
          <span className="text-slate-400">How your inputs scored:</span>{' '}
          Skill favors {influence.skill.topCity} (+{influence.skill.topSkillBoost} job demand).
          {' '}Korean×skill fit {influence.korean.skillFit}%
          {influence.korean.gapPenalty > 0 && (
            <span className="text-warning"> — {influence.korean.gapPenalty} pt penalty (below {profile.koreanRequired})</span>
          )}
          {influence.korean.fluentBonus > 0 && (
            <span className="text-success"> — +{influence.korean.fluentBonus}% fluent bonus</span>
          )}
          . Origin region: {influence.origin.regionLabel} — diaspora peak {influence.origin.topDiasporaCity} ({influence.origin.topDiasporaFit}/100).
        </p>
      )}

      {targetCityFit && bestOverallCity && targetCityFit.vsBest !== 0 && (
        <p className="mt-1 text-[11px] text-slate-500">
          {targetCityFit.city} IRS {targetCityFit.irs} —{' '}
          {targetCityFit.vsBest >= 0 ? 'matches' : `${Math.abs(targetCityFit.vsBest)} pts below`} best overall{' '}
          {bestOverallCity.name} ({bestOverallCity.irs})
        </p>
      )}
    </div>
  );
}

function Chip({ label, value, accent }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 ${
        accent ? 'border-accent/30 bg-accent/10 text-accent' : 'border-white/10 bg-white/5'
      }`}
    >
      <span className={accent ? '' : 'text-slate-500'}>{label}</span> · {value}
    </span>
  );
}
