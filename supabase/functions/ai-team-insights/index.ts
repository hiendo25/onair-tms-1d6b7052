import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { orgId, variant = "team", userId } = await req.json();
    if (!orgId) throw new Error("orgId required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Aggregate signals
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    let signals: Record<string, unknown> = {};

    if (variant === "student" && userId) {
      const [subs, enrolls, certs] = await Promise.all([
        supabase.from("assignment_submissions").select("status,assignment_title,deadline,score").eq("user_id", userId).eq("org_id", orgId).limit(50),
        supabase.from("course_enrollments").select("course_id,progress,status").eq("user_id", userId).eq("org_id", orgId).limit(50),
        supabase.from("certificates").select("title,expires_at").eq("user_id", userId).eq("org_id", orgId).limit(20),
      ]);
      signals = {
        submissions: subs.data ?? [],
        enrollments: enrolls.data ?? [],
        certificates: certs.data ?? [],
        now: new Date().toISOString(),
      };
    } else {
      const [emp, courses, subs, certs, branches] = await Promise.all([
        supabase.from("employees").select("id,branch_id,department_id", { count: "exact" }).eq("org_id", orgId).limit(500),
        supabase.from("online_courses").select("id,title,students_count,status").eq("org_id", orgId).limit(50),
        supabase.from("assignment_submissions").select("status,score,assignment_title,deadline").eq("org_id", orgId).gte("created_at", since).limit(500),
        supabase.from("certificates").select("title,expires_at").eq("org_id", orgId).lte("expires_at", new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()).limit(50),
        supabase.from("branches").select("id,name").eq("org_id", orgId).limit(50),
      ]);
      const totalSubs = subs.data?.length ?? 0;
      const overdue = (subs.data ?? []).filter((s: { status: string; deadline: string | null }) => s.status === "pending" && s.deadline && new Date(s.deadline) < new Date()).length;
      const avgScore = (subs.data ?? []).filter((s: { score: number | null }) => s.score != null).reduce((a: number, s: { score: number }) => a + Number(s.score), 0) / Math.max(1, (subs.data ?? []).filter((s: { score: number | null }) => s.score != null).length);
      signals = {
        total_employees: emp.count ?? 0,
        total_branches: branches.data?.length ?? 0,
        courses: courses.data ?? [],
        submissions_30d: totalSubs,
        overdue_submissions: overdue,
        avg_score: Number(avgScore.toFixed(2)) || 0,
        expiring_certificates: certs.data ?? [],
      };
    }

    const system = variant === "student"
      ? "Bạn là trợ lý học tập cho học viên Highlands Coffee. Dựa trên dữ liệu cá nhân, đưa ra 3 gợi ý hành động ngắn gọn, thiết thực bằng tiếng Việt. Mỗi gợi ý có severity (warning/info/success), title (ngắn), detail (1 câu), ctaLabel, và to (đường dẫn route). Các route hợp lệ: /my-assignments, /my-courses, /my-learning-paths, /my-certificates, /my-gamification."
      : "Bạn là trợ lý vận hành đào tạo chuỗi F&B. Dựa trên dữ liệu tổng hợp 30 ngày của tổ chức, đưa ra 3-4 insights cho admin: cảnh báo rủi ro, xu hướng cần chú ý, thành tích nổi bật. Mỗi insight có severity (warning/info/success), title (ngắn), detail (1 câu, có số liệu cụ thể nếu có), ctaLabel, và to (route). Các route hợp lệ: /admin/employees, /admin/online-course, /admin/report/overview, /analytic, /admin/certificates.";

    const result = await callLovableAI({
      system,
      user: `Dữ liệu:\n${JSON.stringify(signals, null, 2)}`,
      tool: {
        name: "emit_insights",
        description: "Trả về danh sách insights",
        parameters: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string", enum: ["warning", "info", "success"] },
                  title: { type: "string" },
                  detail: { type: "string" },
                  ctaLabel: { type: "string" },
                  to: { type: "string" },
                },
                required: ["severity", "title", "detail", "ctaLabel", "to"],
              },
            },
          },
          required: ["insights"],
        },
      },
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-team-insights error:", e);
    return errorResponse(e);
  }
});
