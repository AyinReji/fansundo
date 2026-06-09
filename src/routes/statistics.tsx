import { createFileRoute } from "@tanstack/react-router";
import { TEAMS } from "@/data/teams";

export const Route = createFileRoute("/statistics")({
  head: () => ({ meta: [{ title: "Statistics · Aaravam 26" }] }),
  component: () => {
    const totalSupport = TEAMS.reduce((a, t) => a + t.supporters, 0);
    const top = [...TEAMS].sort((a, b) => b.supporters - a.supporters).slice(0, 10);
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        <h1 className="mb-6 font-display text-4xl">Statistics</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Nations" value="48" />
          <Stat label="Supporters" value={totalSupport.toLocaleString()} />
          <Stat label="Matches" value="64" />
        </div>
        <h2 className="mt-12 mb-4 font-display text-2xl">Most-supported teams</h2>
        <div className="overflow-hidden rounded-2xl border border-border glass">
          {top.map((t, i) => (
            <div key={t.slug} className="flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-0">
              <div className="w-8 text-center font-sport text-muted-foreground">{i + 1}</div>
              <span className="text-xl">{t.flag}</span>
              <div className="flex-1 truncate">{t.name}</div>
              <div className="font-sport font-bold tabular-nums">{t.supporters.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border glass p-5">
      <div className="text-[10px] uppercase tracking-widest text-gold">{label}</div>
      <div className="mt-2 font-sport text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
