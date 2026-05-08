import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { employeeId, orgId } = await req.json();
    if (!employeeId || !orgId) throw new Error("employeeId and orgId required");

    // Import supabase client for server-side queries
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch employee
    const { data: emp } = await supabase
      .from("employees")
      .select("name, department, branch, role, position, type, joined_at, user_id")
      .eq("id", employeeId).single();

    if (!emp) throw new Error("Employee not found");

    // Fetch course progress
    const { data: progress } = emp.user_id
      ? await supabase.from("user_course_progress")
          .select("status, progress, course_id")
          .eq("user_id", emp.user_id)
          .eq("org_id", orgId)
      : { data: [] };

    // Fetch assignment submissions
    const { data: submissions } = emp.user_id
      ? await supabase.from("assignment_submissions")
          .select("score, status, submitted_at")
          .eq("user_id", emp.user_id)
      : { data: [] };

    // Fetch required courses
    const { data: requiredCourses } = await supabase
      .from("online_courses")
      .select("id, title")
      .eq("org_id", orgId)
      .eq("is_required", true);

    const prog = progress ?? [];
    const subs = submissions ?? [];
    const reqCourses = requiredCourses ?? [];

    const completedCount = prog.filter((p) => p.status === "completed" || (p.progress ?? 0) >= 100).length;
    const inProgressCount = prog.filter((p) => (p.progress ?? 0) > 0 && (p.progress ?? 0) < 100).length;
    const reqCompleted = prog.filter((p) =>
      reqCourses.some((r) => r.id === p.course_id) && (p.status === "completed" || (p.progress ?? 0) >= 100)
    ).length;
    const avgScore = subs.length
      ? (subs.reduce((s, sub) => s + (sub.score ?? 0), 0) / subs.length).toFixed(1)
      : null;
    const passedCount = subs.filter((s) => s.status === "passed").length;

    const result = await callLovableAI({
      system: `Bạn là chuyên gia phân tích hiệu suất học tập nhân sự trong doanh nghiệp F&B/Retail Việt Nam. Phân tích dựa trên dữ liệu thực, đưa ra nhận xét ngắn gọn, thực tiễn, bằng tiếng Việt.`,
      user: `Phân tích hiệu suất học tập của nhân viên:
Tên: ${emp.name}
Phòng ban: ${emp.department ?? "chưa rõ"} | Chi nhánh: ${emp.branch ?? "chưa rõ"}
Vị trí: ${emp.position ?? emp.role ?? "chưa rõ"} | Loại: ${emp.type ?? "fulltime"}
Ngày vào làm: ${emp.joined_at ?? "chưa rõ"}

Dữ liệu học tập:
- Tổng khóa học đã tham gia: ${prog.length}
- Hoàn thành: ${completedCount} | Đang học: ${inProgressCount}
- Khóa bắt buộc: ${reqCompleted}/${reqCourses.length} hoàn thành
- Bài kiểm tra đã nộp: ${subs.length} | Đạt: ${passedCount}
- Điểm trung bình: ${avgScore ?? "chưa có dữ liệu"}`,
      tool: {
        name: "emit_employee_insight",
        description: "Phân tích hiệu suất học tập nhân viên",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Tóm tắt tổng thể 2-3 câu" },
            performance_level: { type: "string", enum: ["excellent", "good", "average", "needs_improvement"] },
            strengths: { type: "array", items: { type: "string" }, description: "2-3 điểm mạnh" },
            gaps: { type: "array", items: { type: "string" }, description: "2-3 điểm cần cải thiện" },
            next_steps: { type: "array", items: { type: "string" }, description: "2-3 hành động cụ thể gợi ý" },
          },
          required: ["summary", "performance_level", "strengths", "gaps", "next_steps"],
        },
      },
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-employee-insight error:", e);
    return errorResponse(e);
  }
});
