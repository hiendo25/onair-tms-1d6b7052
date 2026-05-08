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

    // Courses that have a certificate linked
    const { data: certCourses } = await supabase
      .from("online_courses")
      .select("id, title, certificate_id, is_required, pass_score")
      .eq("org_id", orgId)
      .not("certificate_id", "is", null);

    if (!certCourses?.length) {
      return new Response(JSON.stringify({ eligible: [], not_ready: [], message: "Không có khóa học nào được gắn chứng chỉ." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const courseIds = certCourses.map((c) => c.id);

    const [{ data: employees }, { data: progress }, { data: submissions }, { data: existingCerts }] = await Promise.all([
      supabase.from("employees").select("id, name, employee_code, department, branch, user_id").eq("org_id", orgId).eq("status", "active"),
      supabase.from("user_course_progress").select("user_id, course_id, status, progress").eq("org_id", orgId).in("course_id", courseIds),
      supabase.from("assignment_submissions").select("user_id, score, status").eq("org_id", orgId),
      supabase.from("employee_certificates").select("employee_id, certificate_id"),
    ]);

    const emps = (employees ?? []).filter((e) => e.user_id);
    const prog = progress ?? [];
    const subs = submissions ?? [];
    const issued = new Set((existingCerts ?? []).map((c: { employee_id: string; certificate_id: string }) => `${c.employee_id}:${c.certificate_id}`));

    type EligibleRow = { employee_id: string; user_id: string; name: string; department: string; branch: string; employee_code: string; course_id: string; course_title: string; certificate_id: string; pass_score: number };
    type NotReadyRow = { employee_id: string; name: string; course_title: string; missing: string[] };

    const eligible: EligibleRow[] = [];
    const not_ready: NotReadyRow[] = [];

    for (const emp of emps) {
      for (const course of certCourses) {
        const alreadyIssued = issued.has(`${emp.id}:${course.certificate_id}`);
        if (alreadyIssued) continue;

        const userProg = prog.find((p) => p.user_id === emp.user_id && p.course_id === course.id);
        const completed = userProg && (userProg.status === "completed" || (userProg.progress ?? 0) >= 100);
        const passScore = course.pass_score ?? 7;
        const userSub = subs.filter((s) => s.user_id === emp.user_id).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
        const passed = userSub && (userSub.score ?? 0) >= passScore;

        if (completed && passed) {
          eligible.push({
            employee_id: emp.id, user_id: emp.user_id, name: emp.name,
            department: emp.department ?? "", branch: emp.branch ?? "",
            employee_code: emp.employee_code ?? "",
            course_id: course.id, course_title: course.title,
            certificate_id: course.certificate_id!, pass_score: passScore,
          });
        } else if (userProg) {
          const missing: string[] = [];
          if (!completed) missing.push(`Tiến độ ${userProg.progress ?? 0}% (chưa hoàn thành)`);
          if (!passed) missing.push(`Điểm ${userSub?.score ?? 0}/${passScore} (chưa đạt)`);
          not_ready.push({ employee_id: emp.id, name: emp.name, course_title: course.title, missing });
        }
      }
    }

    return new Response(JSON.stringify({ eligible, not_ready, total_eligible: eligible.length, total_not_ready: not_ready.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-cert-readiness error:", e);
    return errorResponse(e);
  }
});
