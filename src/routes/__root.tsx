import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { OnboardingDialog } from "@/components/site/OnboardingDialog";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Off the pitch</h2>
        <p className="mt-2 text-sm text-muted-foreground">This page isn't in the stadium.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">The match was interrupted</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something broke. Try again.</p>
        <button onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#081511" },
      { title: "Aaravam 26 — Kerala's Digital Football Stadium" },
      { name: "description", content: "Aaravam 26 is the Malayalam-first World Cup 2026 fan platform — live arena, teams, stats, leaderboard, predictions." },
      { property: "og:title", content: "Aaravam 26 — ആരവം 26" },
      { property: "og:description", content: "കേരളത്തിന്റെ ഡിജിറ്റൽ ഫുട്ബോൾ സ്റ്റേഡിയം" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+Chettan+2:wght@500;700;800&family=Noto+Sans+Malayalam:wght@500;700;900&family=Bebas+Neue&family=Orbitron:wght@500;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <OnboardingDialog />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
