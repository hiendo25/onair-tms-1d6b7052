import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

type Answer = string | number | boolean | string[] | null;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isEmpty(v: Answer): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function validate(qType: string, options: unknown[], v: Answer): string | null {
  const opts = (options ?? []).map((o) => {
    if (typeof o === "string") return o;
    if (o && typeof o === "object" && "value" in (o as Record<string, unknown>)) return String((o as Record<string, unknown>).value);
    if (o && typeof o === "object" && "label" in (o as Record<string, unknown>)) return String((o as Record<string, unknown>).label);
    return String(o);
  });
  switch (qType) {
    case "single":
    case "dropdown":
    case "vote":
      if (typeof v !== "string") return "Giá trị không hợp lệ";
      if (opts.length && !opts.includes(v)) return "Lựa chọn không nằm trong danh sách";
      return null;
    case "multiple":
      if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) return "Giá trị không hợp lệ";
      if (opts.length && (v as string[]).some((x) => !opts.includes(x))) return "Lựa chọn không nằm trong danh sách";
      return null;
    case "yes_no":
      if (v !== "yes" && v !== "no" && typeof v !== "boolean") return "Giá trị không hợp lệ";
      return null;
    case "rating": {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 1 || n > 5) return "Đánh giá phải từ 1–5";
      return null;
    }
    case "essay":
      if (typeof v !== "string") return "Giá trị không hợp lệ";
      if (v.length > 5000) return "Câu trả lời quá dài (tối đa 5000 ký tự)";
      return null;
    case "sorting":
      if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) return "Giá trị không hợp lệ";
      if (opts.length && (v as string[]).length !== opts.length) return "Phải sắp xếp đầy đủ các mục";
      return null;
    default:
      return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const surveyId = String(body?.surveyId ?? "");
    const assignmentId = body?.assignmentId ? String(body.assignmentId) : null;
    const answers = body?.answers as Record<string, Answer> | undefined;

    if (!surveyId || !answers || typeof answers !== "object") {
      return json({ error: "Thiếu surveyId hoặc answers" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve user from bearer (optional)
    let userId: string | null = null;
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const { data } = await admin.auth.getUser(auth.slice(7));
      userId = data.user?.id ?? null;
    }

    // Load survey + questions
    const [{ data: survey, error: sErr }, { data: questions, error: qErr }] = await Promise.all([
      admin.from("surveys").select("id, org_id, status, anonymous, start_date, end_date, version").eq("id", surveyId).maybeSingle(),
      admin.from("survey_questions").select("id, type, options, required, order_index").eq("survey_id", surveyId).order("order_index"),
    ]);

    if (sErr || !survey) return json({ error: "Không tìm thấy khảo sát" }, 404);
    if (qErr) return json({ error: "Lỗi tải câu hỏi" }, 500);
    if (survey.status !== "active") return json({ error: "Khảo sát đã đóng" }, 400);

    // Window check
    const now = new Date();
    if (survey.start_date && new Date(survey.start_date as string) > now) {
      return json({ error: "Khảo sát chưa mở" }, 400);
    }
    if (survey.end_date) {
      const end = new Date(survey.end_date as string);
      end.setUTCHours(23, 59, 59, 999);
      if (end < now) return json({ error: "Khảo sát đã hết hạn" }, 400);
    }

    // Audience check (if assignmentId provided)
    if (assignmentId) {
      const { data: a } = await admin
        .from("survey_assignments")
        .select("id, survey_id, status, end_date, student_ids")
        .eq("id", assignmentId)
        .maybeSingle();
      if (!a || a.survey_id !== surveyId) return json({ error: "Phiên giao bài không hợp lệ" }, 400);
      if (a.status !== "active") return json({ error: "Phiên giao bài đã đóng" }, 400);
      if (a.end_date && new Date(a.end_date as string) < now) return json({ error: "Phiên giao bài đã hết hạn" }, 400);
      if (userId && Array.isArray(a.student_ids) && a.student_ids.length > 0 && !a.student_ids.includes(userId)) {
        return json({ error: "Bạn không nằm trong danh sách được giao" }, 403);
      }
    }

    // Anonymity: never store user_id when survey.anonymous = true
    const storedUserId = survey.anonymous ? null : userId;

    // Validate each question
    const qs = questions ?? [];
    if (qs.length === 0) return json({ error: "Khảo sát chưa có câu hỏi" }, 400);

    const errors: Record<string, string> = {};
    const rows: { question_id: string; value: Answer }[] = [];
    for (const q of qs as Array<{ id: string; type: string; options: unknown; required: boolean }>) {
      const v = answers[q.id] ?? null;
      if (q.required && isEmpty(v)) {
        errors[q.id] = "Câu hỏi bắt buộc";
        continue;
      }
      if (!isEmpty(v)) {
        const err = validate(q.type, (q.options as unknown[]) ?? [], v);
        if (err) {
          errors[q.id] = err;
          continue;
        }
      }
      rows.push({ question_id: q.id, value: v });
    }

    if (Object.keys(errors).length > 0) {
      return json({ error: "Có câu trả lời không hợp lệ", fieldErrors: errors }, 422);
    }

    // Prevent duplicate submission for non-anonymous users
    if (storedUserId) {
      const dupQuery = admin
        .from("survey_responses")
        .select("id")
        .eq("survey_id", surveyId)
        .eq("user_id", storedUserId);
      if (assignmentId) dupQuery.eq("assignment_id", assignmentId);
      const { data: dup } = await dupQuery.maybeSingle();
      if (dup) return json({ error: "Bạn đã gửi khảo sát này rồi" }, 409);
    }

    // Insert response
    const { data: resp, error: rErr } = await admin
      .from("survey_responses")
      .insert({
        survey_id: surveyId,
        org_id: survey.org_id,
        user_id: storedUserId,
        assignment_id: assignmentId,
        version: survey.version ?? 1,
      })
      .select("id")
      .single();
    if (rErr || !resp) return json({ error: "Không lưu được phản hồi" }, 500);

    // Insert answers
    const answerRows = rows.map((r) => ({
      response_id: resp.id,
      question_id: r.question_id,
      org_id: survey.org_id,
      value: r.value as unknown,
    }));
    if (answerRows.length > 0) {
      const { error: aErr } = await admin.from("survey_answers").insert(answerRows);
      if (aErr) {
        // Rollback the response
        await admin.from("survey_responses").delete().eq("id", resp.id);
        return json({ error: "Không lưu được câu trả lời" }, 500);
      }
    }

    // responses_count is maintained by DB trigger on survey_responses
    return json({ ok: true, responseId: resp.id });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Lỗi không xác định" }, 500);
  }
});
