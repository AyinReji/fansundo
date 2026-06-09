import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy · Aaravam 26" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="mb-6 font-display text-4xl">Privacy Policy</h1>
      <p className="text-foreground/85">
        We collect only what's needed to run the arena: your chosen username, favorite team and a device identifier
        stored locally. Chat messages are broadcast to other fans in the live arena. We do not sell your data.
      </p>
    </div>
  ),
});
