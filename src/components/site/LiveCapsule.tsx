import { Link } from "@tanstack/react-router";
import { Users, ArrowRight, Calendar } from "lucide-react";
import { liveMatch, MATCHES } from "@/data/matches";
import { getTeam } from "@/data/teams";

/**
 * Pill-shaped live match capsule.
 *  • When LIVE_MATCH.enabled === true   →  shows LIVE score + minute + Arena CTA.
 *  • When LIVE_MATCH.enabled === false  →  shows the next upcoming fixture instead.
 * Edit src/data/matches.ts → LIVE_MATCH to toggle.
 */
export function LiveCapsule() {
  const m = liveMatch();

  // No live match → show next upcoming fixture as a "Next Match" card.
  if (!m) {
    const next = MATCHES
      .filter((x) => x.status === "upcoming")
      .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))[0];
    if (!next) return null;
    const home = getTeam(next.homeSlug)!;
    const away = getTeam(next.awaySlug)!;
    return (
      <Link
        to="/matches"
        className="group relative mx-auto flex w-full max-w-3xl items-center gap-3 overflow-hidden rounded-full glass-strong px-3 py-2.5 shadow-stadium sm:gap-5 sm:px-5 sm:py-3"
      >
        <div className="flex items-center gap-2 rounded-full bg-gold/15 px-2.5 py-1">
          <Calendar className="h-3.5 w-3.5 text-gold" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gold">Next</span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-3 sm:gap-5">
          <Side flag={home.flag} name={home.code} />
          <div className="font-sport text-base text-muted-foreground sm:text-lg">vs</div>
          <Side flag={away.flag} name={away.code} reverse />
        </div>
        <div className="hidden text-xs text-muted-foreground sm:block">
          {new Date(next.kickoff).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </div>
        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-gold-foreground transition-transform group-hover:translate-x-0.5">
          Fixtures <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    );
  }

  const home = getTeam(m.homeSlug)!;
  const away = getTeam(m.awaySlug)!;

  return (
    <Link to="/arena"
      className="group relative mx-auto flex w-full max-w-3xl items-center gap-3 overflow-hidden rounded-full glass-strong px-3 py-2.5 shadow-stadium sm:gap-5 sm:px-5 sm:py-3">
      <div className="flex items-center gap-2 rounded-full bg-live/15 px-2.5 py-1">
        <span className="live-dot text-[11px] font-bold uppercase tracking-widest text-live">Live</span>
      </div>
      <div className="flex flex-1 items-center justify-center gap-3 sm:gap-5">
        <Side flag={home.flag} name={home.code} />
        <div className="font-sport text-2xl font-extrabold tabular-nums sm:text-3xl">
          {m.homeScore}<span className="mx-2 text-muted-foreground">:</span>{m.awayScore}
        </div>
        <Side flag={away.flag} name={away.code} reverse />
      </div>
      <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
        <span className="font-sport">{m.minute}'</span>
        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{m.fansOnline?.toLocaleString()}</span>
      </div>
      <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-gold-foreground transition-transform group-hover:translate-x-0.5">
        Arena <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function Side({ flag, name, reverse }: { flag: string; name: string; reverse?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${reverse ? "flex-row-reverse" : ""}`}>
      <span className="text-xl">{flag}</span>
      <span className="font-display text-base text-foreground/90">{name}</span>
    </div>
  );
}
