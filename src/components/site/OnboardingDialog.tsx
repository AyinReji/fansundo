import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TEAMS, teamGradient, type Team } from "@/data/teams";
import { getFan, saveFan, validateUsername } from "@/lib/onboarding";
import { toast } from "sonner";
import { Check, Search } from "lucide-react";

/** First-launch onboarding: pick team -> pick username -> save. */
export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [team, setTeam] = useState<Team | null>(null);
  const [username, setUsername] = useState("");
  const [query, setQuery] = useState("");

  // Decide whether to open on mount and respond to programmatic clears.
  useEffect(() => {
    const refresh = () => setOpen(!getFan());
    refresh();
    window.addEventListener("aaravam:fan-updated", refresh);
    return () => window.removeEventListener("aaravam:fan-updated", refresh);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEAMS;
    return TEAMS.filter((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
  }, [query]);

  const userError = step === 2 ? validateUsername(username) : null;



  const submit = async () => {
    if (!team) return;
    const err = validateUsername(username);
    if (err) { toast.error(err); return; }
    await saveFan({ username: username.trim(), teamSlug: team.slug });
    toast.success(`Welcome to the arena, ${username}!`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && getFan()) setOpen(false); }}>
      <DialogContent className="max-w-3xl border-border bg-background/95 p-0">
        <div className="relative overflow-hidden p-6 md:p-8">
          <div className="floodlight pointer-events-none absolute inset-x-0 -top-10 h-32" />
          <DialogHeader>
            <DialogTitle className="font-mal text-3xl font-extrabold text-gradient-gold">
              {step === 1 ? "ടീം തിരഞ്ഞെടുക്കൂ" : "നിങ്ങളുടെ പേര്"}
            </DialogTitle>
            <DialogDescription>
              {step === 1
                ? "Pick the nation you'll wear. You can only choose once — make it count."
                : "Pick a username. Only letters, numbers and underscore."}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="mt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search 48 teams…" className="pl-9 bg-white/5" />
              </div>
              <div className="grid max-h-[55vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
                {filtered.map((t) => {
                  const selected = team?.slug === t.slug;
                  return (
                    <button key={t.slug} onClick={() => setTeam(t)}
                      className={`group relative flex items-center gap-2 overflow-hidden rounded-xl border p-3 text-left transition-all ${selected ? "border-gold ring-2 ring-gold/40" : "border-border hover:border-gold/40"}`}
                      style={{ background: teamGradient(t) }}>
                      <span className="absolute inset-0 bg-black/55" />
                      <span className="relative text-xl">{t.flag}</span>
                      <span className="relative truncate text-sm font-semibold text-white">{t.name}</span>
                      {selected && <Check className="relative ml-auto h-4 w-4 text-gold" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <Button disabled={!team} onClick={() => setStep(2)}
                  className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && team && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-3 rounded-xl border border-border p-3"
                style={{ background: teamGradient(team) }}>
                <span className="absolute" />
                <span className="text-2xl">{team.flag}</span>
                <div className="font-semibold text-white drop-shadow">{team.name}</div>
                <button onClick={() => setStep(1)} className="ml-auto text-xs font-semibold text-white/80 hover:text-white underline">change</button>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Username</label>
                <Input autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="kochi_ultras" className="bg-white/5" />
                {userError && <p className="mt-1.5 text-xs text-destructive">{userError}</p>}
              </div>
              <div className="rounded-lg border border-border bg-white/[0.02] p-3 text-xs text-muted-foreground">
                By continuing you agree to our community rules. Be kind. No spam. No abuse.
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={submit} className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold">
                  Join the arena
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
