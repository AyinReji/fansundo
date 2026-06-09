import { createFileRoute, Link } from "@tanstack/react-router";
import { useFan } from "@/hooks/useFan";
import { getTeam, teamGradient } from "@/data/teams";
import { clearFan } from "@/lib/onboarding";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · Aaravam 26" }] }),
  component: () => {
    const fan = useFan();
    if (!fan) return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl">No profile yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">Complete onboarding to see your fan dashboard.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground">Get started</Link>
      </div>
    );
    const team = getTeam(fan.teamSlug)!;
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border p-8 shadow-stadium" style={{ background: teamGradient(team) }}>
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative">
            <div className="text-6xl">{team.flag}</div>
            <div className="mt-3 font-display text-4xl text-white">{fan.username}</div>
            <div className="text-sm text-white/80">Supporter of {team.name}</div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Rank" value="—" />
          <Stat label="Points" value="0" />
          <Stat label="Streak" value="1 day" />
        </div>
        <button onClick={() => { clearFan(); }} className="mt-10 text-sm text-muted-foreground hover:text-foreground underline">
          Reset onboarding
        </button>
      </div>
    );
  },
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border glass p-5">
      <div className="text-[10px] uppercase tracking-widest text-gold">{label}</div>
      <div className="mt-2 font-sport text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
