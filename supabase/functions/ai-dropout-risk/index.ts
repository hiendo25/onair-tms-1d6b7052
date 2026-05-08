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

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [{ data: employees }, { data: progress }, { data: submissions }, { data: recentLogins }] = await Promise.all([
      supabase.from("employees").select("id, name, department, branch, user_id, employee_code").eq("org_id", orgId).eq("status", "active"),
      supabase.from("user_course_progress").select("user_id, progress, updated_at, status").eq("org_id", orgId),
      supabase.from("assignment_submissions").select("user_id, status, submitted_at").eq("org_id", orgId),
      supabase.from("learning_activities").select("user_id, created_at").eq("org_id", orgId).gte("created_at", sevenDaysAgo),
    ]);

    const emps = (employees ?? []).filter((e) => e.user_id);
    const prog = progress ?? [];
    const subs = submissions ?? [];
    const activeUserIds = new Set((recentLogins ?? []).map((l: { user_id: string }) => l.user_id));

    type RiskEmployee = {
      employee_id: string; user_id: string; name: string; department: string; branch: string; employee_code: string;
      risk_score: number; inactive_days: number; avg_progress: number; fail_count: number;
    };

    const riskData: RiskEmployee[] = emps.map((e) => {
      const userProg = prog.filter((p) => p.user_id === e.user_id);
      const userSubs = subs.filter((s) => s.user_id === e.user_id);
      const avgProgress = userProg.length ? userProg.reduce((s, p) => s + (p.progress ?? 0), 0) / userProg.length : 0;
      const failCount = userSubs.filter((s) => s.status === "failed").length;
      const isActive = activeUserIds.has(e.user_id);

      // Risk score: 0-100
      let score = 0;
      if (!isActive) score += 40;
      if (avgProgress < 20 && userProg.length > 0) score += 30;
      else if (avgProgress < 50 && userProg.length > 0) score += 15;
      if (failCount >= 2) score += 20;
      else if (failCount >= 1) score += 10;
      if (userProg.length === 0) score += 10;

      // Find most recent activity
      const lastProgDates = userProg.map((p) => new Date(p.updated_at ?? 0).getTime()).filter((t) => t > 0);
      const lastActivity = lastProgDates.length ? Math.max(...lastProgDates) : 0;
      const inactiveDays = lastActivity ? Math.round((Date.now() - lastActivity) / 86400000) : 999;

      return {
        employee_id: e.id, user_id: e.user_id, name: e.name,
        department: e.department ?? "", branch: e.branch ?? "", employee_code: e.employee_code ?? "",
        risk_score: Math.min(score, 100), inactive_days: inactiveDays,
        avg_progress: Math.round(avgProgress), fail_count: failCount,
      };
    }).filter((e) => e.risk_score >= 30).sort((a, b) => b.risk_score - a.risk_score).slice(0, 20);

    if (riskData.length === 0) {
      return new Response(JSON.stringify({ at_risk: [], summary: "Không có nhân viên nào có nguy cơ bỏ học trong tổ chức." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await callLovableAI({
      system: `Bạn là chuyên gia phân tích hành vi học tập trong doanh nghiệp F&B/Retail. Dựa trên dữ liệu rủi ro dropout, đưa ra nhận định và gợi ý can thiệp cụ thể, bằng tiếng Việt.`,
      user: `${riskData.length} nhân viên có nguy cơ bỏ học:\n${riskData.slice(0, 10).map((e) =>
        `- ${e.name} (${e.department}/${e.branch}): score=${e.risk_score}, inactive=${e.inactive_days}d, progress=${e.avg_progress}%, fail=${e.fail_count}`
      ).join("\n")}\n\nHãy tóm tắt tình hình và gợi ý 3 hành động can thiệp.`,
      tool: {
        name: "emit_dropout_summary",
        description: "Tóm tắt rủi ro dropout và gợi ý can thiệp",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Nhận định tổng quan 2-3 câu" },
            interventions: {
              type: "array",
              items: { type: "string" },
              description: "3 hành động can thiệp cụ thể",
            },
          },
          required: ["summary", "interventions"],
        },
      },
    }) as { summary: string; interventions: string[] };

    return new Response(JSON.stringify({ at_risk: riskData, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-dropout-risk error:", e);
    return errorResponse(e);
  }
});
