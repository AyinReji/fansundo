import { createFileRoute } from "@tanstack/react-router";
import { TeamCard } from "@/components/site/TeamCard";
import { TEAMS } from "@/data/teams";

export const Route = createFileRoute("/teams")({
  head: () => ({ meta: [{ title: "Teams · Aaravam 26" }, { name: "description", content: "All 48 nations of the 2026 World Cup." }] }),
  component: () => (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-8">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">48 nations</div>
        <h1 className="mt-1 font-display text-4xl md:text-5xl">All Teams</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {TEAMS.map((t) => <TeamCard key={t.slug} team={t} />)}
      </div>
    </div>
  ),
});
