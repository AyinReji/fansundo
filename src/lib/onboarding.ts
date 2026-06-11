import { supabase } from "@/integrations/supabase/client";

/**
 * Onboarding state (favorite team + username) — persisted to localStorage.
 * Syncs identity anonymously to Supabase database.
 */
const KEY = "aaravam26:fan";

export interface FanIdentity {
  id: string;          // Generated userId (UUID)
  username: string;
  teamSlug: string;
  rulesAcceptedAt: string;
  deviceId: string;
}

const isBrowser = () => typeof window !== "undefined";

const newDeviceId = () =>
  (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));

export function getFan(): FanIdentity | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FanIdentity) : null;
  } catch {
    return null;
  }
}

export async function saveFan(input: Omit<FanIdentity, "rulesAcceptedAt" | "deviceId" | "id">): Promise<FanIdentity> {
  const existing = getFan();
  const next: FanIdentity = {
    ...input,
    id: existing?.id ?? crypto.randomUUID(),
    rulesAcceptedAt: existing?.rulesAcceptedAt ?? new Date().toISOString(),
    deviceId: existing?.deviceId ?? newDeviceId(),
  };

  // 1. Persist identity to the Supabase database first
  const { error } = await supabase.from("users").upsert({
    id: next.id,
    device_id: next.deviceId,
    username: next.username,
    selected_team: next.teamSlug,
  });

  if (error) {
    console.error("[Onboarding] Failed to sync anonymous user profile to Supabase:", error);
    if (error.code === "23505") {
      throw new Error("username_taken");
    }
    throw new Error("sync_failed");
  }

  // 2. Save to local storage only if database sync succeeds
  localStorage.setItem(KEY, JSON.stringify(next));

  window.dispatchEvent(new CustomEvent("aaravam:fan-updated"));
  return next;
}

export function clearFan() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("aaravam:fan-updated"));
}

/** Lightweight regex + length validation. */
export function validateUsername(u: string): string | null {
  if (!u) return "Pick a username";
  if (u.length < 3) return "Too short (min 3 characters)";
  if (u.length > 20) return "Too long (max 20 characters)";
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return "Only letters, numbers and _";
  return null;
}
