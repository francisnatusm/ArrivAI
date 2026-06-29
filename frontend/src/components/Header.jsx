export default function Header({ compact }) {
  return (
    <header
      className={`flex items-center justify-between border-b border-white/10 ${
        compact ? 'px-4 py-3' : 'px-6 py-5'
      }`}
    >
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight text-white md:text-2xl">
          Arriv<span className="text-accent">AI</span>
        </h1>
        {!compact && (
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Your personalized roadmap to economic independence in South Korea — city by city, skill by skill.
          </p>
        )}
      </div>
      <div className="hidden rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent sm:block">
        Integration Readiness Score
      </div>
    </header>
  );
}
