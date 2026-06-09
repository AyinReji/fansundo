import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useFan } from "@/hooks/useFan";
import { getTeam } from "@/data/teams";

/** Sticky glass header — nav + brand + fan badge. Mobile menu collapses below. */
const nav = [
  { to: "/", label: "Home" },
  { to: "/matches", label: "Matches" },
  { to: "/teams", label: "Teams" },
  { to: "/arena", label: "Arena" },
  { to: "/statistics", label: "Stats" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/highlights", label: "Highlights" },
] as const;

export function Header() {
  const fan = useFan();
  const team = fan ? getTeam(fan.teamSlug) : null;
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-mal text-2xl font-extrabold leading-none text-gradient-gold">ആരവം</span>
          <span className="font-display text-lg leading-none text-foreground/90">26</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => {
            const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
            return (
              <Link key={n.to} to={n.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? "text-gold" : "text-foreground/75 hover:text-foreground"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {fan && team ? (
            <Link to="/profile" className="hidden items-center gap-2 rounded-full glass px-3 py-1.5 text-xs sm:flex">
              <span className="text-base leading-none">{team.flag}</span>
              <span className="font-semibold">{fan.username}</span>
            </Link>
          ) : null}
          <button onClick={() => setOpen((v) => !v)} className="rounded-md p-2 lg:hidden" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border lg:hidden">
          <div className="mx-auto max-w-7xl flex-col px-4 py-3">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-foreground/85 hover:bg-white/5">
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
