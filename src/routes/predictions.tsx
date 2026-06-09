import { createFileRoute } from "@tanstack/react-router";

const Page = ({ title, body }: { title: string; body: React.ReactNode }) => (
  <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
    <h1 className="mb-6 font-display text-4xl">{title}</h1>
    <div className="prose prose-invert space-y-4 text-foreground/85">{body}</div>
  </div>
);

export const Route = createFileRoute("/predictions")({
  head: () => ({ meta: [{ title: "Predictions · Aaravam 26" }] }),
  component: () => <Page title="Predictions" body={<p>Pick winners, earn points, climb the leaderboard. Predictions open soon.</p>} />,
});
