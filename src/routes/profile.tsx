import { createFileRoute, Link } from "@tanstack/react-router";
import { useFan } from "@/hooks/useFan";
import { getTeam } from "@/data/teams";
import { clearFan } from "@/lib/onboarding";
import { FlagArt } from "@/components/site/FlagArt";
import { useTeamPopup } from "@/components/site/TeamPopupProvider";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · Aaravam 26" }] }),
  component: Profile,
});

function Profile() {
  const fan = useFan();
  const { openBySlug } = useTeamPopup();
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
      <button onClick={() => openBySlug(team.slug)} className="group relative block w-full overflow-hidden rounded-3xl border border-border text-left shadow-stadium">
        <div className="aspect-[16/7] w-full">
          <FlagArt slug={team.slug} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="font-display text-4xl text-white drop-shadow">{fan.username}</div>
          <div className="text-sm text-white/85">Supporter of <span className="font-semibold">{team.name}</span> · <span className="italic">{team.nickname}</span></div>
        </div>
      </button>
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
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border glass p-5">
      <div className="text-[10px] uppercase tracking-widest text-gold">{label}</div>
      <div className="mt-2 font-sport text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
