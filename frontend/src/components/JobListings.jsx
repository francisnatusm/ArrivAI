export default function JobListings({ jobs, loading }) {
  if (loading) {
    return (
      <ul className="space-y-2">
        {[1, 2, 3].map((i) => (
          <li key={i} className="h-14 animate-pulse rounded-lg bg-white/5" />
        ))}
      </ul>
    );
  }

  if (!jobs?.length) {
    return <p className="text-sm text-slate-500">No listings available yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {jobs.slice(0, 5).map((job) => (
        <li key={job.id}>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 transition hover:border-accent/40 hover:bg-accent/5"
          >
            <p className="text-sm font-medium text-white">{job.title}</p>
            <p className="text-xs text-slate-400">
              {job.company} · {job.location} · via {job.source}
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}
