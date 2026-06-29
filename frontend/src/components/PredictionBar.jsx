export default function PredictionBar({ prediction, loading }) {
  if (loading) {
    return (
      <div className="h-16 animate-pulse rounded-lg bg-white/5" />
    );
  }

  if (!prediction) return null;

  const isUp = prediction.direction === 'up';
  const color = isUp ? '#00ff88' : '#ff4757';
  const pct = prediction.changePercent ?? 0;

  return (
    <div className="rounded-xl border border-white/10 bg-navy/80 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          30-day demand forecast
        </span>
        <span
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold"
          style={{ color, backgroundColor: `${color}18` }}
        >
          {isUp ? '↑' : '↓'} {pct}%
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-300">{prediction.label}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, 40 + pct * 4)}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
    </div>
  );
}
