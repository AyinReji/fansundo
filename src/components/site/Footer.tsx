import { Link } from "@tanstack/react-router";

/** Footer with disclaimer + Kaeon credit. */
export function Footer() {
  const cols = [
    { title: "Explore", links: [
      { to: "/", label: "Home" }, { to: "/matches", label: "Matches" },
      { to: "/teams", label: "Teams" }, { to: "/statistics", label: "Statistics" },
    ]},
    { title: "Community", links: [
      { to: "/arena", label: "Arena" }, { to: "/leaderboard", label: "Leaderboard" },
      { to: "/highlights", label: "Highlights" }, { to: "/predictions", label: "Predictions" },
    ]},
    { title: "About", links: [
      { to: "/rules", label: "Community Rules" }, { to: "/privacy", label: "Privacy" },
      { to: "/disclaimer", label: "Disclaimer" },
    ]},
  ] as const;

  return (
    <footer className="relative mt-24 border-t border-border bg-background">
      <div className="floodlight pointer-events-none absolute inset-x-0 -top-12 h-24" />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-mal text-3xl font-extrabold text-gradient-gold">ആരവം 26</div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              കേരളത്തിന്റെ ഡിജിറ്റൽ ഫുട്ബോൾ സ്റ്റേഡിയം. An independent fan platform for the 2026 World Cup.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold/90">{c.title}</div>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-foreground/80 hover:text-foreground">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          <p className="max-w-3xl">
            Independent fan platform. Not affiliated with FIFA or any official body. For entertainment only.
            All team names, flags and trademarks belong to their respective owners.
          </p>
          <p className="mt-4">
            Designed &amp; developed by{" "}
            <a href="https://www.kaeonstudios.com" target="_blank" rel="noreferrer" className="font-semibold text-gold hover:underline">Kaeon</a>
            <span className="mx-1.5 text-foreground/40">·</span>
            <a href="https://www.kaeonstudios.com" target="_blank" rel="noreferrer" className="hover:underline">www.kaeonstudios.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
