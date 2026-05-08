import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { orgId } = await req.json();
    if (!orgId) throw new Error("orgId required");

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = new Date();
    // Build 3 monthly buckets: M-2, M-1, M
    const months = [2, 1, 0].map((offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return {
        label: `${d.getMonth() + 1}/${d.getFullYear()}`,
        from: new Date(d.getFullYear(), d.getMonth(), 1).toISOString(),
        to: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString(),
      };
    });

    const [{ data: branches }, { data: employees }] = await Promise.all([
      supabase.from("branches").select("id, name").eq("org_id", orgId),
      supabase.from("employees").select("id, branch, user_id, status").eq("org_id", orgId),
    ]);

    const brs = branches ?? [];
    const emps = (employees ?? []).filter((e) => e.status === "active");

    // Fetch completions per month
    const monthlyData = await Promise.all(
      months.map(async (m) => {
        const { data: prog } = await supabase
          .from("user_course_progress")
          .select("user_id, progress, status")
          .eq("org_id", orgId)
          .gte("updated_at", m.from)
          .lte("updated_at", m.to);
        const { data: subs } = await supabase
          .from("assignment_submissions")
          .select("user_id, score, status")
          .eq("org_id", orgId)
          .gte("submitted_at", m.from)
          .lte("submitted_at", m.to);
        const p = prog ?? [];
        const s = subs ?? [];
        const completed = p.filter((x) => x.status === "completed" || (x.progress ?? 0) >= 100).length;
        const passed = s.filter((x) => x.status === "passed").length;
        const avgScore = s.length ? (s.reduce((acc, x) => acc + (x.score ?? 0), 0) / s.length).toFixed(1) : null;
        return { label: m.label, completed, passed, avgScore, totalSubs: s.length };
      })
    );

    // Per-branch trend: completion rate each month
    const branchTrend = await Promise.all(
      brs.slice(0, 8).map(async (b) => {
        const branchUserIds = emps.filter((e) => e.branch === b.name && e.user_id).map((e) => e.user_id);
        if (!branchUserIds.length) return { name: b.name, months: months.map(() => 0) };
        const rates = await Promise.all(
          months.map(async (m) => {
            const { data: prog } = await supabase
              .from("user_course_progress")
              .select("progress, status")
              .eq("org_id", orgId)
              .in("user_id", branchUserIds)
              .gte("updated_at", m.from)
              .lte("updated_at", m.to);
            const p = prog ?? [];
            if (!p.length) return 0;
            return Math.round(p.filter((x) => x.status === "completed" || (x.progress ?? 0) >= 100).length / p.length * 100);
          })
        );
        return { name: b.name, months: rates };
      })
    );

    const result = await callLovableAI({
      system: `Bạn là chuyên gia phân tích xu hướng đào tạo nhân sự F&B/Retail. Phân tích dữ liệu 3 tháng gần nhất, nhận diện xu hướng tăng/giảm, điểm bất thường và đưa ra dự đoán. Trả lời ngắn gọn bằng tiếng Việt.`,
      user: `Dữ liệu đào tạo 3 tháng:
${monthlyData.map((m) => `${m.label}: ${m.completed} khóa hoàn thành, ${m.passed}/${m.totalSubs} bài đạt, điểm TB ${m.avgScore ?? "N/A"}`).join("\n")}

Xu hướng theo chi nhánh:
${branchTrend.filter((b) => b.months.some((v) => v > 0)).slice(0, 5).map((b) => `${b.name}: ${b.months.join("% → ")}%`).join("\n")}`,
      tool: {
        name: "emit_trend_analysis",
        description: "Phân tích xu hướng 3 tháng",
        parameters: {
          type: "object",
          properties: {
            trend_direction: { type: "string", enum: ["improving", "stable", "declining", "mixed"] },
            summary: { type: "string", description: "Nhận xét tổng quan 2-3 câu" },
            key_findings: { type: "array", items: { type: "string" }, description: "3 phát hiện quan trọng" },
            anomalies: { type: "array", items: { type: "string" }, description: "1-2 điểm bất thường cần chú ý" },
            forecast: { type: "string", description: "Dự đoán ngắn cho tháng tới" },
          },
          required: ["trend_direction", "summary", "key_findings", "anomalies", "forecast"],
        },
      },
    }) as { trend_direction: string; summary: string; key_findings: string[]; anomalies: string[]; forecast: string };

    return new Response(JSON.stringify({ ...result, monthlyData, branchTrend }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-trend-analysis error:", e);
    return errorResponse(e);
  }
});
