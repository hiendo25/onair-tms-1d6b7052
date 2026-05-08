import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { assignmentId } = await req.json();
    if (!assignmentId) throw new Error("assignmentId required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [examQs, attempts, exAssign] = await Promise.all([
      supabase.from("exam_questions").select("question_id,points,sort_order").eq("assignment_id", assignmentId),
      supabase.from("exam_assignments").select("id").eq("assignment_id", assignmentId).limit(50),
      supabase.from("assignments").select("title").eq("id", assignmentId).maybeSingle(),
    ]);

    const examIds = (attempts.data ?? []).map((e: { id: string }) => e.id);
    const att = examIds.length
      ? await supabase.from("exam_attempts").select("answers,score,passed,status").in("exam_assignment_id", examIds).eq("status", "submitted").limit(500)
      : { data: [] };

    const qIds = (examQs.data ?? []).map((q: { question_id: string }) => q.question_id);
    const bank = qIds.length
      ? await supabase.from("question_bank").select("id,question,title,type,options,correct_answer,correct_answers,explanation,difficulty").in("id", qIds)
      : { data: [] };

    // Build per-question stats
    const stats = (bank.data ?? []).map((q: { id: string; question: string; title: string; type: string; correct_answer: string; correct_answers: unknown; difficulty: string }) => {
      let total = 0, correct = 0;
      const wrongChoices: Record<string, number> = {};
      const correctSet = new Set(
        Array.isArray(q.correct_answers) && q.correct_answers.length
          ? (q.correct_answers as unknown[]).map(String)
          : [String(q.correct_answer)]
      );
      (att.data ?? []).forEach((a: { answers: Record<string, unknown> }) => {
        const ans = a.answers?.[q.id];
        if (ans === undefined || ans === null) return;
        total += 1;
        const arr = Array.isArray(ans) ? ans.map(String) : [String(ans)];
        const isCorrect = arr.length === correctSet.size && arr.every((x) => correctSet.has(x));
        if (isCorrect) correct += 1;
        else arr.forEach((x) => { wrongChoices[x] = (wrongChoices[x] ?? 0) + 1; });
      });
      return {
        question_id: q.id,
        question: q.title || q.question,
        difficulty: q.difficulty,
        total_answers: total,
        correct_rate: total ? Number((correct / total).toFixed(2)) : null,
        top_wrong_choices: Object.entries(wrongChoices).sort((a, b) => b[1] - a[1]).slice(0, 3),
      };
    });

    const totalAttempts = (att.data ?? []).length;
    const avgScore = totalAttempts ? (att.data ?? []).reduce((a: number, x: { score: number | null }) => a + Number(x.score ?? 0), 0) / totalAttempts : 0;
    const passRate = totalAttempts ? (att.data ?? []).filter((x: { passed: boolean | null }) => x.passed).length / totalAttempts : 0;

    const result = await callLovableAI({
      system: "Bạn là chuyên gia thiết kế bài kiểm tra. Phân tích item analysis: tìm câu hỏi có vấn đề (correct_rate < 0.4 hoặc > 0.95, distractor yếu, độ khó không khớp). Trả về tóm tắt + danh sách câu hỏi cần xem lại + đề xuất cải thiện cụ thể bằng tiếng Việt.",
      user: `Bài kiểm tra: "${exAssign.data?.title ?? ""}"\nTổng lượt làm: ${totalAttempts}, Điểm TB: ${avgScore.toFixed(2)}, Tỷ lệ đạt: ${(passRate * 100).toFixed(0)}%\n\nThống kê từng câu:\n${JSON.stringify(stats, null, 2)}`,
      tool: {
        name: "emit_item_analysis",
        description: "Trả về phân tích item analysis",
        parameters: {
          type: "object",
          properties: {
            overview: { type: "string" },
            problem_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  issue: { type: "string" },
                  suggestion: { type: "string" },
                },
                required: ["question", "issue", "suggestion"],
              },
            },
            recommendations: { type: "array", items: { type: "string" } },
          },
          required: ["overview", "problem_questions", "recommendations"],
        },
      },
    });

    return new Response(JSON.stringify({ ...(result as object), stats: { total_attempts: totalAttempts, avg_score: Number(avgScore.toFixed(2)), pass_rate: Number(passRate.toFixed(2)) } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-quiz-item-analysis error:", e);
    return errorResponse(e);
  }
});
