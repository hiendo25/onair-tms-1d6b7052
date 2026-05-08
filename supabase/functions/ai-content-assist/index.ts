import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, lessonTitle, content = "" } = await req.json();
    if (!action || !lessonTitle) throw new Error("action and lessonTitle required");

    if (action === "summarize") {
      const result = await callLovableAI({
        system: "Bạn là trợ lý học tập. Tóm tắt nội dung bài học thành các bullet points ngắn gọn, dễ nhớ bằng tiếng Việt. Mỗi bullet nêu 1 điểm chính quan trọng.",
        user: `Bài học: "${lessonTitle}"\n\nNội dung: ${content || "(không có nội dung chi tiết, hãy tóm tắt dựa trên tên bài học)"}`,
        tool: {
          name: "emit_summary",
          description: "Trả về danh sách bullet points tóm tắt",
          parameters: {
            type: "object",
            properties: {
              bullets: { type: "array", items: { type: "string" }, description: "5 bullet points tóm tắt bài học" },
            },
            required: ["bullets"],
          },
        },
      }) as { bullets: string[] };
      return new Response(JSON.stringify({ bullets: result.bullets }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "flashcards") {
      const result = await callLovableAI({
        system: "Bạn là chuyên gia tạo flashcard học tập cho nhân viên F&B/Retail Việt Nam. Tạo flashcard dạng hỏi-đáp ngắn gọn, thực tiễn, giúp nhân viên ghi nhớ kiến thức nhanh.",
        user: `Tạo 8-10 flashcard cho bài học: "${lessonTitle}"\n\n${content ? `Nội dung bài học: ${content}` : ""}`,
        tool: {
          name: "emit_flashcards",
          description: "Trả về danh sách flashcard",
          parameters: {
            type: "object",
            properties: {
              cards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string", description: "Câu hỏi ngắn" },
                    back: { type: "string", description: "Câu trả lời ngắn gọn" },
                  },
                  required: ["front", "back"],
                },
              },
            },
            required: ["cards"],
          },
        },
      }) as { cards: { front: string; back: string }[] };
      return new Response(JSON.stringify({ cards: result.cards }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("ai-content-assist error:", e);
    return errorResponse(e);
  }
});
