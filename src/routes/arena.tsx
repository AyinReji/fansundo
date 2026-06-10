import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Users, Flame, MoreVertical, Flag, X, Shield, VolumeX, UserCheck, Eye } from "lucide-react";
import { useFan } from "@/hooks/useFan";
import { getTeam, teamGradient } from "@/data/teams";
import { liveMatch } from "@/data/matches";
import { chatConfig, MODERATION, REPORT_REASONS, type ReportReason } from "@/data/chatConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/arena")({
  head: () => ({ meta: [{ title: "Live Arena · Aaravam 26" }] }),
  component: Arena,
});

/* ──────────────────────────────────────────────────────────────
 * CHAT MESSAGE MODEL
 * ──────────────────────────────────────────────────────────────
 * Maps precisely to the Supabase `messages` table schema.
 * Possible message states:
 *   NORMAL       → Displayed normally to everyone.
 *   UNDER_REVIEW → Faded style with warning, 3+ community reports.
 *   HIDDEN       → Auto-hidden from regular view, 5+ community reports.
 *   DELETED      → Admin explicitly removed.
 */
type MsgState = "NORMAL" | "UNDER_REVIEW" | "HIDDEN" | "DELETED";

interface Msg {
  id: string;
  user_id: string;
  device_id: string;
  username: string;
  team: string; // selected team slug (e.g. 'argentina')
  message: string;
  reported_count: number;
  status: MsgState;
  created_at: string;
}

const REACTIONS = ["🔥", "😂", "⚽", "👏", "🏆"];

function Arena() {
  const fan = useFan();
  const m = liveMatch();
  const home = m ? getTeam(m.homeSlug)! : null;
  const away = m ? getTeam(m.awaySlug)! : null;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [online, setOnline] = useState(0);
  const [teamOnlineCounts, setTeamOnlineCounts] = useState<Record<string, number>>({});
  const [reportTarget, setReportTarget] = useState<Msg | null>(null);
  
  // Track reports locally to prevent double reporting in UI immediately
  const [myReports, setMyReports] = useState<Set<string>>(new Set());
  
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSentRef = useRef(0);
  const lastMessageTextRef = useRef("");
  const endRef = useRef<HTMLDivElement>(null);

  // 1. FETCH HISTORICAL MESSAGES ON MOUNT
  useEffect(() => {
    if (!chatConfig.enabled) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error loading chat history:", error);
          toast.error("Failed to load stadium chat history");
        } else if (data) {
          // Reverse to show chronologically (oldest at top, newest at bottom)
          setMessages(data.reverse());
        }
      } catch (err) {
        console.error("Exception loading chat history:", err);
      }
    };

    fetchMessages();
  }, []);

  // 2. SUPABASE REALTIME & PRESENCE SETUP
  useEffect(() => {
    if (!chatConfig.enabled) return;

    // Create a single global channel for Realtime & Presence
    const ch = supabase.channel("arena:global", {
      config: {
        presence: {
          key: fan?.id ?? `guest_${Math.random().toString(36).slice(2, 8)}`,
        },
      },
    });

    // Handle Realtime messages insertion & status transitions
    ch.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages" },
      (payload) => {
        if (payload.eventType === "INSERT") {
          const incoming = payload.new as Msg;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((msg) => msg.id === incoming.id)) return prev;
            return [...prev.slice(-199), incoming];
          });
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as Msg;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updated.id ? updated : msg))
          );
        }
      }
    );

    // Sync Presence updates to count online users and build team statistics
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState();
      
      // Compute total online users
      const totalOnline = Object.keys(state).length;
      setOnline(totalOnline);

      // Compute online user breakdown by team
      const counts: Record<string, number> = {};
      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => {
          if (p.team && p.team !== "none") {
            counts[p.team] = (counts[p.team] || 0) + 1;
          }
        });
      });
      setTeamOnlineCounts(counts);
    });

    // Subscribe to database changes and track online presence
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({
          id: fan?.id ?? "guest",
          username: fan?.username ?? "Anonymous Fan",
          team: fan?.teamSlug ?? "none",
          onlineAt: new Date().toISOString(),
        });
      }
    });

    channelRef.current = ch;

    return () => {
      ch.unsubscribe();
    };
  }, [fan?.id, fan?.username, fan?.teamSlug]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // 3. ANTI-ABUSE & SPAM PREVENTION LOGIC
  const validateAndSend = async () => {
    if (!fan) {
      toast.error("Pick your team & username first!");
      return;
    }

    const body = text.trim();
    if (!body) return;

    // Message length constraint
    if (body.length < 2) {
      toast.warning("Message is too short (minimum 2 characters)");
      return;
    }
    if (body.length > 300) {
      toast.warning("Message is too long (maximum 300 characters)");
      return;
    }

    // Client-side rate limit: 1 message every 3 seconds
    const now = Date.now();
    if (now - lastSentRef.current < 3000) {
      toast.warning("Slow down! 1 message every 3 seconds.");
      return;
    }

    // Repeated message spam check
    if (body.toLowerCase() === lastMessageTextRef.current.toLowerCase()) {
      toast.warning("Spam prevention: Repeated messages are blocked!");
      return;
    }

    // Repeated emojis block (5+ identical consecutive emojis)
    const emojiFloodRegex = /(\p{Emoji_Presentation})\1{4,}/gu;
    if (emojiFloodRegex.test(body)) {
      toast.warning("Spam prevention: Emoji flooding is blocked!");
      return;
    }

    // Simple flooding check (excessive capitalization spam)
    const upperCaseCount = (body.match(/[A-Z]/g) || []).length;
    if (body.length > 10 && upperCaseCount / body.length > 0.8) {
      toast.warning("Spam prevention: ALL CAPS flooding is blocked!");
      return;
    }

    lastSentRef.current = now;
    lastMessageTextRef.current = body;

    const payload = {
      user_id: fan.id,
      device_id: fan.deviceId,
      username: fan.username,
      team: fan.teamSlug,
      message: body,
      reported_count: 0,
      status: "NORMAL" as const,
    };

    // Store in Supabase, Realtime channel will broadcast to us and others
    try {
      const { error } = await supabase.from("messages").insert(payload);
      if (error) {
        console.error("Error sending message:", error);
        toast.error("Stadia connection error. Failed to send.");
      } else {
        setText("");
      }
    } catch (err) {
      console.error("Exception sending message:", err);
    }
  };

  // 4. REPORT SYSTEM LOGIC
  const submitReport = async (reason: ReportReason, detail?: string) => {
    if (!reportTarget || !fan) return;

    // Cannot report own message
    if (reportTarget.username === fan.username) {
      toast.error("You cannot report your own message!");
      setReportTarget(null);
      return;
    }

    // Cannot report twice
    if (myReports.has(reportTarget.id)) {
      toast.info("You have already reported this message!");
      setReportTarget(null);
      return;
    }

    try {
      // Invoke secure stored procedure which handles database safety, increments, thresholds & moderation logging
      const { error } = await supabase.rpc("report_message", {
        _message_id: reportTarget.id,
        _reported_by: fan.username,
        _reason: reason + (detail ? `: ${detail}` : ""),
      });

      if (error) {
        if (error.message.includes("unique_conflict") || error.code === "23505") {
          toast.info("You have already reported this message!");
        } else {
          console.error("Error submitting report:", error);
          toast.error("Failed to submit report. Please try again.");
        }
      } else {
        // Track locally to avoid repeat calls
        setMyReports((prev) => new Set([...prev, reportTarget.id]));
        toast.success("Thank you. The community moderators have received your report.");
      }
    } catch (err) {
      console.error("Exception submitting report:", err);
    }

    setReportTarget(null);
  };

  // FUTURE-READY ADMIN CONTROLS (Structure Placeholder)
  const handleAdminAction = async (action: "delete" | "mute" | "ban" | "restore", targetId: string) => {
    // Check role or authorization locally/backend before proceeding
    toast.info(`Admin Action [${action}] initiated for target: ${targetId}`);
  };

  // 5. RENDER STADIUM CLOSURE
  if (!chatConfig.enabled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="text-7xl animate-pulse">🏟️</div>
        <h1 className="mt-6 font-display text-4xl text-gradient-gold">Fan Arena Closed</h1>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          The gates are closed right now. Check back later — we open the Fan Arena shortly before match times!
        </p>
      </div>
    );
  }

  // Pre-compiled list of top teams to show presence status
  const featuredTeams = [
    { slug: "argentina", name: "Argentina", flag: "🇦🇷" },
    { slug: "brazil", name: "Brazil", flag: "🇧🇷" },
    { slug: "france", name: "France", flag: "🇫🇷" },
    { slug: "germany", name: "Germany", flag: "🇩🇪" },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-6 lg:grid-cols-[1fr_320px] relative">
      {/* Stadium grass textures and lighting effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,120,60,0.15),transparent)] pointer-events-none" />

      {/* Main Chat Interface */}
      <section className="flex min-h-[75vh] max-h-[85vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#081511]/90 shadow-2xl relative">
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-emerald-950/20 to-transparent pointer-events-none" />

        {/* Live Match Floodlight Header */}
        <div className="relative overflow-hidden border-b border-white/10 p-5 bg-[#0a1b15]/80 backdrop-blur-md">
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-r from-cyan-500/10 via-amber-500/10 to-emerald-500/10 blur-xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            {m && home && away ? (
              <div className="flex items-center gap-4">
                <span className="live-dot text-[11px] font-bold uppercase tracking-widest text-live bg-live/15 px-2 py-0.5 rounded-full border border-live/30 animate-pulse">Live</span>
                <span className="font-display text-xl text-white">{home.flag} {home.code}</span>
                <span className="font-sport text-2xl font-extrabold text-white tabular-nums tracking-wider">{m.homeScore} – {m.awayScore}</span>
                <span className="font-display text-xl text-white">{away.code} {away.flag}</span>
                <span className="font-sport text-sm text-amber-500 font-semibold">{m.minute}'</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-display text-lg tracking-wide text-white uppercase">Global Fan Arena</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <strong className="text-white font-bold">{online}</strong> fans inside
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                <Flame className="h-3.5 w-3.5 text-orange animate-bounce" />
                <strong className="text-white">{messages.length}</strong> chants
              </span>
            </div>
          </div>
        </div>

        {/* Message Transcript Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[url('/grass-pattern.png')] bg-repeat bg-opacity-5">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-slate-400">
              <div className="space-y-3">
                <div className="text-5xl animate-bounce">⚽</div>
                <h3 className="text-white font-semibold">Stadium is silent!</h3>
                <p className="text-xs max-w-xs leading-relaxed">Be the first to chant and spark the crowd atmosphere!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  mine={fan?.username === msg.username}
                  onReact={(emoji) => {
                    // Locally boost reactions for immediate premium visual response
                    toast.success(`Reacted with ${emoji}`);
                  }}
                  onReport={() => setReportTarget(msg)}
                  onAdminAction={handleAdminAction}
                />
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Composer Input Field */}
        <div className="border-t border-white/10 p-4 bg-[#091814]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") validateAndSend();
              }}
              placeholder={fan ? `Chant for ${getTeam(fan.teamSlug)?.name ?? "your team"}...` : "Join the stadium first to send chants"}
              disabled={!fan}
              maxLength={300}
              className="w-full rounded-2xl bg-white/5 px-5 py-3 text-sm text-white outline-none border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold/30 disabled:opacity-50 placeholder-slate-400 transition"
            />
            <button
              onClick={validateAndSend}
              disabled={!fan || !text.trim()}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold text-gold-foreground font-bold hover:bg-gold-light disabled:opacity-40 shadow-lg transition active:scale-95"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          {fan && (
            <div className="mt-2 flex justify-between items-center px-1 text-[10px] text-slate-500">
              <span>Press enter to send</span>
              <span className={text.length > 250 ? "text-amber-500" : ""}>{text.length}/300 chars</span>
            </div>
          )}
        </div>
      </section>

      {/* Sidebar Analytics & Moderation Info */}
      <aside className="space-y-4">
        {/* Total Fans Breakdown */}
        <div className="rounded-3xl border border-white/10 bg-[#081511]/80 p-5 shadow-lg backdrop-blur-sm">
          <h3 className="text-xs uppercase tracking-widest text-gold font-bold">🏟️ Live Fan Presence</h3>
          <div className="mt-4 space-y-3">
            {featuredTeams.map((t) => {
              const count = teamOnlineCounts[t.slug] || 0;
              return (
                <div key={t.slug} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-white">
                    <span className="text-lg">{t.flag}</span>
                    <span>{t.name}</span>
                  </span>
                  <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold tabular-nums">
                    {count} online
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Match Info */}
        <div className="rounded-3xl border border-white/10 bg-[#081511]/80 p-5 shadow-lg backdrop-blur-sm">
          <h3 className="text-xs uppercase tracking-widest text-gold font-bold">Current Match</h3>
          {m && home && away ? (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-white">
                <span className="flex items-center gap-2">
                  <span>{home.flag}</span>
                  <span className="font-semibold">{home.name}</span>
                </span>
                <span className="font-sport font-bold text-lg text-gold">{m.homeScore}</span>
              </div>
              <div className="flex items-center justify-between text-white">
                <span className="flex items-center gap-2">
                  <span>{away.flag}</span>
                  <span className="font-semibold">{away.name}</span>
                </span>
                <span className="font-sport font-bold text-lg text-gold">{m.awayScore}</span>
              </div>
              <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex justify-between">
                <span>📍 {m.venue}</span>
                <span className="text-amber-500 font-semibold">{m.minute}' played</span>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">No live matches in progress right now.</p>
          )}
        </div>

        {/* Community Moderation Info Box */}
        <div className="rounded-3xl border border-white/10 bg-[#081511]/80 p-5 text-xs text-slate-400 leading-relaxed shadow-lg backdrop-blur-sm space-y-2">
          <div className="flex items-center gap-2 text-gold font-semibold uppercase tracking-wider text-[10px]">
            <Shield className="h-3.5 w-3.5" />
            <span>Community Rules</span>
          </div>
          <p>This arena runs on community self-moderation. Any user can flag messages containing spam, trolling, or abusive text.</p>
          <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px]">
            <li><strong>{MODERATION.REVIEW_THRESHOLD}+ reports</strong> flags message under review.</li>
            <li><strong>{MODERATION.HIDE_THRESHOLD}+ reports</strong> hides the message automatically.</li>
          </ul>
        </div>
      </aside>

      {/* Report Modal Popup */}
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

/* ──────────────────────────────────────────────────────────────
 * CHAT BUBBLE COMPONENT
 * ────────────────────────────────────────────────────────────── */
function ChatBubble({
  msg,
  mine,
  onReact,
  onReport,
  onAdminAction,
}: {
  msg: Msg;
  mine: boolean;
  onReact: (emoji: string) => void;
  onReport: () => void;
  onAdminAction: (action: "delete" | "mute" | "ban" | "restore", targetId: string) => void;
}) {
  const t = getTeam(msg.team);
  const [menu, setMenu] = useState(false);

  // Hidden/deleted rendering states
  if (msg.status === "HIDDEN" || msg.status === "DELETED") {
    return (
      <div className="flex justify-center my-1">
        <div className="rounded-full bg-white/5 border border-white/5 px-4 py-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>⚠️</span>
          <span>Message removed by community moderation.</span>
        </div>
      </div>
    );
  }

  // Accent styling mapping
  const accentColor = t ? t.colors[0] : "#E2B13C";

  return (
    <div className={`group flex ${mine ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`relative max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md border ${
          mine
            ? "bg-gold text-gold-foreground border-gold/20"
            : "bg-[#0b1f1a] text-white border-white/5"
        } ${msg.status === "UNDER_REVIEW" ? "opacity-55" : ""}`}
      >
        {/* Username Header + Flag */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide opacity-80 mb-0.5">
          {t && <span className="text-sm">{t.flag}</span>}
          <span className="font-extrabold" style={{ color: mine ? undefined : accentColor }}>
            {msg.username}
          </span>
          <span className="text-[9px] opacity-60 text-slate-400">
            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Message body */}
        <div className="text-sm break-words leading-relaxed">{msg.message}</div>

        {/* Under Review text warning */}
        {msg.status === "UNDER_REVIEW" && (
          <div className="mt-1.5 text-[10px] font-semibold text-amber-500 italic flex items-center gap-1">
            <span>⚠️</span>
            <span>This message is under review.</span>
          </div>
        )}

        {/* Reactions List & Report Trigger */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          {REACTIONS.map((e) => (
            <button
              key={e}
              onClick={() => onReact(e)}
              className={`rounded-full px-2 py-0.5 text-xs transition active:scale-90 ${
                mine ? "bg-black/15 hover:bg-black/25 text-black" : "bg-white/5 hover:bg-white/10 text-white"
              }`}
            >
              {e}
            </button>
          ))}

          {!mine && (
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="rounded-full p-1 text-slate-400 hover:bg-white/10 transition"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              {menu && (
                <div className="absolute left-0 mt-1 z-20 min-w-[160px] rounded-xl border border-white/10 bg-slate-900 p-1 shadow-2xl">
                  <button
                    onClick={() => {
                      setMenu(false);
                      onReport();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-400 hover:bg-white/5"
                  >
                    <Flag className="h-3.5 w-3.5" /> Report Message
                  </button>

                  {/* Future Admin Actions Placeholder */}
                  <div className="border-t border-white/5 my-1" />
                  <button
                    onClick={() => {
                      setMenu(false);
                      onAdminAction("delete", msg.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[11px] text-slate-500 hover:bg-white/5"
                  >
                    <Shield className="h-3 w-3" /> Admin: Delete
                  </button>
                  <button
                    onClick={() => {
                      setMenu(false);
                      onAdminAction("mute", msg.device_id);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[11px] text-slate-500 hover:bg-white/5"
                  >
                    <VolumeX className="h-3 w-3" /> Admin: Mute
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

/* ──────────────────────────────────────────────────────────────
 * REPORT MODAL DIALOG COMPONENT
 * ────────────────────────────────────────────────────────────── */
function ReportModal({
  msg,
  onClose,
  onSubmit,
}: {
  msg: Msg;
  onClose: () => void;
  onSubmit: (reason: ReportReason, detail?: string) => void;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl text-white">Report Message</h3>
            <p className="mt-1 text-xs text-slate-400">Help preserve the stadium atmosphere.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 text-slate-400 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message preview snippet */}
        <div className="rounded-xl bg-white/5 border border-white/5 px-4 py-2.5 text-xs text-slate-300">
          <strong className="text-gold">@{msg.username}</strong>: <span className="italic">"{msg.message}"</span>
        </div>

        {/* Select reasons grid */}
        <div className="grid grid-cols-2 gap-2">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`rounded-xl border px-3 py-2 text-left text-xs transition duration-150 ${
                reason === r ? "border-gold bg-gold/10 text-gold font-semibold" : "border-white/5 bg-white/[0.02] text-slate-300 hover:border-gold/30"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Other text description option */}
        {reason === "Other" && (
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value.slice(0, 150))}
            placeholder="Tell us what's wrong with this..."
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none focus:border-gold"
            rows={3}
          />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-xs text-slate-400 hover:bg-white/5 transition">
            Cancel
          </button>
          <button
            onClick={() => reason && onSubmit(reason, detail || undefined)}
            disabled={!reason || (reason === "Other" && !detail.trim())}
            className="rounded-full bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-semibold text-white disabled:opacity-40 transition active:scale-95 shadow-md"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
