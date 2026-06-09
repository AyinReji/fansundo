import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Users, Flame, MoreVertical, Flag, X } from "lucide-react";
import { useFan } from "@/hooks/useFan";
import { getTeam } from "@/data/teams";
import { liveMatch } from "@/data/matches";
import { chatConfig, MODERATION, REPORT_REASONS, type ReportReason } from "@/data/chatConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/arena")({
  head: () => ({ meta: [{ title: "Live Arena · Aaravam 26" }] }),
  component: Arena,
});

/* ──────────────────────────────────────────────────────────────
 *  CHAT MESSAGE MODEL
 * ──────────────────────────────────────────────────────────────
 *  state values:
 *    NORMAL         → visible normally
 *    UNDER_REVIEW   → 3+ reports, faded with notice
 *    HIDDEN         → 5+ reports, replaced by warning
 *    DELETED        → admin removed (future)
 */
type MsgState = "NORMAL" | "UNDER_REVIEW" | "HIDDEN" | "DELETED";

interface Msg {
  id: string;
  username: string;
  team_slug: string;
  content: string;
  ts: number;
  reactions: Record<string, number>; // emoji → count
}

/* Each report contains: { messageId, reportedBy, reason, timestamp }
 * Future: replace with Supabase `reports` table. */
interface Report {
  messageId: string;
  reportedBy: string;
  reason: ReportReason;
  detail?: string;
  ts: number;
}

const REACTIONS = ["🔥", "😂", "⚽"];

function Arena() {
  const fan = useFan();
  const m = liveMatch();
  const home = m ? getTeam(m.homeSlug)! : null;
  const away = m ? getTeam(m.awaySlug)! : null;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [online, setOnline] = useState(0);
  // reports: messageId -> Set of usernames who reported
  const [reports, setReports] = useState<Record<string, Set<string>>>({});
  const [reportTarget, setReportTarget] = useState<Msg | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSentRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  // Compute moderation state per message from report counts.
  const stateFor = useMemo(() => (id: string): MsgState => {
    const c = reports[id]?.size ?? 0;
    if (c >= MODERATION.HIDE_THRESHOLD) return "HIDDEN";
    if (c >= MODERATION.REVIEW_THRESHOLD) return "UNDER_REVIEW";
    return "NORMAL";
  }, [reports]);

  // Realtime arena (broadcast + presence). Disabled when chatConfig.enabled = false.
  useEffect(() => {
    if (!chatConfig.enabled) return;
    const ch = supabase.channel("arena:global", {
      config: { presence: { key: fan?.username ?? `guest_${Math.random().toString(36).slice(2, 6)}` } },
    });
    ch.on("broadcast", { event: "msg" }, (p) => {
      const incoming = p.payload as Msg;
      setMessages((prev) => [...prev.slice(-199), incoming]);
    });
    ch.on("broadcast", { event: "report" }, (p) => {
      const r = p.payload as Report;
      setReports((prev) => {
        const next = { ...prev };
        const set = new Set(next[r.messageId] ?? []);
        set.add(r.reportedBy);
        next[r.messageId] = set;
        return next;
      });
    });
    ch.on("presence", { event: "sync" }, () => {
      setOnline(Object.keys(ch.presenceState()).length);
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
    const msg: Msg = {
      id: crypto.randomUUID(),
      username: fan.username, team_slug: fan.teamSlug,
      content: body, ts: now, reactions: {},
    };
    await channelRef.current?.send({ type: "broadcast", event: "msg", payload: msg });
    setMessages((prev) => [...prev.slice(-199), msg]);
    setText("");
  };

  const react = (msg: Msg, emoji: string) => {
    setMessages((prev) =>
      prev.map((x) => x.id === msg.id ? { ...x, reactions: { ...x.reactions, [emoji]: (x.reactions[emoji] ?? 0) + 1 } } : x)
    );
  };

  const submitReport = (reason: ReportReason, detail?: string) => {
    if (!reportTarget || !fan) return;
    // Anti-abuse: cannot report own message, cannot report twice.
    if (reportTarget.username === fan.username) {
      toast.error("You can't report your own message"); return;
    }
    if (reports[reportTarget.id]?.has(fan.username)) {
      toast.info("You've already reported this message"); return;
    }
    const r: Report = { messageId: reportTarget.id, reportedBy: fan.username, reason, detail, ts: Date.now() };
    setReports((prev) => {
      const next = { ...prev };
      const set = new Set(next[r.messageId] ?? []);
      set.add(fan.username);
      next[r.messageId] = set;
      return next;
    });
    channelRef.current?.send({ type: "broadcast", event: "report", payload: r });
    setReportTarget(null);
    toast.success("Thank you for helping keep the Arena safe. This message will be reviewed.");
  };

  // Arena disabled view (chatConfig.enabled = false)
  if (!chatConfig.enabled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="text-6xl">🏟️</div>
        <h1 className="mt-4 font-display text-3xl">Fan Arena Closed</h1>
        <p className="mt-2 text-muted-foreground">Check back later — we open the gates around match time.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-6 lg:grid-cols-[1fr_320px]">
      <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-3xl border border-border glass-strong">
        {/* Arena header — reads from LIVE_MATCH */}
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

        {/* Chat transcript */}
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
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                mine={fan?.username === msg.username}
                state={stateFor(msg.id)}
                onReact={(e) => react(msg, e)}
                onReport={() => setReportTarget(msg)}
              />
            ))}
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
          <div className="text-[10px] uppercase tracking-widest text-gold">Last Match</div>
          {/* PLACEHOLDER — replace with realtime analytics later */}
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between"><span>Participants</span><span className="font-sport font-bold">3,204</span></li>
            <li className="flex justify-between"><span>Messages</span><span className="font-sport font-bold">12,840</span></li>
            <li className="flex justify-between"><span>Reactions</span><span className="font-sport font-bold">28,915</span></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border glass p-5 text-xs text-muted-foreground">
          Community moderation is active. Messages with {MODERATION.REVIEW_THRESHOLD}+ reports are reviewed; {MODERATION.HIDE_THRESHOLD}+ are hidden automatically.
        </div>
      </aside>

      {reportTarget && (
        <ReportModal
          msg={reportTarget}
          onClose={() => setReportTarget(null)}
          onSubmit={submitReport}
        />
      )}
    </div>
  );
}

/* ─── Chat bubble ─── */
function ChatBubble({ msg, mine, state, onReact, onReport }: {
  msg: Msg; mine: boolean; state: MsgState;
  onReact: (emoji: string) => void; onReport: () => void;
}) {
  const t = getTeam(msg.team_slug);
  const [menu, setMenu] = useState(false);

  if (state === "HIDDEN" || state === "DELETED") {
    return (
      <div className="flex justify-center">
        <div className="rounded-full bg-white/5 px-4 py-2 text-[11px] text-muted-foreground">
          ⚠️ Message removed by community moderation.
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex animate-float-up ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`relative max-w-[80%] rounded-2xl px-3.5 py-2 ${
        mine ? "bg-gold text-gold-foreground" : "bg-white/8 text-foreground"
      } ${state === "UNDER_REVIEW" ? "opacity-60" : ""}`}>
        <div className="flex items-center gap-1.5 text-[10px] opacity-80">
          {t && <span>{t.flag}</span>}
          <span className="font-semibold">{msg.username}</span>
        </div>
        <div className="mt-0.5 text-sm">{msg.content}</div>
        {state === "UNDER_REVIEW" && (
          <div className="mt-1 text-[10px] italic opacity-80">This message is under review.</div>
        )}

        {/* reactions + menu */}
        <div className="mt-1.5 flex items-center gap-1">
          {REACTIONS.map((e) => (
            <button key={e} onClick={() => onReact(e)}
              className={`rounded-full px-1.5 py-0.5 text-xs transition ${
                mine ? "bg-black/15 hover:bg-black/25" : "bg-white/10 hover:bg-white/20"
              }`}>
              {e}{msg.reactions[e] ? ` ${msg.reactions[e]}` : ""}
            </button>
          ))}
          {!mine && (
            <div className="relative">
              <button onClick={() => setMenu((v) => !v)}
                className="rounded-full p-1 text-foreground/70 hover:bg-white/10">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              {menu && (
                <div className="absolute right-0 top-7 z-10 min-w-[160px] rounded-xl border border-border bg-card p-1 shadow-lg">
                  <button
                    onClick={() => { setMenu(false); onReport(); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
                    <Flag className="h-3.5 w-3.5 text-live" /> Report Message
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Report modal ─── */
function ReportModal({ msg, onClose, onSubmit }: {
  msg: Msg; onClose: () => void;
  onSubmit: (reason: ReportReason, detail?: string) => void;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl">Report Message</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Help keep the Fan Arena safe and enjoyable.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/90">@{msg.username}</span>: {msg.content}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                reason === r ? "border-gold bg-gold/10 text-gold" : "border-border hover:bg-white/5"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {reason === "Other" && (
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value.slice(0, 280))}
            placeholder="Describe the issue..."
            className="mt-3 w-full rounded-lg border border-border bg-white/5 p-3 text-sm outline-none focus:border-gold"
            rows={3}
          />
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm hover:bg-white/5">Cancel</button>
          <button
            onClick={() => reason && onSubmit(reason, detail || undefined)}
            disabled={!reason || (reason === "Other" && !detail.trim())}
            className="rounded-full bg-live px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
