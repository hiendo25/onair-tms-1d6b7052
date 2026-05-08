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
    const attemptId = String(body?.attemptId ?? "");
    const auto = Boolean(body?.auto);

    if (!attemptId) return json({ error: "Thiếu attemptId" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify caller owns this attempt
    let callerId: string | null = null;
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const { data } = await admin.auth.getUser(auth.slice(7));
      callerId = data.user?.id ?? null;
    }

    // Load attempt
    const { data: attempt, error: aErr } = await admin
      .from("exam_attempts")
      .select("id, exam_assignment_id, user_id, org_id, status, answers, attempt_number")
      .eq("id", attemptId)
      .maybeSingle();

    if (aErr || !attempt) return json({ error: "Không tìm thấy lần làm bài" }, 404);
    if (callerId && attempt.user_id !== callerId) return json({ error: "Không có quyền" }, 403);
    if (attempt.status !== "in_progress") return json({ error: "Bài đã được nộp" }, 409);

    // Load exam assignment for settings
    const { data: ea, error: eaErr } = await admin
      .from("exam_assignments")
      .select("id, exam_id, exam_snapshot, deadline")
      .eq("id", attempt.exam_assignment_id)
      .maybeSingle();

    if (eaErr || !ea) return json({ error: "Không tìm thấy bài gán" }, 404);

    // Check deadline
    if (ea.deadline && new Date(ea.deadline as string) < new Date()) {
      // Still allow submit if auto (time ran out) or the deadline just passed
    }

    const snap = (ea.exam_snapshot ?? {}) as {
      pass_score?: number;
      total_points?: number;
      questions?: Array<{ id: string; points?: number }>;
    };

    const snapQuestions = snap.questions ?? [];
    const questionIds = snapQuestions.map((q) => q.id).filter(Boolean);

    // Load correct_answers from question_bank (server-side only)
    const { data: bankRows } = questionIds.length
      ? await admin
          .from("question_bank")
          .select("id, correct_answers, type")
          .in("id", questionIds)
      : { data: [] };

    const bankMap = new Map(
      (bankRows ?? []).map((r: { id: string; correct_answers: string[]; type: string }) => [r.id, r]),
    );

    const answers = (attempt.answers ?? {}) as Record<string, string | string[]>;

    // Grade
    let earned = 0;
    for (const sq of snapQuestions) {
      const bank = bankMap.get(sq.id);
      if (!bank) continue;
      const ans = answers[sq.id];
      const correct: string[] = (bank.correct_answers ?? []).map(String);
      let ok = false;
      if (bank.type === "multiple") {
        const a1 = (Array.isArray(ans) ? ans : []).map(String).sort();
        const c1 = correct.slice().sort();
        ok = a1.length === c1.length && a1.every((v, i) => v === c1[i]);
      } else {
        ok = String(ans ?? "") === String(correct[0] ?? "");
      }
      if (ok) earned += sq.points || 0;
    }

    const totalPoints =
      snap.total_points ||
      snapQuestions.reduce((s, q) => s + (q.points || 0), 0) ||
      1;
    const scorePct = Math.round((earned / totalPoints) * 100);
    const passed = scorePct >= (snap.pass_score ?? 0);

    const { error: uErr } = await admin
      .from("exam_attempts")
      .update({
        answers,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        score: earned,
        passed,
      })
      .eq("id", attemptId);

    if (uErr) return json({ error: "Không lưu được kết quả" }, 500);

    const showResults = (ea.exam_snapshot as { show_results?: boolean })?.show_results !== false;

    return json({
      ok: true,
      auto,
      earned,
      totalPoints,
      scorePct,
      passed,
      showResults,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Lỗi không xác định" }, 500);
  }
});
