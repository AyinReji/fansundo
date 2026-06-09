import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/rules")({
  head: () => ({ meta: [{ title: "Community Rules · Aaravam 26" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="mb-6 font-display text-4xl">Community Rules</h1>
      <ul className="space-y-3 text-foreground/85">
        <li>1. Be respectful. Banter yes, abuse no.</li>
        <li>2. No spam, flooding, or copy-paste messages.</li>
        <li>3. No hate speech, slurs, or personal attacks.</li>
        <li>4. One message every 3 seconds — keep the arena fair.</li>
        <li>5. Moderators have the final word.</li>
      </ul>
    </div>
  ),
});
