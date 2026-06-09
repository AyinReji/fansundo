import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/disclaimer")({
  head: () => ({ meta: [{ title: "Disclaimer · Aaravam 26" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="mb-6 font-display text-4xl">Disclaimer</h1>
      <p className="text-foreground/85">
        Aaravam 26 is an independent fan platform built for the love of football. It is not affiliated with,
        endorsed by, or connected to FIFA or any official governing body. All team names, flags, logos and
        trademarks are property of their respective owners. Content is provided for entertainment purposes only.
      </p>
    </div>
  ),
});
