import { useEffect, useState } from "react";
import { getFan, type FanIdentity } from "@/lib/onboarding";

/** Subscribes to fan identity changes broadcast via custom event. */
export function useFan(): FanIdentity | null {
  const [fan, setFan] = useState<FanIdentity | null>(null);
  useEffect(() => {
    setFan(getFan());
    const handler = () => setFan(getFan());
    window.addEventListener("aaravam:fan-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("aaravam:fan-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return fan;
}
