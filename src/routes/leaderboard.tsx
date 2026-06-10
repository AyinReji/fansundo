import { createFileRoute } from "@tanstack/react-router";
import { getTeam } from "@/data/teams";
import { LEADERBOARD } from "@/data/leaderboard";
import { TeamBadge } from "@/components/site/FlagArt";
import { useTeamPopup } from "@/components/site/TeamPopupProvider";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard · Aaravam 26" }] }),
  component: Leaderboard,
});

function Leaderboard() {
  const { openBySlug } = useTeamPopup();
  const podium = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <h1 className="mb-2 font-display text-4xl md:text-5xl">Fan Championship</h1>
      <p className="mb-10 text-sm text-muted-foreground">Points, streaks, referrals — only the loudest rise.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {podium.map((r, i) => {
          const t = getTeam(r.team_slug)!;
          const heights = ["sm:mt-8", "", "sm:mt-12"];
          return (
            <div key={r.rank} className={`rounded-3xl border border-border glass p-6 text-center ${heights[i]}`}>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold font-sport text-lg font-bold text-gold-foreground">{r.rank}</div>
              <button onClick={() => openBySlug(t.slug)} className="mt-4 inline-block transition-transform hover:scale-105">
                <TeamBadge slug={t.slug} size={64} />
              </button>
              <div className="mt-3 font-display text-xl">{r.username}</div>
              <button onClick={() => openBySlug(t.slug)} className="text-xs text-muted-foreground hover:text-gold">{t.name}</button>
              <div className="mt-3 font-sport text-3xl font-bold text-gradient-gold tabular-nums">{r.points.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border glass">
        {rest.map((r) => {
          const t = getTeam(r.team_slug)!;
          return (
            <div key={r.rank} className="flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-0">
              <div className="w-8 text-center font-sport text-sm text-muted-foreground">{r.rank}</div>
              <button onClick={() => openBySlug(t.slug)} aria-label={t.name}>
                <TeamBadge slug={t.slug} size={28} />
              </button>
              <div className="flex-1 truncate font-medium">{r.username}</div>
              <span className={`text-xs ${r.movement > 0 ? "text-pitch" : r.movement < 0 ? "text-live" : "text-muted-foreground"}`}>
                {r.movement > 0 ? "▲" : r.movement < 0 ? "▼" : "—"}{Math.abs(r.movement)}
              </span>
              <div className="w-20 text-right font-sport font-bold tabular-nums">{r.points.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
