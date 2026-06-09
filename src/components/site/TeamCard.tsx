import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { teamGradient, type Team } from "@/data/teams";

/** Flag-themed team card used on /teams and supporter sections. */
export function TeamCard({ team }: { team: Team }) {
  return (
    <Link to="/teams/$slug" params={{ slug: team.slug }}
      className="group relative block overflow-hidden rounded-2xl border border-border shadow-stadium transition-transform hover:-translate-y-1">
      <div className="aspect-[4/3] w-full" style={{ background: teamGradient(team) }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl drop-shadow-lg">{team.flag}</span>
          <span className="rounded-full bg-black/40 px-2 py-0.5 font-display text-[11px] tracking-widest text-white">GRP {team.group}</span>
        </div>
        <div>
          <div className="font-display text-xl text-white">{team.name}</div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-white/85">
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{team.supporters.toLocaleString()}</span>
            <span className="flex gap-1">
              {team.form.map((r, i) => (
                <span key={i}
                  className={`grid h-4 w-4 place-items-center rounded font-sport text-[9px] font-bold ${r === "W" ? "bg-pitch text-black" : r === "D" ? "bg-white/70 text-black" : "bg-live/80 text-white"}`}>
                  {r}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
