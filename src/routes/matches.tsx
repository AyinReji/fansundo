import { createFileRoute } from "@tanstack/react-router";
import { MATCHES } from "@/data/matches";
import { getTeam } from "@/data/teams";

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Match Centre · Aaravam 26" }] }),
  component: () => (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <h1 className="mb-6 font-display text-4xl">Match Centre</h1>
      <div className="space-y-2">
        {MATCHES.map((m) => {
          const h = getTeam(m.homeSlug)!, a = getTeam(m.awaySlug)!;
          return (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border glass p-4">
              <span className="text-xs text-muted-foreground">{new Date(m.kickoff).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
              <div className="flex items-center gap-3 font-display text-lg">
                <span>{h.flag} {h.code}</span>
                <span className="font-sport tabular-nums">{m.status === "upcoming" ? "vs" : `${m.homeScore} – ${m.awayScore}`}</span>
                <span>{a.code} {a.flag}</span>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-widest ${m.status === "live" ? "bg-live/20 text-live live-dot" : m.status === "finished" ? "bg-white/10 text-foreground/70" : "bg-gold/15 text-gold"}`}>{m.status}{m.status === "live" ? ` · ${m.minute}'` : ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  ),
});
