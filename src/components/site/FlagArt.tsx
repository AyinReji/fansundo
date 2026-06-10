/* =============================================================================
 * FlagArt — SVG-based national flag renderer used everywhere a team appears.
 *
 *  WHY: Emoji flags are tiny, inconsistent across platforms and don't scale to
 *  the premium card / popup designs we want. A vector flag fills any container,
 *  reads instantly at small sizes (badges, leaderboard rows) and gives each
 *  card a unique nation-driven look (Croatia checker, Brazil diamond, etc.).
 *
 *  USAGE:
 *     <FlagArt slug="argentina" className="absolute inset-0" />
 *     <FlagArt slug="brazil" rounded />            // small inline badge
 *
 *  Each renderer uses a 60×40 viewBox (FIFA-style 3:2). All flags scale to
 *  100% of their container via preserveAspectRatio="none" so they fill cards
 *  edge-to-edge and act as the card design itself.
 * ===========================================================================*/
import { memo, type ReactElement } from "react";

interface Props {
    slug: string;
    className?: string;
    rounded?: boolean;      // softens corners (used for small badges)
    /** When true, draws the flag inside the natural 3:2 aspect (don't stretch). */
    preserveAspect?: boolean;
}

const VB = "0 0 60 40";

// --- Tiny inline helpers ---------------------------------------------------
const Star = ({ cx, cy, r, fill, points = 5 }: { cx: number; cy: number; r: number; fill: string; points?: number }) => {
    // Approximate 5-point star as polygon
    const pts: string[] = [];
    for (let i = 0; i < points * 2; i++) {
        const ang = (Math.PI / points) * i - Math.PI / 2;
        const rr = i % 2 === 0 ? r : r * 0.45;
        pts.push(`${cx + rr * Math.cos(ang)},${cy + rr * Math.sin(ang)}`);
    }
    return <polygon points={pts.join(" ")} fill={fill} />;
};

const Crescent = ({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) => (
    <g>
        <circle cx={cx} cy={cy} r={r} fill={fill} />
        <circle cx={cx + r * 0.35} cy={cy} r={r * 0.85} fill="var(--flag-mask, white)" />
    </g>
);

// --- Per-nation renderers --------------------------------------------------
// Each function returns the inner <svg> children. Order matters (later = on top).
const renderers: Record<string, () => ReactElement> = {
    // SOUTH AMERICA -----------------------------------------------------------
    argentina: () => (
        <g>
            <rect width="60" height="40" fill="#6CB4EE" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <circle cx="30" cy="20" r="3.4" fill="#F4C300" />
            <g stroke="#F4C300" strokeWidth="0.5">
                {Array.from({ length: 16 }).map((_, i) => {
                    const a = (Math.PI * 2 * i) / 16;
                    return <line key={i} x1={30 + Math.cos(a) * 3.8} y1={20 + Math.sin(a) * 3.8} x2={30 + Math.cos(a) * 5.5} y2={20 + Math.sin(a) * 5.5} />;
                })}
            </g>
        </g>
    ),
    brazil: () => (
        <g>
            <rect width="60" height="40" fill="#009C3B" />
            <polygon points="30,4 56,20 30,36 4,20" fill="#FFDF00" />
            <circle cx="30" cy="20" r="6.5" fill="#002776" />
            <path d="M 24 18 Q 30 22 36 18" stroke="#FFFFFF" strokeWidth="0.7" fill="none" />
        </g>
    ),
    uruguay: () => (
        <g>
            <rect width="60" height="40" fill="#FFFFFF" />
            {[1, 3, 5, 7].map((i) => (
                <rect key={i} x="20" y={i * 4.45} width="40" height="4.45" fill="#0038A8" />
            ))}
            {[0, 2, 4, 6, 8].map((i) => (i > 0 ? <rect key={i} y={i * 4.45} width="60" height="4.45" fill={i < 4 ? "#0038A8" : "#0038A8"} opacity="0" /> : null))}
            <rect x="0" y="0" width="20" height="18" fill="#FFFFFF" />
            <circle cx="10" cy="9" r="3" fill="#F4C300" />
        </g>
    ),
    paraguay: () => (
        <g>
            <rect width="60" height="40" fill="#D52B1E" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.33" fill="#0038A8" />
            <circle cx="30" cy="20" r="2.5" fill="#FFFFFF" stroke="#F4C300" strokeWidth="0.4" />
        </g>
    ),
    colombia: () => (
        <g>
            <rect width="60" height="40" fill="#FCD116" />
            <rect y="20" width="60" height="10" fill="#003893" />
            <rect y="30" width="60" height="10" fill="#CE1126" />
        </g>
    ),
    chile: () => (
        <g>
            <rect width="60" height="40" fill="#FFFFFF" />
            <rect y="20" width="60" height="20" fill="#D52B1E" />
            <rect width="20" height="20" fill="#0039A6" />
            <Star cx={10} cy={10} r={3.5} fill="#FFFFFF" />
        </g>
    ),
    peru: () => (
        <g>
            <rect width="20" height="40" fill="#D91023" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#D91023" />
        </g>
    ),
    ecuador: () => (
        <g>
            <rect width="60" height="40" fill="#FFD100" />
            <rect y="20" width="60" height="10" fill="#0033A0" />
            <rect y="30" width="60" height="10" fill="#EF3340" />
            <circle cx="30" cy="20" r="2.4" fill="#FFD100" stroke="#0033A0" strokeWidth="0.4" />
        </g>
    ),
    venezuela: () => (
        <g>
            <rect width="60" height="40" fill="#F4C300" />
            <rect y="13.33" width="60" height="13.33" fill="#00247D" />
            <rect y="26.66" width="60" height="13.33" fill="#CF142B" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const a = Math.PI + (Math.PI * (i + 1)) / 9;
                return <Star key={i} cx={30 + Math.cos(a) * 9} cy={20 - Math.sin(a) * 0 + 0.5 + Math.sin(a) * 4} r={0.8} fill="#FFFFFF" />;
            })}
        </g>
    ),
    bolivia: () => (
        <g>
            <rect width="60" height="40" fill="#D52B1E" />
            <rect y="13.33" width="60" height="13.33" fill="#FFD700" />
            <rect y="26.66" width="60" height="13.33" fill="#007934" />
        </g>
    ),

    // NORTH/CENTRAL AMERICA ---------------------------------------------------
    mexico: () => (
        <g>
            <rect width="20" height="40" fill="#006847" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#CE1126" />
            <circle cx="30" cy="20" r="2.4" fill="#006847" opacity="0.18" />
        </g>
    ),
    canada: () => (
        <g>
            <rect width="15" height="40" fill="#FF0000" />
            <rect x="15" width="30" height="40" fill="#FFFFFF" />
            <rect x="45" width="15" height="40" fill="#FF0000" />
            <path d="M30 10 l1.6 3.2 3.2-1 -1 3.2 3.2 1.6 -2.6 1.4 .8 3.4 -3-1.4 -2 4 -2-4 -3 1.4 .8-3.4 -2.6-1.4 3.2-1.6 -1-3.2 3.2 1z" fill="#FF0000" />
        </g>
    ),
    usa: () => (
        <g>
            {Array.from({ length: 13 }).map((_, i) => (
                <rect key={i} y={(i * 40) / 13} width="60" height={40 / 13} fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"} />
            ))}
            <rect width="24" height={40 * (7 / 13)} fill="#3C3B6E" />
            {Array.from({ length: 5 }).map((_, r) =>
                Array.from({ length: 6 }).map((_, c) => (
                    <circle key={`${r}-${c}`} cx={2 + c * 4} cy={2 + r * 4} r="0.7" fill="#FFFFFF" />
                ))
            )}
        </g>
    ),
    "costa-rica": () => (
        <g>
            <rect width="60" height="40" fill="#002B7F" />
            <rect y="6.67" width="60" height="26.67" fill="#FFFFFF" />
            <rect y="13.33" width="60" height="13.33" fill="#CE1126" />
        </g>
    ),
    panama: () => (
        <g>
            <rect width="30" height="20" fill="#FFFFFF" />
            <rect x="30" width="30" height="20" fill="#D21034" />
            <rect y="20" width="30" height="20" fill="#005293" />
            <rect x="30" y="20" width="30" height="20" fill="#FFFFFF" />
            <Star cx={15} cy={10} r={4} fill="#005293" />
            <Star cx={45} cy={30} r={4} fill="#D21034" />
        </g>
    ),

    // EUROPE ------------------------------------------------------------------
    france: () => (
        <g>
            <rect width="20" height="40" fill="#0055A4" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#EF4135" />
        </g>
    ),
    germany: () => (
        <g>
            <rect width="60" height="13.33" fill="#000000" />
            <rect y="13.33" width="60" height="13.33" fill="#DD0000" />
            <rect y="26.66" width="60" height="13.33" fill="#FFCE00" />
        </g>
    ),
    england: () => (
        <g>
            <rect width="60" height="40" fill="#FFFFFF" />
            <rect x="25" width="10" height="40" fill="#CE1126" />
            <rect y="15" width="60" height="10" fill="#CE1126" />
        </g>
    ),
    portugal: () => (
        <g>
            <rect width="24" height="40" fill="#006600" />
            <rect x="24" width="36" height="40" fill="#FF0000" />
            <circle cx="24" cy="20" r="6" fill="#F4C300" stroke="#FFFFFF" strokeWidth="0.5" />
            <circle cx="24" cy="20" r="3" fill="#FFFFFF" />
            <rect x="22" y="18" width="4" height="4" fill="#003893" />
        </g>
    ),
    spain: () => (
        <g>
            <rect width="60" height="10" fill="#AA151B" />
            <rect y="10" width="60" height="20" fill="#F1BF00" />
            <rect y="30" width="60" height="10" fill="#AA151B" />
            <rect x="15" y="14.5" width="6" height="11" fill="#AA151B" opacity="0.85" rx="0.4" />
        </g>
    ),
    netherlands: () => (
        <g>
            <rect width="60" height="13.33" fill="#AE1C28" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.33" fill="#21468B" />
        </g>
    ),
    belgium: () => (
        <g>
            <rect width="20" height="40" fill="#000000" />
            <rect x="20" width="20" height="40" fill="#FFD90C" />
            <rect x="40" width="20" height="40" fill="#EF3340" />
        </g>
    ),
    croatia: () => (
        <g>
            <rect width="60" height="13.33" fill="#FF0000" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.33" fill="#0038A8" />
            {/* Iconic checkerboard crest band, scaled up as design accent */}
            <g transform="translate(22 10)">
                {Array.from({ length: 5 }).map((_, r) =>
                    Array.from({ length: 4 }).map((_, c) => (
                        <rect key={`${r}-${c}`} x={c * 4} y={r * 4} width="4" height="4" fill={(r + c) % 2 === 0 ? "#FF0000" : "#FFFFFF"} />
                    ))
                )}
            </g>
        </g>
    ),

    // AFRICA ------------------------------------------------------------------
    morocco: () => (
        <g>
            <rect width="60" height="40" fill="#C1272D" />
            <g fill="none" stroke="#006233" strokeWidth="1.2">
                <Star cx={30} cy={20} r={7} fill="none" />
            </g>
        </g>
    ),
    tunisia: () => (
        <g>
            <rect width="60" height="40" fill="#E70013" />
            <circle cx="30" cy="20" r="8" fill="#FFFFFF" />
            <Crescent cx={31} cy={20} r={4} fill="#E70013" />
            <Star cx={33} cy={20} r={1.6} fill="#E70013" />
        </g>
    ),
    senegal: () => (
        <g>
            <rect width="20" height="40" fill="#00853F" />
            <rect x="20" width="20" height="40" fill="#FDEF42" />
            <rect x="40" width="20" height="40" fill="#E31B23" />
            <Star cx={30} cy={20} r={3.2} fill="#00853F" />
        </g>
    ),
    nigeria: () => (
        <g>
            <rect width="20" height="40" fill="#008751" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#008751" />
        </g>
    ),
    ghana: () => (
        <g>
            <rect width="60" height="13.33" fill="#CE1126" />
            <rect y="13.33" width="60" height="13.33" fill="#FCD116" />
            <rect y="26.66" width="60" height="13.33" fill="#006B3F" />
            <Star cx={30} cy={20} r={3.4} fill="#000000" />
        </g>
    ),
    algeria: () => (
        <g>
            <rect width="30" height="40" fill="#006233" />
            <rect x="30" width="30" height="40" fill="#FFFFFF" />
            <Crescent cx={30} cy={20} r={5} fill="#D21034" />
            <Star cx={33} cy={20} r={2.2} fill="#D21034" />
        </g>
    ),
    cameroon: () => (
        <g>
            <rect width="20" height="40" fill="#007A5E" />
            <rect x="20" width="20" height="40" fill="#CE1126" />
            <rect x="40" width="20" height="40" fill="#FCD116" />
            <Star cx={30} cy={20} r={3} fill="#FCD116" />
        </g>
    ),
    "ivory-coast": () => (
        <g>
            <rect width="20" height="40" fill="#F77F00" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#009E60" />
        </g>
    ),
    "south-africa": () => (
        <g>
            <rect width="60" height="20" fill="#CE1126" />
            <rect y="20" width="60" height="20" fill="#0033A0" />
            <polygon points="0,0 25,20 0,40" fill="#000000" />
            <polygon points="0,4 21,20 0,36" fill="#007A4D" />
            <polygon points="0,0 30,20 0,40 60,40 60,30 18,20 60,10 60,0" fill="#FFFFFF" />
            <polygon points="0,4 26,20 0,36 60,32 60,8" fill="#007A4D" />
            <polygon points="0,8 23,20 0,32 60,28 60,12" fill="#FCD116" />
        </g>
    ),
    egypt: () => (
        <g>
            <rect width="60" height="13.33" fill="#CE1126" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.33" fill="#000000" />
            <circle cx="30" cy="20" r="1.8" fill="#C09A2C" />
        </g>
    ),

    // ASIA / OCEANIA ----------------------------------------------------------
    japan: () => (
        <g>
            <rect width="60" height="40" fill="#FFFFFF" />
            <circle cx="30" cy="20" r="10" fill="#BC002D" />
        </g>
    ),
    "south-korea": () => (
        <g>
            <rect width="60" height="40" fill="#FFFFFF" />
            <g transform="translate(30 20)">
                <path d="M -8 0 a 8 8 0 0 1 16 0 a 4 4 0 0 0 -8 0 a 4 4 0 0 1 -8 0 z" fill="#CD2E3A" />
                <path d="M 8 0 a 8 8 0 0 1 -16 0 a 4 4 0 0 0 8 0 a 4 4 0 0 1 8 0 z" fill="#0047A0" />
            </g>
        </g>
    ),
    australia: () => (
        <g>
            <rect width="60" height="40" fill="#002868" />
            <rect width="30" height="20" fill="#012169" />
            <path d="M0,0 L30,20 M30,0 L0,20" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth="1" />
            <path d="M15,0 V20 M0,10 H30" stroke="#FFFFFF" strokeWidth="3" />
            <path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="1.5" />
            <Star cx={15} cy={30} r={3} fill="#FFFFFF" points={7} />
            <Star cx={45} cy={8} r={1.5} fill="#FFFFFF" />
            <Star cx={50} cy={18} r={1.4} fill="#FFFFFF" />
            <Star cx={45} cy={28} r={1.4} fill="#FFFFFF" />
            <Star cx={52} cy={32} r={1} fill="#FFFFFF" />
            <Star cx={42} cy={20} r={0.9} fill="#FFFFFF" />
        </g>
    ),
    "new-zealand": () => (
        <g>
            <rect width="60" height="40" fill="#00247D" />
            <rect width="30" height="20" fill="#012169" />
            <path d="M0,0 L30,20 M30,0 L0,20" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M15,0 V20 M0,10 H30" stroke="#FFFFFF" strokeWidth="3" />
            <path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="1.5" />
            {[
                [44, 10], [52, 18], [44, 28], [50, 32],
            ].map(([x, y], i) => (
                <Star key={i} cx={x} cy={y} r={1.6} fill="#C8102E" />
            ))}
        </g>
    ),
    china: () => (
        <g>
            <rect width="60" height="40" fill="#DE2910" />
            <Star cx={10} cy={10} r={4} fill="#FFDE00" />
            <Star cx={18} cy={5} r={1.4} fill="#FFDE00" />
            <Star cx={22} cy={9} r={1.4} fill="#FFDE00" />
            <Star cx={22} cy={14} r={1.4} fill="#FFDE00" />
            <Star cx={18} cy={17} r={1.4} fill="#FFDE00" />
        </g>
    ),
    india: () => (
        <g>
            <rect width="60" height="13.33" fill="#FF9933" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.33" fill="#138808" />
            <circle cx="30" cy="20" r="4" fill="none" stroke="#000080" strokeWidth="0.5" />
            <g stroke="#000080" strokeWidth="0.3">
                {Array.from({ length: 24 }).map((_, i) => {
                    const a = (Math.PI * 2 * i) / 24;
                    return <line key={i} x1={30} y1={20} x2={30 + Math.cos(a) * 4} y2={20 + Math.sin(a) * 4} />;
                })}
            </g>
        </g>
    ),
    "saudi-arabia": () => (
        <g>
            <rect width="60" height="40" fill="#006C35" />
            <line x1="10" y1="28" x2="50" y2="28" stroke="#FFFFFF" strokeWidth="1.2" />
            <path d="M10 28 l-2 -1.5 l2 -1.5 z" fill="#FFFFFF" />
            <text x="30" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="4" fontFamily="serif" fontStyle="italic">شهادة</text>
        </g>
    ),
    qatar: () => (
        <g>
            <rect width="60" height="40" fill="#FFFFFF" />
            <path d="M 17 0 L 60 0 L 60 40 L 17 40 L 22 35.5 L 17 31 L 22 26.5 L 17 22 L 22 17.5 L 17 13 L 22 8.5 Z" fill="#8A1538" />
        </g>
    ),
    uae: () => (
        <g>
            <rect width="15" height="40" fill="#FF0000" />
            <rect x="15" width="45" height="13.33" fill="#00732F" />
            <rect x="15" y="13.33" width="45" height="13.33" fill="#FFFFFF" />
            <rect x="15" y="26.66" width="45" height="13.33" fill="#000000" />
        </g>
    ),
    iran: () => (
        <g>
            <rect width="60" height="13.33" fill="#239F40" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.33" fill="#DA0000" />
            <circle cx="30" cy="20" r="1.8" fill="#DA0000" />
        </g>
    ),
    iraq: () => (
        <g>
            <rect width="60" height="13.33" fill="#CE1126" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.33" fill="#000000" />
            <text x="30" y="22" textAnchor="middle" fill="#007A3D" fontSize="3.5" fontFamily="serif">الله أكبر</text>
        </g>
    ),
    jordan: () => (
        <g>
            <rect width="60" height="13.33" fill="#000000" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.33" fill="#007A3D" />
            <polygon points="0,0 25,20 0,40" fill="#CE1126" />
            <Star cx={9} cy={20} r={2.2} fill="#FFFFFF" points={7} />
        </g>
    ),
    oman: () => (
        <g>
            <rect width="60" height="13.33" fill="#FFFFFF" />
            <rect y="13.33" width="60" height="13.33" fill="#DB161B" />
            <rect y="26.66" width="60" height="13.33" fill="#007A3D" />
            <rect width="15" height="40" fill="#DB161B" />
            <circle cx="7.5" cy="6" r="2.2" fill="none" stroke="#FFFFFF" strokeWidth="0.6" />
        </g>
    ),
    bahrain: () => (
        <g>
            <rect width="60" height="40" fill="#FFFFFF" />
            <path d="M 60 0 L 18 0 L 14 4.4 L 18 8.9 L 14 13.3 L 18 17.8 L 14 22.2 L 18 26.6 L 14 31.1 L 18 35.6 L 14 40 L 60 40 Z" fill="#CE1126" />
        </g>
    ),
    uzbekistan: () => (
        <g>
            <rect width="60" height="40" fill="#0099B5" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.33" fill="#1EB53A" />
            <rect y="12.8" width="60" height="0.8" fill="#CE1126" />
            <rect y="26.4" width="60" height="0.8" fill="#CE1126" />
            <Crescent cx={10} cy={7} r={2.8} fill="#FFFFFF" />
        </g>
    ),
};

// CSS var trick: Crescent uses `var(--flag-mask, white)` so it can be re-themed
// against non-white backgrounds (e.g. when crescent sits on green, set to green).
// Default fine for our palette.

const Fallback = ({ slug }: { slug: string }) => {
    // Gradient fallback from team data — won't be used for the 48 above but keeps
    // the renderer safe in case a slug is missing.
    return <rect width="60" height="40" fill="#222" data-fallback={slug} />;
};

export const FlagArt = memo(function FlagArt({ slug, className = "", rounded, preserveAspect }: Props) {
    const render = renderers[slug];
    return (
        <svg
            viewBox={VB}
            preserveAspectRatio={preserveAspect ? "xMidYMid meet" : "none"}
            className={`block h-full w-full ${rounded ? "rounded-md" : ""} ${className}`}
            aria-hidden
        >
            {render ? render() : <Fallback slug={slug} />}
        </svg>
    );
});

/** Compact circular team badge (used in chat, leaderboard rows, profile pills). */
export function TeamBadge({ slug, size = 28, className = "" }: { slug: string; size?: number; className?: string }) {
    return (
        <span
            className={`inline-block overflow-hidden rounded-full ring-1 ring-white/15 align-middle ${className}`}
            style={{ width: size, height: size }}
        >
            <FlagArt slug={slug} />
        </span>
    );
}
