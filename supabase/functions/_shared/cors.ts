export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export async function callLovableAI(opts: {
  system: string;
  user: string;
  tool: { name: string; description: string; parameters: Record<string, unknown> };
}): Promise<unknown> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      tools: [{ type: "function", function: opts.tool }],
      tool_choice: { type: "function", function: { name: opts.tool.name } },
    }),
  });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (r.status === 402) throw new Error("PAYMENT_REQUIRED");
  if (!r.ok) throw new Error(`AI gateway ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("No tool call in AI response");
  return JSON.parse(args);
}

export function errorResponse(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  let status = 500;
  let userMsg = "Có lỗi khi gọi AI, vui lòng thử lại.";
  if (msg === "RATE_LIMIT") { status = 429; userMsg = "Đang quá tải, hãy thử lại sau ít phút."; }
  if (msg === "PAYMENT_REQUIRED") { status = 402; userMsg = "Workspace đã hết credit AI."; }
  return new Response(JSON.stringify({ error: userMsg }), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
