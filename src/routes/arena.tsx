import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Users, Flame } from "lucide-react";
import { useFan } from "@/hooks/useFan";
import { getTeam } from "@/data/teams";
import { liveMatch } from "@/data/matches";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/arena")({
  head: () => ({ meta: [{ title: "Live Arena · Aaravam 26" }] }),
  component: Arena,
});

interface Msg { id: string; username: string; team_slug: string; content: string; ts: number; }

function Arena() {
  const fan = useFan();
  const m = liveMatch();
  const home = m ? getTeam(m.homeSlug)! : null;
  const away = m ? getTeam(m.awaySlug)! : null;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [online, setOnline] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSentRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  // Single global Arena room — broadcast + presence. No DB write in v1.
  useEffect(() => {
    const ch = supabase.channel("arena:global", { config: { presence: { key: fan?.username ?? `guest_${Math.random().toString(36).slice(2, 6)}` } } });
    ch.on("broadcast", { event: "msg" }, (p) => {
      const m = p.payload as Msg;
      setMessages((prev) => [...prev.slice(-199), m]);
    });
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState();
      setOnline(Object.keys(state).length);
    });
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ team: fan?.teamSlug ?? "none", at: Date.now() });
      }
    });
    channelRef.current = ch;
    return () => { ch.unsubscribe(); };
  }, [fan?.username, fan?.teamSlug]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async () => {
    if (!fan) { toast.error("Pick your team & username first"); return; }
    const body = text.trim();
    if (!body) return;
    const now = Date.now();
    if (now - lastSentRef.current < 3000) { toast.warning("Slow down — 1 message every 3 seconds"); return; }
    lastSentRef.current = now;
    const msg: Msg = { id: crypto.randomUUID(), username: fan.username, team_slug: fan.teamSlug, content: body, ts: now };
    await channelRef.current?.send({ type: "broadcast", event: "msg", payload: msg });
    setMessages((prev) => [...prev.slice(-199), msg]);
    setText("");
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-6 lg:grid-cols-[1fr_320px]">
      <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-3xl border border-border glass-strong">
        {/* Arena header */}
        <div className="relative overflow-hidden border-b border-border p-5">
          <div className="floodlight absolute inset-x-0 top-0 h-16" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            {m && home && away ? (
              <div className="flex items-center gap-4">
                <span className="live-dot text-[11px] font-bold uppercase tracking-widest text-live">Live</span>
                <span className="font-display text-xl">{home.flag} {home.code}</span>
                <span className="font-sport text-2xl font-extrabold tabular-nums">{m.homeScore} – {m.awayScore}</span>
                <span className="font-display text-xl">{away.code} {away.flag}</span>
                <span className="font-sport text-sm text-muted-foreground">{m.minute}'</span>
              </div>
            ) : <div className="font-display text-xl">Global Arena</div>}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {online} online</span>
              <span className="inline-flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange" /> {messages.length} msg</span>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <div>
                <div className="text-4xl">🏟️</div>
                <p className="mt-2">Be the first to roar. Drop a message.</p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {messages.map((msg) => {
              const t = getTeam(msg.team_slug);
              const mine = fan?.username === msg.username;
              return (
                <div key={msg.id} className={`flex animate-float-up ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${mine ? "bg-gold text-gold-foreground" : "bg-white/8 text-foreground"}`}>
                    <div className="flex items-center gap-1.5 text-[10px] opacity-80">
                      {t && <span>{t.flag}</span>}
                      <span className="font-semibold">{msg.username}</span>
                    </div>
                    <div className="mt-0.5 text-sm">{msg.content}</div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder={fan ? "Say something…" : "Join first to chat"}
              disabled={!fan}
              className="w-full rounded-full bg-white/5 px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-gold disabled:opacity-50"
            />
            <button onClick={send} disabled={!fan || !text.trim()}
              className="grid h-11 w-11 place-items-center rounded-full bg-gold text-gold-foreground disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border glass p-5">
          <div className="text-[10px] uppercase tracking-widest text-gold">Current Match</div>
          {m && home && away ? (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>{home.flag} {home.name}</span><span className="font-sport font-bold">{m.homeScore}</span></div>
              <div className="flex items-center justify-between"><span>{away.flag} {away.name}</span><span className="font-sport font-bold">{m.awayScore}</span></div>
              <div className="pt-2 text-xs text-muted-foreground">{m.venue}</div>
            </div>
          ) : <p className="mt-3 text-sm text-muted-foreground">No live match.</p>}
        </div>
        <div className="rounded-2xl border border-border glass p-5">
          <div className="text-[10px] uppercase tracking-widest text-gold">Top Fans</div>
          <p className="mt-3 text-sm text-muted-foreground">See full leaderboard for the championship.</p>
        </div>
      </aside>
    </div>
  );
}
