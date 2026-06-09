import { TEAMS } from "./teams";

export type MatchStatus = "live" | "upcoming" | "finished";

export interface Match {
  id: string;
  homeSlug: string;
  awaySlug: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute?: number;       // for live
  kickoff: string;       // ISO
  venue: string;
  stage: string;         // "Group A", "Round of 16", etc.
  fansOnline?: number;
  highlightYoutubeId?: string; // for finished matches
}

const venues = [
  "MetLife Stadium, New Jersey", "AT&T Stadium, Dallas", "SoFi Stadium, Los Angeles",
  "Estadio Azteca, Mexico City", "BC Place, Vancouver", "Mercedes-Benz Stadium, Atlanta",
  "Lincoln Financial Field, Philadelphia", "Hard Rock Stadium, Miami",
];

// Build a curated demo fixture list — one live match, several upcoming, several finished.
export const MATCHES: Match[] = [
  {
    id: "m-live-1",
    homeSlug: "argentina", awaySlug: "brazil",
    homeScore: 2, awayScore: 1,
    status: "live", minute: 78,
    kickoff: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
    venue: venues[0], stage: "Group B",
    fansOnline: 2481,
  },
  // Upcoming
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
  // Finished
  ...[
    ["italy".replace("italy", "uruguay"), "ghana", 2, 0, "8GtjV4kKddE"],
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
  })),
];

export const liveMatch = (): Match | undefined => MATCHES.find((m) => m.status === "live");
export const nextMatchForTeam = (slug: string): Match | undefined =>
  MATCHES.find((m) => m.status === "upcoming" && (m.homeSlug === slug || m.awaySlug === slug));

// Quick fixture lookup
export const matchesForTeam = (slug: string): Match[] =>
  MATCHES.filter((m) => m.homeSlug === slug || m.awaySlug === slug);

// Avoid TS unused warning for TEAMS import being unused at module scope.
void TEAMS;
