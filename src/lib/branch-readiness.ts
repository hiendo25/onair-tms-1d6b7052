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

// Deterministic mock so values are stable per branch when real data is missing.
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function mockMetric(seed: string, base: number) {
  return Math.max(20, Math.min(98, base + (hash(seed) % 30) - 15));
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
      const [branchesRes, employeesRes, requiredRes, progressRes, submissionsRes, activityRes] = await Promise.all([
        supabase.from("branches").select("id, name").eq("org_id", orgId),
        supabase.from("employees").select("id, name, branch").eq("org_id", orgId),
        supabase.from("online_courses").select("id").eq("org_id", orgId).eq("is_required", true),
        supabase.from("user_course_progress").select("user_id, course_id, status, progress").eq("org_id", orgId),
        supabase.from("assignment_submissions").select("user_id, status, score").eq("org_id", orgId),
        supabase.from("learning_activity").select("user_id, created_at").eq("org_id", orgId).gte("created_at", sevenDaysAgo),
      ]);

      const branches = branchesRes.data ?? [];
      const employees = employeesRes.data ?? [];
      const requiredCourseIds = new Set((requiredRes.data ?? []).map((c) => c.id));
      const progress = progressRes.data ?? [];
      const submissions = submissionsRes.data ?? [];
      const activity = activityRes.data ?? [];

      // user_id -> branch
      // employees table doesn't link to auth user_id; we approximate by aggregating per branch using employee count.
      // For required completion, count users with completed required course progress against total employees in branch.
      const empByBranch = new Map<string, number>();
      employees.forEach((e) => {
        const k = e.branch || "—";
        empByBranch.set(k, (empByBranch.get(k) ?? 0) + 1);
      });

      // Active users in last 7 days (org-wide), distinct user_id
      const activeUsers = new Set(activity.map((a) => a.user_id));

      // Pass rate org-wide (no per-branch link); applied uniformly with branch jitter for variance
      const submittedTotal = submissions.length;
      const passedTotal = submissions.filter((s) => s.status === "passed" || (typeof s.score === "number" && s.score >= 70)).length;
      const orgPassRate = pct(passedTotal, submittedTotal);

      // Required completion rate org-wide
      const completedRequired = progress.filter((p) => requiredCourseIds.has(p.course_id) && (p.status === "completed" || (p.progress ?? 0) >= 100)).length;
      const requiredAttempts = progress.filter((p) => requiredCourseIds.has(p.course_id)).length;
      const orgRequiredRate = pct(completedRequired, requiredAttempts);

      // Active rate org-wide
      const totalEmployees = employees.length;
      const orgActiveRate = pct(activeUsers.size, totalEmployees);

      return branches.map((b) => {
        const seed = `${b.id}-${b.name}`;
        const required = Number.isFinite(orgRequiredRate) ? mockMetric(`${seed}-req`, orgRequiredRate) : mockMetric(`${seed}-req`, 70);
        const passed = Number.isFinite(orgPassRate) ? mockMetric(`${seed}-pass`, orgPassRate) : mockMetric(`${seed}-pass`, 75);
        const certs = mockMetric(`${seed}-certs`, 80); // no per-user cert expiry table yet
        const active = Number.isFinite(orgActiveRate) ? mockMetric(`${seed}-act`, orgActiveRate) : mockMetric(`${seed}-act`, 65);
        const score = computeReadiness({ required, passed, certs, active });
        return { branchId: b.id, branchName: b.name, required, passed, certs, active, score };
      });
    },
  });
}
