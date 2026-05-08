import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BranchReadiness = {
  branchId: string;
  branchName: string;
  required: number;   // % nhân viên hoàn thành khóa bắt buộc
  passed: number;     // % lượt pass bài kiểm tra
  certs: number;      // % chứng nhận còn hiệu lực
  active: number;     // % active 7 ngày
  score: number;      // weighted readiness 0-100
};

export type ReadinessLevel = "ready" | "watch" | "intervene";

export function levelOf(score: number): ReadinessLevel {
  if (score >= 80) return "ready";
  if (score >= 60) return "watch";
  return "intervene";
}

export function levelLabel(l: ReadinessLevel) {
  return l === "ready" ? "Sẵn sàng" : l === "watch" ? "Cần chú ý" : "Cần can thiệp";
}

export function levelClasses(l: ReadinessLevel) {
  return l === "ready"
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : l === "watch"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";
}

export function scoreColor(score: number) {
  const l = levelOf(score);
  return l === "ready" ? "bg-emerald-500" : l === "watch" ? "bg-amber-500" : "bg-red-500";
}

function pct(num: number, den: number) {
  if (!den) return NaN;
  return Math.round((num / den) * 100);
}

export function computeReadiness(metrics: Pick<BranchReadiness, "required" | "passed" | "certs" | "active">) {
  return Math.round(metrics.required * 0.4 + metrics.passed * 0.3 + metrics.certs * 0.2 + metrics.active * 0.1);
}

export function useBranchReadiness(orgId: string) {
  return useQuery({
    queryKey: ["branch-readiness", orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<BranchReadiness[]> => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [branchesRes, employeesRes, requiredRes, progressRes, submissionsRes, activityRes, certsRes, assignmentsRes] = await Promise.all([
        supabase.from("branches").select("id, name").eq("org_id", orgId),
        supabase.from("employees").select("id, name, branch, user_id").eq("org_id", orgId),
        supabase.from("online_courses").select("id").eq("org_id", orgId).eq("is_required", true),
        supabase.from("user_course_progress").select("user_id, course_id, status, progress").eq("org_id", orgId),
        supabase.from("assignment_submissions").select("user_id, status, score, assignment_id").eq("org_id", orgId),
        supabase.from("learning_activity").select("user_id, created_at").eq("org_id", orgId).gte("created_at", sevenDaysAgo),
        supabase.from("user_certificates").select("user_id, expires_at, status").eq("org_id", orgId),
        supabase.from("assignments").select("id, pass_score").eq("org_id", orgId),
      ]);

      const branches = branchesRes.data ?? [];
      const employees = employeesRes.data ?? [];
      const requiredCourseIds = new Set((requiredRes.data ?? []).map((c) => c.id));
      const progress = progressRes.data ?? [];
      const submissions = submissionsRes.data ?? [];
      const activity = activityRes.data ?? [];
      const certs = certsRes.data ?? [];
      const passByAssignment = new Map<string, number>(
        (assignmentsRes.data ?? []).map((a) => [a.id, a.pass_score ?? 70]),
      );

      const activeUsers = new Set(activity.map((a) => a.user_id));

      return branches.map((b) => {
        const branchEmps = employees.filter((e) => e.branch === b.name);
        const branchUserIds = new Set(branchEmps.map((e) => e.user_id).filter(Boolean) as string[]);
        const branchEmpCount = branchEmps.length;

        // % hoàn thành khóa bắt buộc theo branch
        const branchProgress = progress.filter((p) => branchUserIds.has(p.user_id) && requiredCourseIds.has(p.course_id));
        const branchCompleted = branchProgress.filter((p) => p.status === "completed" || (p.progress ?? 0) >= 100).length;
        const required = pct(branchCompleted, branchProgress.length);

        // % pass bài kiểm tra theo branch
        const branchSubs = submissions.filter((s) => branchUserIds.has(s.user_id));
        const branchPassed = branchSubs.filter((s) => {
          const threshold = passByAssignment.get(s.assignment_id) ?? 70;
          return s.status === "passed" || (typeof s.score === "number" && Number(s.score) >= threshold);
        }).length;
        const passed = pct(branchPassed, branchSubs.length);

        // % active 7 ngày theo branch
        const branchActive = branchEmps.filter((e) => e.user_id && activeUsers.has(e.user_id)).length;
        const active = pct(branchActive, branchEmpCount);

        // % chứng chỉ còn hiệu lực theo branch
        const branchCerts = certs.filter((c) => branchUserIds.has(c.user_id));
        const branchValidCerts = branchCerts.filter((c) => c.status === "active" && (!c.expires_at || new Date(c.expires_at).getTime() > Date.now())).length;
        const certsRate = pct(branchValidCerts, branchCerts.length);

        const r = Number.isFinite(required) ? required : 0;
        const p2 = Number.isFinite(passed) ? passed : 0;
        const c2 = Number.isFinite(certsRate) ? certsRate : 0;
        const a = Number.isFinite(active) ? active : 0;
        const score = computeReadiness({ required: r, passed: p2, certs: c2, active: a });
        return { branchId: b.id, branchName: b.name, required: r, passed: p2, certs: c2, active: a, score };
      });
    },
  });
}
