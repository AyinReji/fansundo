/* =============================================================================
 * AARAVAM 26 — MANUAL MATCH DATA (NO APIs)
 * -----------------------------------------------------------------------------
 * This file is the SINGLE SOURCE OF TRUTH for every football match shown on
 * the site. Everything (homepage live capsule, arena header, match centre,
 * highlights, statistics) reads from the data below.
 *
 *  HOW TO USE (non-technical owner guide)
 *  --------------------------------------
 *  1. To turn the LIVE banner ON  →  set LIVE_MATCH.enabled = true
 *  2. To turn the LIVE banner OFF →  set LIVE_MATCH.enabled = false
 *  3. To change the live teams    →  edit LIVE_MATCH.homeSlug / awaySlug
 *                                    (use a slug from src/data/teams.ts, e.g.
 *                                     "argentina", "brazil", "india")
 *  4. To update the score         →  edit LIVE_MATCH.homeScore / awayScore
 *  5. To update the minute        →  edit LIVE_MATCH.minute
 *  6. To change status            →  "LIVE" | "HALFTIME" | "FINISHED"
 *
 *  The matches in MATCHES[] are the full fixture list (upcoming + finished).
 *  Edit them like a spreadsheet. After a match ends, paste a YouTube ID into
 *  `highlightYoutubeId` so the highlights page can embed it.
 *
 *  FUTURE: when we wire an API, only the implementations in this file change.
 *  Components keep working unchanged.
 * ===========================================================================*/

import { TEAMS } from "./teams";

export type MatchStatus = "live" | "upcoming" | "finished";
export type LiveStatus = "LIVE" | "HALFTIME" | "FINISHED";

export interface Match {
  id: string;
  homeSlug: string;
  awaySlug: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute?: number;
  kickoff: string;        // ISO timestamp
  venue: string;
  stage: string;
  fansOnline?: number;
  highlightYoutubeId?: string; // ← paste YouTube video ID here after match
  // -----------------------------------------------------------------
  // PLACEHOLDER MATCH STATISTICS — replace with actual post-match data
  // -----------------------------------------------------------------
  stats?: MatchStats;
}

export interface MatchStats {
  possession: [number, number];    // [home%, away%]
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  manOfTheMatch?: string;
}

/* ─────────────────────────────────────────────────────────────────────────
 *  LIVE MATCH CONTROL — edit this block during a live game.
 *  Set `enabled: false` when no live match is in progress.
 * ───────────────────────────────────────────────────────────────────────── */
export const LIVE_MATCH = {
  enabled: true,            // ← set to false to hide the live banner everywhere
  homeSlug: "argentina",    // ← team slug from src/data/teams.ts
  awaySlug: "brazil",
  homeScore: 2,             // ← update after every goal
  awayScore: 1,
  minute: 78,               // ← update every few minutes
  status: "LIVE" as LiveStatus, // "LIVE" | "HALFTIME" | "FINISHED"
  venue: "MetLife Stadium, New Jersey",
  stage: "Group B",
  fansOnline: 2481,         // mock; replace with realtime later
};

const venues = [
  "MetLife Stadium, New Jersey", "AT&T Stadium, Dallas", "SoFi Stadium, Los Angeles",
  "Estadio Azteca, Mexico City", "BC Place, Vancouver", "Mercedes-Benz Stadium, Atlanta",
  "Lincoln Financial Field, Philadelphia", "Hard Rock Stadium, Miami",
];

/* ─────────────────────────────────────────────────────────────────────────
 *  FIXTURES — edit freely. Add / remove entries like rows in a spreadsheet.
 * ───────────────────────────────────────────────────────────────────────── */
export const MATCHES: Match[] = [
  // Upcoming matches — kickoff in the future
  ...[
    ["france", "germany", 3],
    ["spain", "portugal", 6],
    ["england", "netherlands", 9],
    ["morocco", "senegal", 12],
    ["japan", "south-korea", 22],
    ["mexico", "usa", 26],
    ["india", "uae", 30],
    ["belgium", "croatia", 34],
  ].map<Match>(([h, a, hours], i) => ({
    id: `m-up-${i}`,
    homeSlug: String(h), awaySlug: String(a),
    homeScore: 0, awayScore: 0,
    status: "upcoming",
    kickoff: new Date(Date.now() + Number(hours) * 3600 * 1000).toISOString(),
    venue: venues[i % venues.length],
    stage: i < 3 ? "Round of 16" : "Group Stage",
  })),
  // Finished matches — paste YouTube highlight IDs into `highlightYoutubeId`.
  ...[
    ["uruguay", "ghana", 2, 0, "8GtjV4kKddE"],
    ["colombia", "ecuador", 1, 1, "8GtjV4kKddE"],
    ["nigeria", "egypt", 3, 2, "8GtjV4kKddE"],
    ["chile", "peru", 0, 2, "8GtjV4kKddE"],
    ["australia", "iran", 1, 3, "8GtjV4kKddE"],
    ["canada", "panama", 4, 1, "8GtjV4kKddE"],
  ].map<Match>(([h, a, hs, as_, yt], i) => ({
    id: `m-fin-${i}`,
    homeSlug: String(h), awaySlug: String(a),
    homeScore: Number(hs), awayScore: Number(as_),
    status: "finished",
    kickoff: new Date(Date.now() - (i + 1) * 24 * 3600 * 1000).toISOString(),
    venue: venues[i % venues.length],
    stage: "Group Stage",
    highlightYoutubeId: String(yt),
    // Replace with actual post-match statistics
    stats: {
      possession: [52, 48], shots: [14, 9], shotsOnTarget: [6, 3],
      corners: [7, 4], yellowCards: [2, 3], redCards: [0, 0],
      manOfTheMatch: "Replace with player name",
    },
  })),
];

/**
 * Returns the current live match (as a Match object) IF LIVE_MATCH.enabled.
 * Synthesised from the LIVE_MATCH config — no DB lookup required.
 */
export const liveMatch = (): Match | undefined => {
  if (!LIVE_MATCH.enabled) return undefined;
  return {
    id: "m-live",
    homeSlug: LIVE_MATCH.homeSlug,
    awaySlug: LIVE_MATCH.awaySlug,
    homeScore: LIVE_MATCH.homeScore,
    awayScore: LIVE_MATCH.awayScore,
    status: "live",
    minute: LIVE_MATCH.minute,
    kickoff: new Date(Date.now() - LIVE_MATCH.minute * 60 * 1000).toISOString(),
    venue: LIVE_MATCH.venue,
    stage: LIVE_MATCH.stage,
    fansOnline: LIVE_MATCH.fansOnline,
  };
};

/** Next upcoming match for a team (sorted by kickoff). */
export const nextMatchForTeam = (slug: string): Match | undefined =>
  MATCHES
    .filter((m) => m.status === "upcoming" && (m.homeSlug === slug || m.awaySlug === slug))
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))[0];

/** All fixtures involving a team. */
export const matchesForTeam = (slug: string): Match[] =>
  MATCHES.filter((m) => m.homeSlug === slug || m.awaySlug === slug);

// Re-export so consumers can import TEAMS through one file if desired.
void TEAMS;
