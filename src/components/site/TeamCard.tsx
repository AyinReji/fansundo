/* =============================================================================
 * TeamCard — flag-driven nation card. The flag IS the card.
 *
 * Click → opens TeamPopup (controlled via context) instead of navigating.
 * A user can still reach the dedicated page from the popup footer.
 * ===========================================================================*/
import { Users } from "lucide-react";
import { type Team } from "@/data/teams";
import { FlagArt } from "@/components/site/FlagArt";
import { useTeamPopup } from "@/components/site/TeamPopupProvider";
interface Props {
  team: Team;
  size?: "default" | "compact";
}
export function TeamCard({ team, size = "default" }: Props) {
  const { open } = useTeamPopup();
  const compact = size === "compact";

  return (
    <button
      type="button"
      onClick={() => open(team)}
      className="group relative block w-full overflow-hidden rounded-2xl border border-border text-left shadow-stadium outline-none transition-all hover:-translate-y-1 hover:shadow-glow focus-visible:ring-2 focus-visible:ring-gold"
    >
      {/* Flag fills the whole card — this is the design */}
      <div className="aspect-[4/3] w-full">
        <FlagArt slug={team.slug} className="h-full w-full" />
      </div>
      {/* Shimmer sweep on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {/* Bottom info gradient */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
          <div className="min-w-0">
            <div className="font-display text-base text-white drop-shadow md:text-lg">{team.name}</div>
            {!compact && <div className="truncate text-[11px] italic text-white/80">{team.nickname}</div>}
          </div>
          <span className="shrink-0 rounded-full bg-black/55 px-2 py-0.5 font-sport text-[10px] tracking-widest text-white">
            {team.group}
          </span>
        </div>
        {!compact && (
          <div className="mt-2 flex items-center justify-between text-[10px] text-white/85">
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{team.supporters.toLocaleString()}</span>
            <span className="flex gap-0.5">
              {team.form.map((r, i) => (
                <span key={i}
                  className={`grid h-3.5 w-3.5 place-items-center rounded font-sport text-[8px] font-bold ${r === "W" ? "bg-pitch text-black" : r === "D" ? "bg-white/70 text-black" : "bg-live/80 text-white"}`}>
                  {r}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
