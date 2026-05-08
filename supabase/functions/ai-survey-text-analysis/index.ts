import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { surveyId, questionId, questionContent } = await req.json();
    if (!surveyId || !questionId) throw new Error("surveyId and questionId required");

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: answers } = await supabase
      .from("survey_answers")
      .select("value")
      .eq("question_id", questionId);

    const texts = (answers ?? [])
      .map((a) => String(a.value ?? "").trim())
      .filter((t) => t.length > 0);

    if (texts.length === 0) throw new Error("Chưa có câu trả lời tự luận nào.");

    const result = await callLovableAI({
      system: `Bạn là chuyên gia phân tích phản hồi khảo sát nhân sự tại doanh nghiệp F&B/Retail Việt Nam. Phân tích các câu trả lời tự luận, tìm ra chủ đề chính và sentiment tổng quan. Trả lời bằng tiếng Việt, ngắn gọn, thực tiễn.`,
      user: `Câu hỏi khảo sát: "${questionContent ?? "Câu tự luận"}"

${texts.length} câu trả lời:
${texts.slice(0, 50).map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
      tool: {
        name: "emit_text_analysis",
        description: "Phân tích tập hợp câu trả lời tự luận",
        parameters: {
          type: "object",
          properties: {
            sentiment: { type: "string", enum: ["positive", "neutral", "negative", "mixed"], description: "Sentiment chung" },
            sentiment_summary: { type: "string", description: "Tóm tắt sentiment 1-2 câu" },
            themes: {
              type: "array",
              description: "3-5 chủ đề chính được nhắc đến",
              items: {
                type: "object",
                properties: {
                  label: { type: "string", description: "Tên chủ đề ngắn gọn" },
                  count: { type: "number", description: "Ước tính số người đề cập" },
                  sample: { type: "string", description: "1 câu trả lời tiêu biểu (trích nguyên văn)" },
                },
                required: ["label", "count", "sample"],
              },
            },
            key_insight: { type: "string", description: "Insight quan trọng nhất rút ra từ toàn bộ phản hồi" },
          },
          required: ["sentiment", "sentiment_summary", "themes", "key_insight"],
        },
      },
    }) as { sentiment: string; sentiment_summary: string; themes: { label: string; count: number; sample: string }[]; key_insight: string };

    return new Response(JSON.stringify({ ...result, total_analyzed: texts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-survey-text-analysis error:", e);
    return errorResponse(e);
  }
});
