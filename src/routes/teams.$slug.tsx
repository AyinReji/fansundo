import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Users, Calendar } from "lucide-react";
import { getTeam, teamGradient } from "@/data/teams";
import { PLAYERS_BY_TEAM } from "@/data/players";
import { matchesForTeam } from "@/data/matches";

export const Route = createFileRoute("/teams/$slug")({
  loader: ({ params }) => {
    const team = getTeam(params.slug);
    if (!team) throw notFound();
    return { team };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.team.name} · Aaravam 26` }, { name: "description", content: `${loaderData.team.name} squad, fixtures and supporter community.` }]
      : [],
  }),
  notFoundComponent: () => <div className="p-12 text-center text-muted-foreground">Team not found</div>,
  component: TeamPage,
});

function TeamPage() {
  const { team } = Route.useLoaderData();
  const players = PLAYERS_BY_TEAM[team.slug] ?? [];
  const fixtures = matchesForTeam(team.slug);

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: teamGradient(team) }} />
        <div className="absolute inset-0 -z-10 bg-black/60" />
        <div className="floodlight absolute inset-x-0 top-0 -z-10 h-40" />
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="flex flex-wrap items-end gap-6">
            <div className="text-8xl">{team.flag}</div>
            <div>
              <div className="font-display text-xs uppercase tracking-[0.22em] text-gold">Group {team.group} · {team.code}</div>
              <h1 className="mt-1 font-display text-5xl text-white md:text-6xl">{team.name}</h1>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full glass-strong px-3 py-1.5 text-sm text-white">
                <Users className="h-4 w-4" /> {team.supporters.toLocaleString()} supporters
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h2 className="mb-4 font-display text-2xl">Squad</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border glass p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.club}</div>
                </div>
                <div className="rounded-full bg-gold/15 px-2 py-0.5 font-sport text-xs font-bold text-gold">{p.position}</div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Mini label="Goals" value={p.goals} />
                <Mini label="Assists" value={p.assists} />
                <Mini label="Apps" value={p.appearances} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h2 className="mb-4 font-display text-2xl">Fixtures</h2>
        <div className="space-y-2">
          {fixtures.map((m) => {
            const h = getTeam(m.homeSlug)!, a = getTeam(m.awaySlug)!;
            return (
              <Link key={m.id} to="/matches" className="flex items-center justify-between rounded-xl border border-border glass px-4 py-3 hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{new Date(m.kickoff).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
                <div className="flex items-center gap-3 font-display">
                  <span>{h.flag} {h.code}</span>
                  <span className="font-sport tabular-nums">{m.status === "upcoming" ? "vs" : `${m.homeScore}–${m.awayScore}`}</span>
                  <span>{a.code} {a.flag}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${m.status === "live" ? "bg-live/20 text-live" : m.status === "finished" ? "bg-white/10 text-foreground/70" : "bg-gold/15 text-gold"}`}>{m.status}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/5 py-2">
      <div className="font-sport text-lg font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
