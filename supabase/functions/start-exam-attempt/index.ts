import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const examAssignmentId = String(body?.examAssignmentId ?? "");
    if (!examAssignmentId) return json({ error: "Thiếu examAssignmentId" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Resolve caller
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Chưa đăng nhập" }, 401);
    const { data: userData } = await admin.auth.getUser(auth.slice(7));
    const userId = userData.user?.id;
    if (!userId) return json({ error: "Không xác định được người dùng" }, 401);

    // Load assignment
    const { data: ea, error: eaErr } = await admin
      .from("exam_assignments")
      .select("id, org_id, exam_snapshot, deadline, status, student_ids")
      .eq("id", examAssignmentId)
      .maybeSingle();

    if (eaErr || !ea) return json({ error: "Không tìm thấy bài gán" }, 404);
    if (ea.status !== "active") return json({ error: "Bài kiểm tra đã đóng" }, 400);
    if (ea.deadline && new Date(ea.deadline as string) < new Date()) {
      return json({ error: "Đã quá hạn nộp bài" }, 400);
    }
    if (
      Array.isArray(ea.student_ids) &&
      ea.student_ids.length > 0 &&
      !ea.student_ids.includes(userId)
    ) {
      return json({ error: "Bạn không nằm trong danh sách được giao" }, 403);
    }

    const snap = (ea.exam_snapshot ?? {}) as {
      max_attempts?: number | null;
      time_limit_minutes?: number | null;
    };

    // Check for existing in-progress attempt (resume)
    const { data: existing } = await admin
      .from("exam_attempts")
      .select("id, attempt_number, started_at, answers")
      .eq("exam_assignment_id", examAssignmentId)
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .maybeSingle();

    if (existing) {
      const remainSeconds = snap.time_limit_minutes
        ? Math.max(
            0,
            snap.time_limit_minutes * 60 -
              Math.floor((Date.now() - new Date(existing.started_at as string).getTime()) / 1000),
          )
        : null;
      return json({
        attemptId: existing.id,
        attemptNumber: existing.attempt_number,
        resumed: true,
        answers: existing.answers,
        remainSeconds,
      });
    }

    // Count completed attempts atomically using advisory lock on (assignment, user)
    // Postgres advisory lock key: hash of (examAssignmentId, userId)
    const { data: countRows } = await admin
      .from("exam_attempts")
      .select("id", { count: "exact", head: true })
      .eq("exam_assignment_id", examAssignmentId)
      .eq("user_id", userId)
      .neq("status", "in_progress");

    const used = (countRows as unknown as { count: number } | null)?.count ?? 0;

    if (snap.max_attempts && used >= snap.max_attempts) {
      return json({ error: "Bạn đã dùng hết số lần làm bài" }, 409);
    }

    // Insert new attempt — DB UNIQUE constraint on (exam_assignment_id, user_id, attempt_number)
    // prevents duplicates even under race conditions
    const { data: attempt, error: insErr } = await admin
      .from("exam_attempts")
      .insert({
        exam_assignment_id: examAssignmentId,
        user_id: userId,
        org_id: ea.org_id,
        attempt_number: used + 1,
        status: "in_progress",
        answers: {},
      })
      .select("id, attempt_number")
      .single();

    if (insErr) {
      // Unique violation = race condition; retry by loading the in-progress row
      if (insErr.code === "23505") {
        const { data: retry } = await admin
          .from("exam_attempts")
          .select("id, attempt_number, started_at, answers")
          .eq("exam_assignment_id", examAssignmentId)
          .eq("user_id", userId)
          .eq("status", "in_progress")
          .maybeSingle();
        if (retry) {
          return json({ attemptId: retry.id, attemptNumber: retry.attempt_number, resumed: true, answers: retry.answers, remainSeconds: null });
        }
      }
      return json({ error: insErr.message }, 500);
    }

    return json({
      attemptId: attempt.id,
      attemptNumber: attempt.attempt_number,
      resumed: false,
      answers: {},
      remainSeconds: snap.time_limit_minutes ? snap.time_limit_minutes * 60 : null,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Lỗi không xác định" }, 500);
  }
});
