import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { surveyId } = await req.json();
    if (!surveyId) throw new Error("surveyId required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [survey, questions, responses, answers] = await Promise.all([
      supabase.from("surveys").select("title,description").eq("id", surveyId).maybeSingle(),
      supabase.from("survey_questions").select("id,type,content,options").eq("survey_id", surveyId),
      supabase.from("survey_responses").select("id").eq("survey_id", surveyId).limit(1000),
      supabase.from("survey_answers").select("question_id,value").in(
        "response_id",
        (await supabase.from("survey_responses").select("id").eq("survey_id", surveyId).limit(1000)).data?.map((r: { id: string }) => r.id) ?? []
      ).limit(5000),
    ]);

    // Aggregate per question
    const qs = questions.data ?? [];
    const ans = answers.data ?? [];
    const summary = qs.map((q: { id: string; type: string; content: string; options: unknown }) => {
      const myAns = ans.filter((a: { question_id: string }) => a.question_id === q.id);
      if (q.type === "essay") {
        return {
          question: q.content, type: q.type,
          texts: myAns.slice(0, 50).map((a: { value: unknown }) => String(a.value ?? "")).filter(Boolean),
        };
      }
      const counts: Record<string, number> = {};
      myAns.forEach((a: { value: unknown }) => {
        const v = a.value;
        if (Array.isArray(v)) v.forEach((x) => { counts[String(x)] = (counts[String(x)] ?? 0) + 1; });
        else if (v !== null && v !== undefined) counts[String(v)] = (counts[String(v)] ?? 0) + 1;
      });
      return { question: q.content, type: q.type, options: q.options, counts, total: myAns.length };
    });

    const result = await callLovableAI({
      system: "Bạn là chuyên gia phân tích khảo sát đào tạo. Hãy đọc dữ liệu khảo sát và trả về phân tích bằng tiếng Việt: sentiment tổng quan, top 3 vấn đề nổi cộm (có dẫn chứng số liệu), và 3 gợi ý cải thiện cụ thể cho HR/L&D.",
      user: `Khảo sát: "${survey.data?.title ?? ""}" — ${responses.data?.length ?? 0} phản hồi.\nDữ liệu câu hỏi:\n${JSON.stringify(summary, null, 2)}`,
      tool: {
        name: "emit_survey_insight",
        description: "Trả về phân tích khảo sát",
        parameters: {
          type: "object",
          properties: {
            sentiment: { type: "string" },
            top_issues: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
          },
          required: ["sentiment", "top_issues", "suggestions"],
        },
      },
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-survey-summary error:", e);
    return errorResponse(e);
  }
});
