/* =============================================================================
 * TeamPopupProvider — global controller for the team popup.
 *
 *  Any component (TeamCard, TeamBadge in leaderboard rows, profile, arena
 *  username pills) can call `useTeamPopup().open(team)` to show the modal.
 *  A single instance lives at the root so it animates over any page.
 * ===========================================================================*/
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { TeamPopup } from "@/components/site/TeamPopup";
import { type Team, getTeam } from "@/data/teams";

interface Ctx {
    open: (team: Team) => void;
    openBySlug: (slug: string) => void;
}

const TeamPopupContext = createContext<Ctx | null>(null);

export function TeamPopupProvider({ children }: { children: ReactNode }) {
    const [team, setTeam] = useState<Team | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback((t: Team) => { setTeam(t); setIsOpen(true); }, []);
    const openBySlug = useCallback((slug: string) => {
        const t = getTeam(slug);
        if (t) { setTeam(t); setIsOpen(true); }
    }, []);

    const value = useMemo<Ctx>(() => ({ open, openBySlug }), [open, openBySlug]);

    return (
        <TeamPopupContext.Provider value={value}>
            {children}
            <TeamPopup team={team} open={isOpen} onOpenChange={setIsOpen} />
        </TeamPopupContext.Provider>
    );
}

export function useTeamPopup() {
    const ctx = useContext(TeamPopupContext);
    if (!ctx) throw new Error("useTeamPopup must be used within <TeamPopupProvider>");
    return ctx;
}
TeamPopupProvider.tsx

