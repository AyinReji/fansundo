/* =============================================================================
 * TeamPopup — premium nation modal opened from any team card or badge.
 *
 *  • Mobile  : full-height bottom Sheet (swipe-down to close via shadcn Sheet).
 *  • Desktop : centered Dialog with flag-themed header.
 *
 *  CONTENT
 *  -------
 *  - Header   : large flag art, name, FIFA code, nickname, supporter count,
 *               recent form pills.
 *  - Stats    : compact 8-cell stat grid (P, W, D, L, GF, GA, GD, Pts).
 *  - Squad    : player cards (2 / 3 / 4 cols responsive).
 *  - Achievements : titles · best finish · appearances.
 *  - Quick actions: View team page, View statistics, Close.
 *
 *  DATA SOURCES (current = manual, see future-API comments per block):
 *    Team meta + achievements  → src/data/teams.ts
 *    Squad / player photos     → src/data/players.ts  (silhouette fallback)
 *    Team statistics           → derived from matches in src/data/matches.ts
 *
 *  // Future API integration point:
 *  //   - replace deriveStandings() with /v1/standings response
 *  //   - replace PLAYERS_BY_TEAM with /v1/teams/:slug/squad response
 *  //   - swap player.photoUrl when CMS / API provides real headshots
 * ===========================================================================*/
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { FlagArt } from "@/components/site/FlagArt";
import { type Team, teamGradient } from "@/data/teams";
import { PLAYERS_BY_TEAM, type Player } from "@/data/players";
import { MATCHES } from "@/data/matches";
import { Users, Trophy, BarChart3, ExternalLink, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Props {
    team: Team | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Derive a compact W/D/L/GF/GA table from MATCHES so stats stay in sync with
// what the rest of the site shows (no separate spreadsheet to maintain).
function deriveStandings(slug: string) {
    let P = 0, W = 0, D = 0, L = 0, GF = 0, GA = 0;
    for (const m of MATCHES) {
        if (m.status !== "finished") continue;
        if (m.homeSlug !== slug && m.awaySlug !== slug) continue;
        P++;
        const isHome = m.homeSlug === slug;
        const gf = isHome ? m.homeScore : m.awayScore;
        const ga = isHome ? m.awayScore : m.homeScore;
        GF += gf; GA += ga;
        if (gf > ga) W++; else if (gf === ga) D++; else L++;
    }
    return { P, W, D, L, GF, GA, GD: GF - GA, Pts: W * 3 + D };
}

function FormPill({ r }: { r: "W" | "D" | "L" }) {
    const cls = r === "W" ? "bg-pitch text-black" : r === "D" ? "bg-white/80 text-black" : "bg-live text-white";
    return <span className={`grid h-6 w-6 place-items-center rounded font-sport text-[10px] font-bold ${cls}`}>{r}</span>;
}

function StatCell({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-lg bg-white/5 px-2 py-2.5 text-center">
            <div className="font-sport text-lg font-bold tabular-nums leading-none">{value}</div>
            <div className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
        </div>
    );
}

function PlayerCard({ p }: { p: Player }) {
    return (
        <div className="group overflow-hidden rounded-lg border border-border bg-card">
            {/* Photo / silhouette fallback. Photo source: player.photoUrl when wired. */}
            <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-white/[0.04] to-black/40">
                <svg viewBox="0 0 60 80" className="absolute inset-0 h-full w-full text-white/15" aria-hidden>
                    <circle cx="30" cy="22" r="11" fill="currentColor" />
                    <path d="M8 78 C8 52 22 44 30 44 C38 44 52 52 52 78 Z" fill="currentColor" />
                </svg>
                <div className="absolute left-1 top-1 rounded bg-black/60 px-1 py-px font-sport text-[9px] font-bold text-gold">
                    {p.position}
                </div>
            </div>
            <div className="p-1.5">
                <div className="truncate text-[11px] font-semibold leading-tight">{p.name}</div>
                <div className="mt-0.5 flex items-center justify-between text-[9px] text-muted-foreground">
                    <span><b className="font-sport text-foreground">{p.goals}</b>G</span>
                    <span><b className="font-sport text-foreground">{p.assists}</b>A</span>
                    <span><b className="font-sport text-foreground">{p.appearances}</b>Ap</span>
                </div>
            </div>
        </div>
    );
}

function PopupBody({ team, onClose }: { team: Team; onClose: () => void }) {
    const standings = useMemo(() => deriveStandings(team.slug), [team.slug]);
    const squad = PLAYERS_BY_TEAM[team.slug] ?? [];

    return (
        <div className="flex h-full flex-col">
            {/* ===== Header ===== */}
            <header className="relative isolate overflow-hidden">
                {/* Large flag art as the design itself */}
                <div className="relative aspect-[16/8] w-full overflow-hidden sm:aspect-[16/6]">
                    <FlagArt slug={team.slug} className="absolute inset-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                            <div className="min-w-0">
                                <div className="font-display text-[11px] uppercase tracking-[0.22em] text-gold">
                                    Group {team.group} · {team.code}
                                </div>
                                <h2 className="mt-1 truncate font-display text-3xl text-white drop-shadow md:text-5xl">{team.name}</h2>
                                <div className="mt-1 text-sm italic text-white/80">{team.nickname}</div>
                            </div>
                            <div className="shrink-0 rounded-full glass-strong px-3 py-1.5 text-xs text-white">
                                <Users className="mr-1 inline h-3 w-3" />
                                {team.supporters.toLocaleString()}
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-widest text-white/70">Form</span>
                            <div className="flex gap-1">{team.form.map((r, i) => <FormPill key={i} r={r} />)}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== Scrollable body ===== */}
            <div className="flex-1 overflow-y-auto px-5 pb-28 pt-5 md:px-6">
                {/* Stats grid (manual data, derived from MATCHES) */}
                <section>
                    <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold">
                        <BarChart3 className="h-3.5 w-3.5" /> Statistics
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                        <StatCell label="Played" value={standings.P} />
                        <StatCell label="Wins" value={standings.W} />
                        <StatCell label="Draws" value={standings.D} />
                        <StatCell label="Losses" value={standings.L} />
                        <StatCell label="GF" value={standings.GF} />
                        <StatCell label="GA" value={standings.GA} />
                        <StatCell label="GD" value={standings.GD > 0 ? `+${standings.GD}` : standings.GD} />
                        <StatCell label="Points" value={standings.Pts} />
                    </div>
                </section>

                {/* Achievements */}
                <section className="mt-7">
                    <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold">
                        <Trophy className="h-3.5 w-3.5" /> Achievements
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl border border-border glass p-4">
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">World Cup Titles</div>
                            <div className="mt-1 font-sport text-3xl font-bold text-gradient-gold tabular-nums">{team.achievements.titles}</div>
                        </div>
                        <div className="rounded-xl border border-border glass p-4">
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Best Finish</div>
                            <div className="mt-1 text-sm font-semibold">{team.achievements.bestFinish}</div>
                        </div>
                        <div className="rounded-xl border border-border glass p-4">
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Appearances</div>
                            <div className="mt-1 font-sport text-3xl font-bold tabular-nums">{team.achievements.appearances}</div>
                        </div>
                    </div>
                </section>

                {/* Squad — primary section */}
                <section className="mt-7">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold">
                            <Users className="h-3.5 w-3.5" /> Squad
                        </div>
                        <div className="text-[10px] text-muted-foreground">{squad.length} players shown</div>
                    </div>
                    {squad.length ? (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8">
                            {squad.map((p) => <PlayerCard key={p.id} p={p} />)}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Squad list not available yet.</p>
                    )}
                </section>
            </div>

            {/* ===== Sticky action bar ===== */}
            <footer className="absolute inset-x-0 bottom-0 border-t border-border bg-background/95 px-5 py-3 backdrop-blur md:px-6"
                style={{ boxShadow: `0 -20px 60px -10px ${team.colors[0]}33` }}>
                <div className="flex items-center gap-2">
                    <Button asChild className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90">
                        <Link to="/teams/$slug" params={{ slug: team.slug }} onClick={onClose}>
                            <ExternalLink className="mr-1.5 h-4 w-4" /> View Team Page
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-border">
                        <Link to="/statistics" onClick={onClose}><BarChart3 className="mr-1.5 h-4 w-4" /> Statistics</Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}

export function TeamPopup({ team, open, onOpenChange }: Props) {
    const isMobile = useIsMobile();
    if (!team) return null;

    // Mobile: bottom Sheet for native-feel, swipe affordance.
    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="bottom"
                    className="h-[92svh] max-h-[92svh] rounded-t-3xl border-border bg-background p-0"
                    style={{ background: `linear-gradient(180deg, ${team.colors[0]}22 0%, transparent 30%), var(--color-background)` }}
                >
                    <VisuallyHidden>
                        <SheetTitle>{team.name}</SheetTitle>
                        <SheetDescription>Team details, statistics and squad for {team.name}.</SheetDescription>
                    </VisuallyHidden>
                    {/* Swipe handle */}
                    <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-white/20" />
                    <PopupBody team={team} onClose={() => onOpenChange(false)} />
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop: centered dialog.
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-h-[90vh] max-w-4xl overflow-hidden border-border bg-background p-0 sm:rounded-3xl"
                style={{ background: `linear-gradient(180deg, ${team.colors[0]}22 0%, transparent 30%), var(--color-background)` }}
            >
                <VisuallyHidden>
                    <DialogTitle>{team.name}</DialogTitle>
                    <DialogDescription>Team details, statistics and squad for {team.name}.</DialogDescription>
                </VisuallyHidden>
                <div className="relative h-[85vh]" style={{ background: teamGradient(team).replace(/\)$/, `, ${team.colors[0]} 200%)`) }}>
                    <div className="absolute inset-0 bg-background/92" />
                    <div className="relative h-full">
                        <PopupBody team={team} onClose={() => onOpenChange(false)} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
