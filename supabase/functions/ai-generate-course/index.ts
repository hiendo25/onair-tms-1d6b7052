import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { topic, lessonCount = 5, audience = "nhân viên" } = await req.json();
    if (!topic) throw new Error("topic required");

    const result = await callLovableAI({
      system: `Bạn là chuyên gia thiết kế chương trình đào tạo cho doanh nghiệp chuỗi F&B/Retail Việt Nam. Tạo outline khóa học thực tiễn, ngắn gọn, phù hợp với nhân viên frontline. Nội dung phải sát với thực tế vận hành.`,
      user: `Tạo outline khóa học về chủ đề: "${topic}" dành cho "${audience}". Yêu cầu ${lessonCount} bài học, chia thành 2-4 phần (module). Mỗi module cần: tên, mô tả ngắn, danh sách bài học cụ thể, và 2-3 câu hỏi trắc nghiệm mẫu.`,
      tool: {
        name: "emit_course_outline",
        description: "Trả về outline khóa học có cấu trúc",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
            duration_minutes: { type: "number" },
            modules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  lessons: { type: "array", items: { type: "string" } },
                  sample_questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: { type: "array", items: { type: "string" } },
                        correct_index: { type: "number" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correct_index", "explanation"],
                    },
                  },
                },
                required: ["title", "description", "lessons", "sample_questions"],
              },
            },
          },
          required: ["title", "description", "category", "level", "duration_minutes", "modules"],
        },
      },
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-generate-course error:", e);
    return errorResponse(e);
  }
});
