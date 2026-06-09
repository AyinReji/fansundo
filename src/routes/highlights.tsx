import { createFileRoute } from "@tanstack/react-router";
import { MATCHES } from "@/data/matches";
import { getTeam } from "@/data/teams";

export const Route = createFileRoute("/highlights")({
  head: () => ({ meta: [{ title: "Highlights · Aaravam 26" }] }),
  component: () => {
    const finished = MATCHES.filter((m) => m.status === "finished");
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h1 className="mb-6 font-display text-4xl">Highlights</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {finished.map((m) => {
            const h = getTeam(m.homeSlug)!, a = getTeam(m.awaySlug)!;
            return (
              <div key={m.id} className="overflow-hidden rounded-2xl border border-border glass">
                <div className="aspect-video bg-black">
                  <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${m.highlightYoutubeId}`} title={`${h.name} vs ${a.name}`} loading="lazy" allowFullScreen />
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="font-display">{h.flag} {h.code} <span className="font-sport mx-2">{m.homeScore}-{m.awayScore}</span> {a.code} {a.flag}</span>
                  <span className="text-xs text-muted-foreground">{m.stage}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
