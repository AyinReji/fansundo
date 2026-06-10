/**
 * All 48 nations qualified (or representative) for the 2026 World Cup.
 *
 *  EACH TEAM CARRIES:
 *    - colors      : flag palette (used for ambient gradients / glows)
 *    - nickname    : iconic nickname ("La Albiceleste", "Selecao", ...)
 *    - supporters  : seeded mock supporter count
 *    - form        : last 5 results (mock)
 *    - achievements: World Cup titles, best finish, total appearances
 *
 *  // Future API integration point: replace supporters/form/achievements
 *  // with values fetched from `team_stats` table once backend wires in.
 */
export type WorldCupGroup =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H"
  | "I" | "J" | "K" | "L";

export interface TeamAchievements {
  titles: number;       // World Cup titles
  bestFinish: string;   // e.g. "Champions (2022)"
  appearances: number;  // total WC appearances
}

export interface Team {
  slug: string;
  name: string;
  code: string;             // FIFA 3-letter
  flag: string;             // emoji fallback (kept for share previews)
  group: WorldCupGroup;
  nickname: string;
  colors: [string, string, string?];
  supporters: number;       // mock supporter count
  form: ("W" | "D" | "L")[];
  achievements: TeamAchievements;
}

const seed = (s: string) =>
  Math.abs([...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
const sup = (s: string) => 3_000 + (seed(s) % 95_000);
const form = (s: string): ("W" | "D" | "L")[] => {
  const r = seed(s);
  const map: Record<number, "W" | "D" | "L"> = { 0: "W", 1: "W", 2: "D", 3: "L" };
  return [0, 1, 2, 3, 4].map((i) => map[(r >> (i * 2)) & 0b11] ?? "W");
};

interface TeamSeed {
  slug: string; name: string; code: string; flag: string; group: WorldCupGroup;
  nickname: string;
  colors: [string, string, string?];
  ach: [number, string, number]; // [titles, bestFinish, appearances]
}

const make = (s: TeamSeed): Team => ({
  slug: s.slug, name: s.name, code: s.code, flag: s.flag, group: s.group,
  nickname: s.nickname, colors: s.colors,
  supporters: sup(s.slug), form: form(s.slug),
  achievements: { titles: s.ach[0], bestFinish: s.ach[1], appearances: s.ach[2] },
});

export const TEAMS: Team[] = [
  // ── Group A ─────────────────────────────────────────────────────
  make({ slug: "mexico", name: "Mexico", code: "MEX", flag: "🇲🇽", group: "A", nickname: "El Tri", colors: ["#006847", "#FFFFFF", "#CE1126"], ach: [0, "Quarter-finals (1970, 1986)", 17] }),
  make({ slug: "canada", name: "Canada", code: "CAN", flag: "🇨🇦", group: "A", nickname: "Les Rouges", colors: ["#FF0000", "#FFFFFF"], ach: [0, "Group Stage (1986, 2022)", 2] }),
  make({ slug: "usa", name: "United States", code: "USA", flag: "🇺🇸", group: "A", nickname: "The Stars and Stripes", colors: ["#B22234", "#FFFFFF", "#3C3B6E"], ach: [0, "Semi-finals (1930)", 11] }),
  make({ slug: "uzbekistan", name: "Uzbekistan", code: "UZB", flag: "🇺🇿", group: "A", nickname: "The White Wolves", colors: ["#0099B5", "#FFFFFF", "#1EB53A"], ach: [0, "Debut at 2026", 1] }),

  // ── Group B ─────────────────────────────────────────────────────
  make({ slug: "argentina", name: "Argentina", code: "ARG", flag: "🇦🇷", group: "B", nickname: "La Albiceleste", colors: ["#6CB4EE", "#FFFFFF"], ach: [3, "Champions (2022)", 18] }),
  make({ slug: "brazil", name: "Brazil", code: "BRA", flag: "🇧🇷", group: "B", nickname: "Seleção", colors: ["#009C3B", "#FFDF00"], ach: [5, "Champions (2002)", 22] }),
  make({ slug: "uruguay", name: "Uruguay", code: "URU", flag: "🇺🇾", group: "B", nickname: "La Celeste", colors: ["#6CB4EE", "#FFFFFF"], ach: [2, "Champions (1950)", 14] }),
  make({ slug: "paraguay", name: "Paraguay", code: "PAR", flag: "🇵🇾", group: "B", nickname: "La Albirroja", colors: ["#D52B1E", "#FFFFFF", "#0038A8"], ach: [0, "Quarter-finals (2010)", 9] }),

  // ── Group C ─────────────────────────────────────────────────────
  make({ slug: "france", name: "France", code: "FRA", flag: "🇫🇷", group: "C", nickname: "Les Bleus", colors: ["#0055A4", "#FFFFFF", "#EF4135"], ach: [2, "Champions (2018)", 16] }),
  make({ slug: "germany", name: "Germany", code: "GER", flag: "🇩🇪", group: "C", nickname: "Die Mannschaft", colors: ["#000000", "#DD0000", "#FFCE00"], ach: [4, "Champions (2014)", 20] }),
  make({ slug: "england", name: "England", code: "ENG", flag: "🏴", group: "C", nickname: "The Three Lions", colors: ["#FFFFFF", "#CE1126"], ach: [1, "Champions (1966)", 16] }),
  make({ slug: "portugal", name: "Portugal", code: "POR", flag: "🇵🇹", group: "C", nickname: "A Seleção das Quinas", colors: ["#006600", "#FF0000"], ach: [0, "Semi-finals (1966, 2006)", 8] }),

  // ── Group D ─────────────────────────────────────────────────────
  make({ slug: "spain", name: "Spain", code: "ESP", flag: "🇪🇸", group: "D", nickname: "La Roja", colors: ["#AA151B", "#F1BF00"], ach: [1, "Champions (2010)", 16] }),
  make({ slug: "netherlands", name: "Netherlands", code: "NED", flag: "🇳🇱", group: "D", nickname: "Oranje", colors: ["#AE1C28", "#FFFFFF", "#21468B"], ach: [0, "Runners-up (1974, 1978, 2010)", 11] }),
  make({ slug: "belgium", name: "Belgium", code: "BEL", flag: "🇧🇪", group: "D", nickname: "Red Devils", colors: ["#000000", "#FFD90C", "#EF3340"], ach: [0, "Third place (2018)", 14] }),
  make({ slug: "croatia", name: "Croatia", code: "CRO", flag: "🇭🇷", group: "D", nickname: "Vatreni", colors: ["#FF0000", "#FFFFFF"], ach: [0, "Runners-up (2018)", 6] }),

  // ── Group E ─────────────────────────────────────────────────────
  make({ slug: "morocco", name: "Morocco", code: "MAR", flag: "🇲🇦", group: "E", nickname: "Atlas Lions", colors: ["#C1272D", "#006233"], ach: [0, "Semi-finals (2022)", 6] }),
  make({ slug: "japan", name: "Japan", code: "JPN", flag: "🇯🇵", group: "E", nickname: "Samurai Blue", colors: ["#FFFFFF", "#BC002D"], ach: [0, "Round of 16 (2002, 2010, 2018, 2022)", 7] }),
  make({ slug: "south-korea", name: "South Korea", code: "KOR", flag: "🇰🇷", group: "E", nickname: "Taegeuk Warriors", colors: ["#FFFFFF", "#CD2E3A", "#0047A0"], ach: [0, "Semi-finals (2002)", 11] }),
  make({ slug: "australia", name: "Australia", code: "AUS", flag: "🇦🇺", group: "E", nickname: "Socceroos", colors: ["#002868", "#FFFFFF", "#FFCC00"], ach: [0, "Round of 16 (2006, 2022)", 6] }),

  // ── Group F ─────────────────────────────────────────────────────
  make({ slug: "saudi-arabia", name: "Saudi Arabia", code: "KSA", flag: "🇸🇦", group: "F", nickname: "Green Falcons", colors: ["#006C35", "#FFFFFF"], ach: [0, "Round of 16 (1994)", 6] }),
  make({ slug: "qatar", name: "Qatar", code: "QAT", flag: "🇶🇦", group: "F", nickname: "The Maroons", colors: ["#8A1538", "#FFFFFF"], ach: [0, "Group Stage (2022)", 1] }),
  make({ slug: "uae", name: "United Arab Emirates", code: "UAE", flag: "🇦🇪", group: "F", nickname: "Al Abyad", colors: ["#FF0000", "#00732F", "#000000"], ach: [0, "Group Stage (1990)", 1] }),
  make({ slug: "iran", name: "Iran", code: "IRN", flag: "🇮🇷", group: "F", nickname: "Team Melli", colors: ["#239F40", "#FFFFFF", "#DA0000"], ach: [0, "Group Stage", 6] }),

  // ── Group G ─────────────────────────────────────────────────────
  make({ slug: "iraq", name: "Iraq", code: "IRQ", flag: "🇮🇶", group: "G", nickname: "Lions of Mesopotamia", colors: ["#CE1126", "#FFFFFF", "#000000"], ach: [0, "Group Stage (1986)", 1] }),
  make({ slug: "china", name: "China", code: "CHN", flag: "🇨🇳", group: "G", nickname: "Team Dragon", colors: ["#DE2910", "#FFDE00"], ach: [0, "Group Stage (2002)", 1] }),
  make({ slug: "jordan", name: "Jordan", code: "JOR", flag: "🇯🇴", group: "G", nickname: "Al-Nashama", colors: ["#000000", "#007A3D", "#CE1126"], ach: [0, "Debut at 2026", 1] }),
  make({ slug: "oman", name: "Oman", code: "OMA", flag: "🇴🇲", group: "G", nickname: "The Reds", colors: ["#DB161B", "#FFFFFF", "#007A3D"], ach: [0, "Debut at 2026", 1] }),

  // ── Group H ─────────────────────────────────────────────────────
  make({ slug: "bahrain", name: "Bahrain", code: "BHR", flag: "🇧🇭", group: "H", nickname: "Al-Ahmar", colors: ["#CE1126", "#FFFFFF"], ach: [0, "Debut at 2026", 1] }),
  make({ slug: "tunisia", name: "Tunisia", code: "TUN", flag: "🇹🇳", group: "H", nickname: "Eagles of Carthage", colors: ["#E70013", "#FFFFFF"], ach: [0, "Group Stage", 6] }),
  make({ slug: "senegal", name: "Senegal", code: "SEN", flag: "🇸🇳", group: "H", nickname: "Lions of Teranga", colors: ["#00853F", "#FDEF42", "#E31B23"], ach: [0, "Quarter-finals (2002)", 4] }),
  make({ slug: "nigeria", name: "Nigeria", code: "NGA", flag: "🇳🇬", group: "H", nickname: "Super Eagles", colors: ["#008751", "#FFFFFF"], ach: [0, "Round of 16", 6] }),

  // ── Group I ─────────────────────────────────────────────────────
  make({ slug: "ghana", name: "Ghana", code: "GHA", flag: "🇬🇭", group: "I", nickname: "Black Stars", colors: ["#CE1126", "#FCD116", "#006B3F"], ach: [0, "Quarter-finals (2010)", 4] }),
  make({ slug: "algeria", name: "Algeria", code: "ALG", flag: "🇩🇿", group: "I", nickname: "Les Fennecs", colors: ["#006233", "#FFFFFF"], ach: [0, "Round of 16 (2014)", 4] }),
  make({ slug: "cameroon", name: "Cameroon", code: "CMR", flag: "🇨🇲", group: "I", nickname: "Indomitable Lions", colors: ["#007A5E", "#CE1126", "#FCD116"], ach: [0, "Quarter-finals (1990)", 8] }),
  make({ slug: "ivory-coast", name: "Ivory Coast", code: "CIV", flag: "🇨🇮", group: "I", nickname: "Les Éléphants", colors: ["#F77F00", "#FFFFFF", "#009E60"], ach: [0, "Group Stage", 3] }),

  // ── Group J ─────────────────────────────────────────────────────
  make({ slug: "south-africa", name: "South Africa", code: "RSA", flag: "🇿🇦", group: "J", nickname: "Bafana Bafana", colors: ["#007A4D", "#FFB612", "#000000"], ach: [0, "Group Stage (1998, 2002, 2010)", 3] }),
  make({ slug: "egypt", name: "Egypt", code: "EGY", flag: "🇪🇬", group: "J", nickname: "The Pharaohs", colors: ["#CE1126", "#FFFFFF", "#000000"], ach: [0, "Group Stage", 3] }),
  make({ slug: "new-zealand", name: "New Zealand", code: "NZL", flag: "🇳🇿", group: "J", nickname: "All Whites", colors: ["#00247D", "#FFFFFF", "#CC142B"], ach: [0, "Group Stage (1982, 2010)", 2] }),
  make({ slug: "colombia", name: "Colombia", code: "COL", flag: "🇨🇴", group: "J", nickname: "Los Cafeteros", colors: ["#FCD116", "#003893", "#CE1126"], ach: [0, "Quarter-finals (2014)", 6] }),

  // ── Group K ─────────────────────────────────────────────────────
  make({ slug: "chile", name: "Chile", code: "CHI", flag: "🇨🇱", group: "K", nickname: "La Roja", colors: ["#0039A6", "#FFFFFF", "#D52B1E"], ach: [0, "Third place (1962)", 9] }),
  make({ slug: "peru", name: "Peru", code: "PER", flag: "🇵🇪", group: "K", nickname: "La Blanquirroja", colors: ["#D91023", "#FFFFFF"], ach: [0, "Quarter-finals (1970)", 5] }),
  make({ slug: "ecuador", name: "Ecuador", code: "ECU", flag: "🇪🇨", group: "K", nickname: "La Tri", colors: ["#FFD100", "#0033A0", "#EF3340"], ach: [0, "Round of 16 (2006)", 4] }),
  make({ slug: "costa-rica", name: "Costa Rica", code: "CRC", flag: "🇨🇷", group: "K", nickname: "Los Ticos", colors: ["#002B7F", "#FFFFFF", "#CE1126"], ach: [0, "Quarter-finals (2014)", 6] }),

  // ── Group L ─────────────────────────────────────────────────────
  make({ slug: "panama", name: "Panama", code: "PAN", flag: "🇵🇦", group: "L", nickname: "Marea Roja", colors: ["#005293", "#FFFFFF", "#D21034"], ach: [0, "Group Stage (2018)", 1] }),
  make({ slug: "venezuela", name: "Venezuela", code: "VEN", flag: "🇻🇪", group: "L", nickname: "La Vinotinto", colors: ["#F4C300", "#00247D", "#CF142B"], ach: [0, "Debut at 2026", 1] }),
  make({ slug: "bolivia", name: "Bolivia", code: "BOL", flag: "🇧🇴", group: "L", nickname: "La Verde", colors: ["#D52B1E", "#FFD700", "#007934"], ach: [0, "Group Stage (1930, 1950, 1994)", 3] }),
  make({ slug: "india", name: "India", code: "IND", flag: "🇮🇳", group: "L", nickname: "The Blue Tigers", colors: ["#FF9933", "#FFFFFF", "#138808"], ach: [0, "Debut at 2026", 1] }),
];

export const TEAM_MAP: Record<string, Team> = Object.fromEntries(TEAMS.map((t) => [t.slug, t]));

export const getTeam = (slug: string): Team | undefined => TEAM_MAP[slug];

/** Build a flag-themed ambient gradient string for inline backgrounds. */
export const teamGradient = (t: Team): string => {
  const [a, b, c] = t.colors;
  return c
    ? `linear-gradient(135deg, ${a} 0%, ${b} 55%, ${c} 100%)`
    : `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
};
