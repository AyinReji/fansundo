import { useEffect, useState } from "react";
import { getFan, saveFan, type FanIdentity } from "@/lib/onboarding";
import { supabase } from "@/integrations/supabase/client";

/** Subscribes to fan identity changes broadcast via custom event. */
export function useFan(): FanIdentity | null {
  const [fan, setFan] = useState<FanIdentity | null>(null);
  useEffect(() => {
    const checkAndRepair = async () => {
      const current = getFan();
      if (current) {
        if (!current.id) {
          try {
            const repaired = await saveFan({
              username: current.username,
              teamSlug: current.teamSlug,
            });
            setFan(repaired);
          } catch (err) {
            console.error("Error repairing fan identity:", err);
            setFan(current);
          }
        } else {
          setFan(current);
          // Sync existing user to database in background in case it's a new DB or not synced
          supabase.from("users").upsert({
            id: current.id,
            device_id: current.deviceId,
            username: current.username,
            selected_team: current.teamSlug,
          }).then(({ error }) => {
            if (error) {
              console.error("Error syncing fan identity to database on mount:", error);
            }
          });
        }
      } else {
        setFan(current);
      }
    };

    checkAndRepair();

    const handler = () => {
      const current = getFan();
      setFan(current);
    };
    window.addEventListener("aaravam:fan-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("aaravam:fan-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return fan;
}
