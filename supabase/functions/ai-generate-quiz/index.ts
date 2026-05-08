import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { lessonTitle, content = "", count = 8 } = await req.json();
    if (!lessonTitle) throw new Error("lessonTitle required");

    const result = await callLovableAI({
      system: `Bạn là chuyên gia ra đề thi cho doanh nghiệp F&B/Retail Việt Nam. Tạo câu hỏi trắc nghiệm thực tiễn, sát với nội dung bài học, phù hợp với nhân viên frontline. Câu hỏi cần rõ ràng, đáp án nhiễu hợp lý.`,
      user: `Tạo ${count} câu hỏi trắc nghiệm 4 đáp án cho bài học: "${lessonTitle}"
${content ? `\nNội dung bài học:\n${content}` : ""}`,
      tool: {
        name: "emit_quiz_questions",
        description: "Danh sách câu hỏi trắc nghiệm",
        parameters: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" }, description: "Đúng 4 đáp án" },
                  correct_index: { type: "number", description: "Index (0-3) của đáp án đúng" },
                  explanation: { type: "string", description: "Giải thích ngắn gọn tại sao đúng" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                },
                required: ["question", "options", "correct_index", "explanation", "difficulty"],
              },
            },
          },
          required: ["questions"],
        },
      },
    }) as { questions: { question: string; options: string[]; correct_index: number; explanation: string; difficulty: string }[] };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-generate-quiz error:", e);
    return errorResponse(e);
  }
});
