/* =============================================================================
 * FAN ARENA — MANUAL CHAT CONTROL
 * -----------------------------------------------------------------------------
 * Toggle the Arena open/closed from this single file.
 *   enabled: true   →  Chat visible, fans can post.
 *   enabled: false  →  Arena is shown as "closed". No messages can be sent.
 *
 * Owner workflow:
 *   • Enable shortly BEFORE a match starts.
 *   • Disable AFTER the match wraps up (or anytime you need a cool-down).
 * ===========================================================================*/

export const chatConfig = {
  enabled: true,
};

/* =============================================================================
 * COMMUNITY MODERATION THRESHOLDS
 * -----------------------------------------------------------------------------
 * Every chat message can be reported. The Arena auto-moderates based on the
 * number of unique reports — no admin required.
 *
 *   reports >= REVIEW_THRESHOLD   →  message faded, "under review" label
 *   reports >= HIDE_THRESHOLD     →  message hidden, replaced by warning
 *
 * Future: replace local in-memory store with a Supabase `reports` table.
 * ===========================================================================*/

export const MODERATION = {
  REVIEW_THRESHOLD: 3,  // faded + "under review" copy
  HIDE_THRESHOLD: 5,    // fully hidden by community moderation
};

/** Selectable reasons in the report modal. "other" reveals a free-text box. */
export const REPORT_REASONS = [
  "Spam",
  "Abusive Language",
  "Harassment",
  "Hate Speech",
  "Bullying",
  "Offensive Content",
  "Misleading Information",
  "Trolling",
  "Other",
] as const;

export type ReportReason = typeof REPORT_REASONS[number];
