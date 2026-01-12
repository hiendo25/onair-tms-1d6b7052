import { useEffect, useEffectEvent } from "react";

import { supabase } from "@/services";

export function useSubscribeNotifications(employeeId: string, onNew: (n: any) => void) {
  const handleNew = useEffectEvent(onNew);

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
          handleNew(payload.new);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeId]);
}
