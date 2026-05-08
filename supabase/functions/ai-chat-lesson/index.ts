import { corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { lessonTitle, lessonContent, messages } = await req.json();
    if (!lessonTitle || !messages?.length) throw new Error("lessonTitle and messages required");

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Bạn là trợ lý học tập thân thiện cho nhân viên F&B/Retail Việt Nam. Bạn đang hỗ trợ bài học: "${lessonTitle}".
${lessonContent ? `Nội dung bài học:\n${lessonContent}\n` : ""}
Hãy trả lời ngắn gọn, thực tiễn, bằng tiếng Việt. Nếu câu hỏi ngoài phạm vi bài học, nhẹ nhàng chuyển hướng về chủ đề bài học.`,
          },
          ...messages,
        ],
      }),
    });

    if (r.status === 429) throw new Error("RATE_LIMIT");
    if (r.status === 402) throw new Error("PAYMENT_REQUIRED");
    if (!r.ok) throw new Error(`AI gateway ${r.status}`);

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content ?? "Xin lỗi, mình chưa hiểu câu hỏi. Bạn thử hỏi lại nhé.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat-lesson error:", e);
    return errorResponse(e);
  }
});
