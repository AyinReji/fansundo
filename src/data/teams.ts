/**
 * All 48 nations qualified (or representative) for the 2026 World Cup.
 * Each team carries a flag-derived palette used by TeamCard / TeamPage.
 * Palette order: [primary, secondary, accent?] — accent optional.
 */
export type WorldCupGroup =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H"
  | "I" | "J" | "K" | "L";

export interface Team {
  slug: string;
  name: string;
  code: string;             // FIFA 3-letter
  flag: string;             // emoji flag
  group: WorldCupGroup;
  colors: [string, string, string?];
  supporters: number;       // mock supporter count
  form: ("W" | "D" | "L")[]; // last 5 results
}

// Helper to seed semi-stable supporter counts so they look real but don't change wildly across renders.
const seed = (s: string) =>
  Math.abs([...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
const sup = (s: string) => 3_000 + (seed(s) % 95_000);
const form = (s: string): ("W" | "D" | "L")[] => {
  const r = seed(s);
  const map: Record<number, "W" | "D" | "L"> = { 0: "W", 1: "W", 2: "D", 3: "L", 4: "W" };
  return [0, 1, 2, 3, 4].map((i) => map[(r >> (i * 2)) & 0b11 % 5] ?? "W");
};

const make = (
  slug: string, name: string, code: string, flag: string, group: WorldCupGroup,
  colors: [string, string, string?]
): Team => ({ slug, name, code, flag, group, colors, supporters: sup(slug), form: form(slug) });

export const TEAMS: Team[] = [
  // Group A
  make("mexico", "Mexico", "MEX", "🇲🇽", "A", ["#006847", "#FFFFFF", "#CE1126"]),
  make("canada", "Canada", "CAN", "🇨🇦", "A", ["#FF0000", "#FFFFFF"]),
  make("usa", "United States", "USA", "🇺🇸", "A", ["#B22234", "#FFFFFF", "#3C3B6E"]),
  make("uzbekistan", "Uzbekistan", "UZB", "🇺🇿", "A", ["#0099B5", "#FFFFFF", "#1EB53A"]),

  // Group B
  make("argentina", "Argentina", "ARG", "🇦🇷", "B", ["#6CB4EE", "#FFFFFF"]),
  make("brazil", "Brazil", "BRA", "🇧🇷", "B", ["#009C3B", "#FFDF00"]),
  make("uruguay", "Uruguay", "URU", "🇺🇾", "B", ["#6CB4EE", "#FFFFFF"]),
  make("paraguay", "Paraguay", "PAR", "🇵🇾", "B", ["#D52B1E", "#FFFFFF", "#0038A8"]),

  // Group C
  make("france", "France", "FRA", "🇫🇷", "C", ["#0055A4", "#FFFFFF", "#EF4135"]),
  make("germany", "Germany", "GER", "🇩🇪", "C", ["#000000", "#DD0000", "#FFCE00"]),
  make("england", "England", "ENG", "🏴", "C", ["#FFFFFF", "#CE1126"]),
  make("portugal", "Portugal", "POR", "🇵🇹", "C", ["#006600", "#FF0000"]),

  // Group D
  make("spain", "Spain", "ESP", "🇪🇸", "D", ["#AA151B", "#F1BF00"]),
  make("netherlands", "Netherlands", "NED", "🇳🇱", "D", ["#AE1C28", "#FFFFFF", "#21468B"]),
  make("belgium", "Belgium", "BEL", "🇧🇪", "D", ["#000000", "#FFD90C", "#EF3340"]),
  make("croatia", "Croatia", "CRO", "🇭🇷", "D", ["#FF0000", "#FFFFFF"]),

  // Group E
  make("morocco", "Morocco", "MAR", "🇲🇦", "E", ["#C1272D", "#006233"]),
  make("japan", "Japan", "JPN", "🇯🇵", "E", ["#FFFFFF", "#BC002D"]),
  make("south-korea", "South Korea", "KOR", "🇰🇷", "E", ["#FFFFFF", "#CD2E3A", "#0047A0"]),
  make("australia", "Australia", "AUS", "🇦🇺", "E", ["#002868", "#FFFFFF", "#FFCC00"]),

  // Group F
  make("saudi-arabia", "Saudi Arabia", "KSA", "🇸🇦", "F", ["#006C35", "#FFFFFF"]),
  make("qatar", "Qatar", "QAT", "🇶🇦", "F", ["#8A1538", "#FFFFFF"]),
  make("uae", "United Arab Emirates", "UAE", "🇦🇪", "F", ["#FF0000", "#00732F", "#000000"]),
  make("iran", "Iran", "IRN", "🇮🇷", "F", ["#239F40", "#FFFFFF", "#DA0000"]),

  // Group G
  make("iraq", "Iraq", "IRQ", "🇮🇶", "G", ["#CE1126", "#FFFFFF", "#000000"]),
  make("china", "China", "CHN", "🇨🇳", "G", ["#DE2910", "#FFDE00"]),
  make("jordan", "Jordan", "JOR", "🇯🇴", "G", ["#000000", "#007A3D", "#CE1126"]),
  make("oman", "Oman", "OMA", "🇴🇲", "G", ["#DB161B", "#FFFFFF", "#007A3D"]),

  // Group H
  make("bahrain", "Bahrain", "BHR", "🇧🇭", "H", ["#CE1126", "#FFFFFF"]),
  make("tunisia", "Tunisia", "TUN", "🇹🇳", "H", ["#E70013", "#FFFFFF"]),
  make("senegal", "Senegal", "SEN", "🇸🇳", "H", ["#00853F", "#FDEF42", "#E31B23"]),
  make("nigeria", "Nigeria", "NGA", "🇳🇬", "H", ["#008751", "#FFFFFF"]),

  // Group I
  make("ghana", "Ghana", "GHA", "🇬🇭", "I", ["#CE1126", "#FCD116", "#006B3F"]),
  make("algeria", "Algeria", "ALG", "🇩🇿", "I", ["#006233", "#FFFFFF"]),
  make("cameroon", "Cameroon", "CMR", "🇨🇲", "I", ["#007A5E", "#CE1126", "#FCD116"]),
  make("ivory-coast", "Ivory Coast", "CIV", "🇨🇮", "I", ["#F77F00", "#FFFFFF", "#009E60"]),

  // Group J
  make("south-africa", "South Africa", "RSA", "🇿🇦", "J", ["#007A4D", "#FFB612", "#000000"]),
  make("egypt", "Egypt", "EGY", "🇪🇬", "J", ["#CE1126", "#FFFFFF", "#000000"]),
  make("new-zealand", "New Zealand", "NZL", "🇳🇿", "J", ["#00247D", "#FFFFFF", "#CC142B"]),
  make("colombia", "Colombia", "COL", "🇨🇴", "J", ["#FCD116", "#003893", "#CE1126"]),

  // Group K
  make("chile", "Chile", "CHI", "🇨🇱", "K", ["#0039A6", "#FFFFFF", "#D52B1E"]),
  make("peru", "Peru", "PER", "🇵🇪", "K", ["#D91023", "#FFFFFF"]),
  make("ecuador", "Ecuador", "ECU", "🇪🇨", "K", ["#FFD100", "#0033A0", "#EF3340"]),
  make("costa-rica", "Costa Rica", "CRC", "🇨🇷", "K", ["#002B7F", "#FFFFFF", "#CE1126"]),

  // Group L
  make("panama", "Panama", "PAN", "🇵🇦", "L", ["#005293", "#FFFFFF", "#D21034"]),
  make("venezuela", "Venezuela", "VEN", "🇻🇪", "L", ["#F4C300", "#00247D", "#CF142B"]),
  make("bolivia", "Bolivia", "BOL", "🇧🇴", "L", ["#D52B1E", "#FFD700", "#007934"]),
  make("india", "India", "IND", "🇮🇳", "L", ["#FF9933", "#FFFFFF", "#138808"]),
];

export const TEAM_MAP: Record<string, Team> = Object.fromEntries(TEAMS.map((t) => [t.slug, t]));

export const getTeam = (slug: string): Team | undefined => TEAM_MAP[slug];

/** Build a flag-themed gradient string for inline backgrounds. */
export const teamGradient = (t: Team): string => {
  const [a, b, c] = t.colors;
  return c
    ? `linear-gradient(135deg, ${a} 0%, ${b} 55%, ${c} 100%)`
    : `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
};
