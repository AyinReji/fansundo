/**
 * Onboarding state (favorite team + username) — persisted to localStorage.
 * v1 is client-only; auth-backed profile sync is wired in a later pass.
 */
const KEY = "aaravam26:fan";

export interface FanIdentity {
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

export function saveFan(input: Omit<FanIdentity, "rulesAcceptedAt" | "deviceId">): FanIdentity {
  const existing = getFan();
  const next: FanIdentity = {
    ...input,
    rulesAcceptedAt: existing?.rulesAcceptedAt ?? new Date().toISOString(),
    deviceId: existing?.deviceId ?? newDeviceId(),
  };
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
