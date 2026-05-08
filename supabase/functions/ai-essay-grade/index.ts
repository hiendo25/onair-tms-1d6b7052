import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { question, answer } = await req.json();
    if (!question || !answer) throw new Error("question and answer are required");

    const result = await callLovableAI({
      system: `Bạn là giảng viên chấm bài tự luận của nhân viên trong doanh nghiệp chuỗi F&B/Retail Việt Nam. Hãy chấm bài dựa trên mức độ đúng, đầy đủ và rõ ràng của câu trả lời. Trả về điểm từ 0-10 (lẻ 0.5) và nhận xét ngắn gọn bằng tiếng Việt, nêu rõ điểm tốt và điểm cần cải thiện.`,
      user: `Câu hỏi: ${question}\n\nBài làm của học viên: ${answer}`,
      tool: {
        name: "grade_essay",
        description: "Chấm điểm bài tự luận",
        parameters: {
          type: "object",
          properties: {
            score: { type: "number", description: "Điểm từ 0 đến 10, có thể là 0.5, 1.0, ..., 10.0" },
            feedback: { type: "string", description: "Nhận xét ngắn gọn bằng tiếng Việt (2-4 câu), nêu điểm tốt và cần cải thiện" },
          },
          required: ["score", "feedback"],
        },
      },
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-essay-grade error:", e);
    return errorResponse(e);
  }
});
