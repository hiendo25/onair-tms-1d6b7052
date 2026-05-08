import { callLovableAI, corsHeaders, errorResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { userId, orgId } = await req.json();
    if (!userId || !orgId) throw new Error("userId and orgId required");

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [{ data: emp }, { data: progress }, { data: submissions }, { data: enrollments }, { data: allPaths }] =
      await Promise.all([
        supabase.from("employees").select("name, department, branch, role, position").eq("user_id", userId).maybeSingle(),
        supabase.from("course_enrollments").select("course_id, status, progress").eq("user_id", userId).eq("org_id", orgId),
        supabase.from("assignment_submissions").select("score, status").eq("user_id", userId),
        supabase.from("learning_path_enrollments").select("learning_path_id, status, progress").eq("user_id", userId).eq("org_id", orgId),
        supabase.from("learning_paths").select("id, title, description, level, tags").eq("org_id", orgId).eq("status", "active"),
      ]);

    const prog = progress ?? [];
    const subs = submissions ?? [];
    const enrolled = enrollments ?? [];
    const paths = allPaths ?? [];

    const enrolledIds = new Set(enrolled.map((e) => e.learning_path_id));
    const availablePaths = paths.filter((p) => !enrolledIds.has(p.id));

    const completedCourses = prog.filter((p) => p.status === "completed" || (p.progress ?? 0) >= 100).length;
    const avgScore = subs.length ? (subs.reduce((s, sub) => s + (sub.score ?? 0), 0) / subs.length).toFixed(1) : null;
    const completedPaths = enrolled.filter((e) => e.status === "completed").length;

    if (availablePaths.length === 0) {
      return new Response(JSON.stringify({ recommendations: [], message: "Bạn đã đăng ký tất cả các lộ trình học hiện có." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await callLovableAI({
      system: `Bạn là chuyên gia tư vấn học tập cho nhân viên F&B/Retail Việt Nam. Dựa trên hồ sơ và lịch sử học tập của nhân viên, gợi ý các lộ trình học phù hợp nhất từ danh sách có sẵn. Ưu tiên theo khoảng cách với vị trí hiện tại, điểm số, và mức độ cần thiết.`,
      user: `Hồ sơ nhân viên:
- Phòng ban: ${emp?.department ?? "chưa rõ"} | Chi nhánh: ${emp?.branch ?? "chưa rõ"}
- Vị trí: ${emp?.position ?? emp?.role ?? "chưa rõ"}

Lịch sử học tập:
- Đã hoàn thành ${completedCourses} khóa học
- Điểm trung bình bài kiểm tra: ${avgScore ?? "chưa có"}
- Lộ trình đã hoàn thành: ${completedPaths}/${enrolled.length}

Các lộ trình HỌC VIÊN CHƯA THAM GIA (chỉ chọn từ danh sách này):
${availablePaths.map((p, i) => `${i + 1}. [${p.id}] ${p.title}${p.description ? " — " + p.description : ""}${p.level ? " (Level: " + p.level + ")" : ""}${p.tags ? " [Tags: " + p.tags + "]" : ""}`).join("\n")}

Gợi ý tối đa 3 lộ trình phù hợp nhất.`,
      tool: {
        name: "emit_recommendations",
        description: "Gợi ý lộ trình học phù hợp",
        parameters: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path_id: { type: "string" },
                  title: { type: "string" },
                  reason: { type: "string", description: "Lý do phù hợp với nhân viên này (1-2 câu)" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                },
                required: ["path_id", "title", "reason", "priority"],
              },
            },
            overall_advice: { type: "string", description: "Lời khuyên tổng quan ngắn gọn" },
          },
          required: ["recommendations", "overall_advice"],
        },
      },
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-learning-recommendation error:", e);
    return errorResponse(e);
  }
});
