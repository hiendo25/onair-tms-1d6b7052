import { supabase } from "@/integrations/supabase/client";

type LogArgs = {
  orgId: string;
  action: "lesson_complete" | "quiz_submit" | "course_complete" | "login";
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

/** Fire-and-forget logger for `learning_activity`. Safe to await or ignore. */
export async function logLearningActivity({ orgId, action, targetType, targetId, metadata }: LogArgs) {
  try {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid || !orgId) return;
    await supabase.from("learning_activity").insert({
      user_id: uid,
      org_id: orgId,
      action,
      target_type: targetType ?? null,
      target_id: targetId ?? null,
      metadata: (metadata ?? {}) as never,
    });
  } catch {
    // swallow — analytics shouldn't break user flow
  }
}
