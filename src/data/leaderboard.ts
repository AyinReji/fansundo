import { TEAMS } from "./teams";

/** Mock leaderboard — top fans across the platform. Swap in live query later. */
export interface LeaderRow {
  rank: number;
  username: string;
  team_slug: string;
  points: number;
  movement: number; // +/- change vs yesterday
  streak: number;
}

const handles = [
  "kochi_ultras", "kannur_kid", "tvm_thunder", "calicut_curler", "wayanad_wolf",
  "alappuzha_arrow", "thrissur_thunder", "palakkad_pacer", "kollam_kicker", "ernakulam_eagle",
  "kasargod_kop", "idukki_iron", "malappuram_messi", "kottayam_kop", "pathanamthitta_pace",
  "anchal_anchor", "fortkochi_fox", "munnar_mountain", "varkala_viper", "bekal_blaze",
];

export const LEADERBOARD: LeaderRow[] = handles.map((u, i) => ({
  rank: i + 1,
  username: u,
  team_slug: TEAMS[i % TEAMS.length].slug,
  points: 12_400 - i * 320 - (i % 3) * 47,
  movement: ((i * 7) % 9) - 4,
  streak: 21 - (i % 14),
}));
