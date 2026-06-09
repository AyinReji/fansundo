import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Flame, Trophy, Users } from "lucide-react";
import { LiveCapsule } from "@/components/site/LiveCapsule";
import { BentoTile } from "@/components/site/BentoTile";
import { TeamCard } from "@/components/site/TeamCard";
import { useFan } from "@/hooks/useFan";
import { getTeam, TEAMS, teamGradient } from "@/data/teams";
import { nextMatchForTeam, MATCHES } from "@/data/matches";
import { LEADERBOARD } from "@/data/leaderboard";
import { topScorers } from "@/data/players";
import heroImg from "@/assets/hero-stadium.jpg";
import bentoMatches from "@/assets/bento-matches.jpg";
import bentoTeams from "@/assets/bento-teams.jpg";
import bentoStats from "@/assets/bento-stats.jpg";
import bentoHighlights from "@/assets/bento-highlights.jpg";
import bentoArena from "@/assets/bento-arena.jpg";
import bentoLeaderboard from "@/assets/bento-leaderboard.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aaravam 26 — കേരളത്തിന്റെ ഡിജിറ്റൽ ഫുട്ബോൾ സ്റ്റേഡിയം" },
      { name: "description", content: "Live arena, 48 teams, statistics, predictions and a Malayalam-first World Cup community." },
    ],
  }),
  component: Home,
});

function Home() {
  const fan = useFan();
  const myTeam = fan ? getTeam(fan.teamSlug) : null;
  const myNext = myTeam ? nextMatchForTeam(myTeam.slug) : null;
  const myScorers = myTeam ? topScorers(myTeam.slug) : [];
  const featuredTeams = TEAMS.slice(0, 8);
  const finished = MATCHES.filter((m) => m.status === "finished").slice(0, 3);

  return (
    <div>
      {/* ====== HERO ====== */}
      <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 -z-10 hero-bg" />
        <div className="pitch-bg absolute inset-x-0 bottom-0 -z-10 h-32" />
        <div className="floodlight absolute inset-x-0 top-0 -z-10 h-64" />

        <div className="mx-auto w-full max-w-7xl px-4 py-24 md:px-6">
          <div className="mx-auto max-w-3xl text-center animate-float-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              <Flame className="h-3.5 w-3.5" /> World Cup 2026 · Independent Fan Platform
            </div>
            <h1 className="font-mal text-6xl font-extrabold leading-[0.95] text-gradient-gold sm:text-7xl md:text-8xl">
              ആരവം 26
            </h1>
            <p className="font-mal mt-4 text-xl text-foreground/90 md:text-2xl">
              കേരളത്തിന്റെ ഡിജിറ്റൽ ഫുട്ബോൾ സ്റ്റേഡിയം
            </p>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
              One arena. 48 teams. Every match. Every roar. Join Malayalis cheering the world's biggest tournament — together.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/arena"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-display text-sm tracking-widest text-gold-foreground shadow-glow transition-transform hover:-translate-y-0.5">
                Join The Arena <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/teams"
                className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 font-display text-sm tracking-widest text-foreground hover:bg-white/10">
                Browse Teams
              </Link>
            </div>
          </div>

          <div className="mt-14">
            <LiveCapsule />
          </div>
        </div>
      </section>

      {/* ====== YOUR TEAM ====== */}
      {fan && myTeam && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionTitle caption="Your team" title={myTeam.name} extra={<Link to="/teams/$slug" params={{ slug: myTeam.slug }} className="text-sm font-semibold text-gold hover:underline">Team page →</Link>} />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-3xl border border-border p-6 shadow-stadium md:col-span-2"
              style={{ background: teamGradient(myTeam) }}>
              <div className="absolute inset-0 bg-black/55" />
              <div className="relative grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-6xl">{myTeam.flag}</div>
                  <div className="mt-3 font-display text-3xl text-white">{myTeam.name}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-white/80">
                    <Users className="h-3 w-3" /> {myTeam.supporters.toLocaleString()} supporters
                  </div>
                  <div className="mt-4 flex gap-1.5">
                    {myTeam.form.map((r, i) => (
                      <span key={i} className={`grid h-7 w-7 place-items-center rounded font-sport text-xs font-bold ${r === "W" ? "bg-pitch text-black" : r === "D" ? "bg-white/80 text-black" : "bg-live text-white"}`}>{r}</span>
                    ))}
                  </div>
                </div>
                <div className="text-white">
                  <div className="text-[10px] uppercase tracking-widest text-white/70">Top scorers</div>
                  <ul className="mt-2 space-y-2">
                    {myScorers.map((p) => (
                      <li key={p.id} className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2 text-sm">
                        <span className="truncate">{p.name}</span>
                        <span className="font-sport font-bold">{p.goals}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-border glass p-6">
              <div className="text-[10px] uppercase tracking-widest text-gold">Next Match</div>
              {myNext ? (
                <>
                  <div className="mt-3 font-display text-2xl">
                    {getTeam(myNext.homeSlug)?.code} vs {getTeam(myNext.awaySlug)?.code}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(myNext.kickoff).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{myNext.venue}</div>
                  <Link to="/matches" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline">
                    All fixtures <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No upcoming fixture scheduled.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ====== EXPLORE BENTO ====== */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle caption="Explore" title="The full stadium" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2 md:[grid-auto-rows:220px]">
          <BentoTile to="/arena" title="Live Arena" caption="Real-time" image={bentoArena} className="col-span-2 md:row-span-2 md:min-h-[460px]" />
          <BentoTile to="/matches" title="Match Centre" caption="Fixtures" image={bentoMatches} />
          <BentoTile to="/teams" title="Teams" caption="48 nations" image={bentoTeams} />
          <BentoTile to="/statistics" title="Statistics" caption="Numbers" image={bentoStats} />
          <BentoTile to="/highlights" title="Highlights" caption="Goals" image={bentoHighlights} />
          <BentoTile to="/leaderboard" title="Leaderboard" caption="Top fans" image={bentoLeaderboard} className="col-span-2" />
        </div>
      </section>

      {/* ====== FAN ANALYTICS ====== */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle caption="Fan Analytics" title="The crowd, by the numbers" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Users className="h-5 w-5" />} value="412K" label="Active fans" />
          <Stat icon={<Flame className="h-5 w-5" />} value="2,481" label="Online now" />
          <Stat icon={<Calendar className="h-5 w-5" />} value="64" label="Matches" />
          <Stat icon={<Trophy className="h-5 w-5" />} value="48" label="Nations" />
        </div>
      </section>

      {/* ====== LEADERBOARD PREVIEW ====== */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle caption="Fan Championship" title="Top of the table"
          extra={<Link to="/leaderboard" className="text-sm font-semibold text-gold hover:underline">Full leaderboard →</Link>} />
        <div className="overflow-hidden rounded-3xl border border-border glass">
          {LEADERBOARD.slice(0, 5).map((r) => {
            const t = getTeam(r.team_slug)!;
            return (
              <div key={r.rank} className="flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-0">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 font-sport text-sm font-bold text-gold">{r.rank}</div>
                <div className="text-xl">{t.flag}</div>
                <div className="flex-1 truncate font-semibold">{r.username}</div>
                <div className="hidden text-xs text-muted-foreground sm:block">{t.name}</div>
                <div className="font-sport text-lg font-bold tabular-nums">{r.points.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====== TEAM SHOWCASE ====== */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle caption="48 Nations" title="Find your colours"
          extra={<Link to="/teams" className="text-sm font-semibold text-gold hover:underline">All 48 teams →</Link>} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {featuredTeams.map((t) => <TeamCard key={t.slug} team={t} />)}
        </div>
      </section>

      {/* ====== HIGHLIGHTS ====== */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle caption="Highlights" title="Replay the magic"
          extra={<Link to="/highlights" className="text-sm font-semibold text-gold hover:underline">All highlights →</Link>} />
        <div className="grid gap-4 md:grid-cols-3">
          {finished.map((m) => {
            const h = getTeam(m.homeSlug)!, a = getTeam(m.awaySlug)!;
            return (
              <div key={m.id} className="overflow-hidden rounded-2xl border border-border glass">
                <div className="aspect-video w-full bg-black">
                  <iframe className="h-full w-full"
                    src={`https://www.youtube.com/embed/${m.highlightYoutubeId}`}
                    title={`${h.name} vs ${a.name}`} loading="lazy"
                    allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{h.flag}</span>
                    <span className="font-sport font-bold tabular-nums">{m.homeScore} – {m.awayScore}</span>
                    <span className="text-lg">{a.flag}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.stage}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ===== local helpers ===== */
function SectionTitle({ caption, title, extra }: { caption: string; title: string; extra?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">{caption}</div>
        <h2 className="mt-1 font-display text-3xl text-foreground md:text-4xl">{title}</h2>
      </div>
      {extra}
    </div>
  );
}
function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border glass p-5">
      <div className="flex items-center justify-between text-gold">{icon}<span className="text-[10px] uppercase tracking-widest">{label}</span></div>
      <div className="mt-2 font-sport text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
