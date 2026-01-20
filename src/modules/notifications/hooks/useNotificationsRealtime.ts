import { useEffect } from "react";

import { supabase } from "@/services";
export function useSubscribeNotifications(employeeId: string, onNew: (n: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${employeeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `employee_id=eq.${employeeId}`,
        },
        (payload) => {
          onNew(payload.new);
        },
      )
      .subscribe((status, error) => {
        console.log("Realtime status:", status);

        if (error) {
          console.error("Realtime error:", error);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeId]);
}
