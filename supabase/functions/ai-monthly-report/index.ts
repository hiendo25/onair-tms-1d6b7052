import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { orgId, month, year } = await req.json();
    if (!orgId) throw new Error("orgId required");

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const from = new Date(y, m - 1, 1).toISOString();
    const to = new Date(y, m, 0, 23, 59, 59).toISOString();

    const [{ data: employees }, { data: branches }, { data: progress }, { data: submissions }, { data: certs }] = await Promise.all([
      supabase.from("employees").select("id, branch, department, status").eq("org_id", orgId),
      supabase.from("branches").select("id, name").eq("org_id", orgId),
      supabase.from("course_enrollments").select("user_id, status, progress, updated_at").eq("org_id", orgId).gte("updated_at", from).lte("updated_at", to),
      supabase.from("assignment_submissions").select("user_id, score, status, submitted_at").eq("org_id", orgId).gte("submitted_at", from).lte("submitted_at", to),
      supabase.from("employee_certificates").select("id, issued_at").gte("issued_at", from).lte("issued_at", to),
    ]);

    const emps = employees ?? [];
    const brs = branches ?? [];
    const prog = progress ?? [];
    const subs = submissions ?? [];
    const certsList = certs ?? [];

    const activeEmps = emps.filter((e) => e.status === "active").length;
    const completedCount = prog.filter((p) => p.status === "completed" || (p.progress ?? 0) >= 100).length;
    const passedCount = subs.filter((s) => s.status === "passed").length;
    const avgScore = subs.length ? (subs.reduce((s, sub) => s + (sub.score ?? 0), 0) / subs.length).toFixed(1) : "N/A";

    // Per-branch breakdown
    const branchStats = brs.map((b) => {
      const branchEmps = emps.filter((e) => e.branch === b.name);
      const branchUserIds = new Set(branchEmps.map((e) => e.id));
      const branchProg = prog.filter((p) => branchUserIds.has(p.user_id));
      const branchCompleted = branchProg.filter((p) => p.status === "completed" || (p.progress ?? 0) >= 100).length;
      const rate = branchProg.length ? Math.round((branchCompleted / branchProg.length) * 100) : 0;
      return { name: b.name, employees: branchEmps.length, completionRate: rate, completed: branchCompleted };
    }).filter((b) => b.employees > 0).sort((a, b) => b.completionRate - a.completionRate);

    const result = await callLovableAI({
      system: `Bạn là chuyên gia phân tích đào tạo nhân sự. Viết báo cáo tháng súc tích, chuyên nghiệp bằng tiếng Việt. Tập trung vào các con số quan trọng, điểm nổi bật và hành động cần làm.`,
      user: `Báo cáo đào tạo tháng ${m}/${y}:
- Tổng nhân viên hoạt động: ${activeEmps}
- Khóa học hoàn thành trong tháng: ${completedCount}
- Bài kiểm tra đã nộp: ${subs.length} | Đạt: ${passedCount}
- Điểm trung bình: ${avgScore}
- Chứng chỉ cấp mới: ${certsList.length}

Theo chi nhánh (top 5):
${branchStats.slice(0, 5).map((b) => `- ${b.name}: ${b.completionRate}% hoàn thành (${b.employees} nhân viên)`).join("\n")}
${branchStats.length > 5 ? `... và ${branchStats.length - 5} chi nhánh khác` : ""}`,
      tool: {
        name: "emit_monthly_report",
        description: "Báo cáo tổng kết đào tạo tháng",
        parameters: {
          type: "object",
          properties: {
            headline: { type: "string", description: "Câu tóm tắt kết quả nổi bật nhất tháng" },
            highlights: { type: "array", items: { type: "string" }, description: "3-4 điểm sáng trong tháng" },
            concerns: { type: "array", items: { type: "string" }, description: "2-3 vấn đề cần chú ý" },
            actions: { type: "array", items: { type: "string" }, description: "3 hành động đề xuất cho tháng tới" },
            top_branch: { type: "string", description: "Tên chi nhánh dẫn đầu và lý do" },
          },
          required: ["headline", "highlights", "concerns", "actions"],
        },
      },
    }) as { headline: string; highlights: string[]; concerns: string[]; actions: string[]; top_branch?: string };

    return new Response(JSON.stringify({ ...result, month: m, year: y, stats: { activeEmps, completedCount, passedCount, avgScore, certsCount: certsList.length }, branchStats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-monthly-report error:", e);
    return errorResponse(e);
  }
});
