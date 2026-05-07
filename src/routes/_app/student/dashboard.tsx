import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertCircle, BookOpen, ClipboardCheck, Trophy, Clock, Award, Star,
  Crown, Flame, GraduationCap, CheckCircle2, PlayCircle, Medal, Sparkles,
} from "lucide-react";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { aiPersonalInsight } from "@/lib/ai-mock";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageContainer } from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { getUserRole } from "@/lib/roles";

export const Route = createFileRoute("/_app/student/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OnAir TMS" }] }),
  beforeLoad: async () => {
    const { role } = await getUserRole();
    if (role === "admin") throw redirect({ to: "/admin/dashboard" });
  },
  component: StudentDashboard,
});

// ─── Helpers ───────────────────────────────────────────────────────────
const RANKS = [
  { name: "Tân binh", min: 0 },
  { name: "Cần mẫn", min: 500 },
  { name: "Cao thủ", min: 1500 },
  { name: "Huyền thoại", min: 3000 },
];
function computeRank(xp: number) {
  let current = RANKS[0], next = RANKS[1];
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) { current = RANKS[i]; next = RANKS[i + 1] ?? RANKS[i]; }
  }
  return { current, next };
}

const COURSE_THUMBS = [
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
];

// ─── Component ─────────────────────────────────────────────────────────
function StudentDashboard() {
  const { orgId } = useOrg();
  const { data: dash, isLoading } = useDashboardData(orgId);

  // Seed minimal data for current user once
  useSeedCurrentUser(orgId);

  return (
    <PageContainer title="Tổng quan" breadcrumbs={[{ title: "Tổng quan" }]}>
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Đang tải dữ liệu...</div>
      ) : (
        <>
          <AiInsightCard
            stats={dash?.myStats ?? null}
            xp={dash?.myXp ?? 0}
          />
          <TodayTasksSection tasks={dash?.todayTasks ?? []} />
          <ProgressSection
            path={dash?.activePath ?? null}
            stats={dash?.myStats ?? null}
          />
          <AchievementSection
            xp={dash?.myXp ?? 0}
            leaderboard={dash?.leaderboard ?? []}
            currentUserId={dash?.userId ?? null}
            branchName={dash?.branchName ?? "Chi nhánh của tôi"}
          />
          <RecommendedSection courses={dash?.recommended ?? []} />
        </>
      )}
    </PageContainer>
  );
}

// ─── AI Insight ────────────────────────────────────────────────────────
function AiInsightCard({ stats, xp }: { stats: any; xp: number }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const key = `${stats?.user_id ?? "me"}-${xp}-${stats?.completed_courses ?? 0}-${stats?.quizzes_taken ?? 0}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setInsight(null);
    aiPersonalInsight({
      completed_courses: stats?.completed_courses ?? 0,
      quizzes_taken: stats?.quizzes_taken ?? 0,
      average_score: Number(stats?.average_score ?? 0),
      hours_learned: stats?.hours_learned ?? 0,
      rank: computeRank(xp).current.name,
    }).then((text) => {
      if (!cancelled) { setInsight(text); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [key]);

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-violet-900">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          Đây là nhận xét về quá trình học của bạn tuần này
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <AiSpinner label="Để mình xem qua nhé..." />
        ) : (
          <p className="text-sm leading-relaxed text-slate-800">{insight}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Data hook ─────────────────────────────────────────────────────────
function useDashboardData(orgId: string) {
  return useQuery({
    queryKey: ["student-dashboard", orgId],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u.user?.id ?? null;

      // My stats
      const myStatsQ = userId
        ? await supabase.from("user_stats").select("*").eq("user_id", userId).eq("org_id", orgId).maybeSingle()
        : { data: null };
      const myStats = myStatsQ.data;

      // My XP
      const myXpQ = userId
        ? await supabase.from("user_xp").select("xp").eq("user_id", userId).eq("org_id", orgId).maybeSingle()
        : { data: null };
      const myXp = myXpQ.data?.xp ?? 0;

      const branchName = myStats?.branch || "Chi nhánh của tôi";

      // Today tasks: pending submissions for this user
      const tasksQ = userId
        ? await supabase
            .from("assignment_submissions")
            .select("id, assignment_id, assignment_title, assignment_type, deadline, status")
            .eq("user_id", userId)
            .eq("org_id", orgId)
            .neq("status", "completed")
            .order("deadline", { ascending: true })
            .limit(5)
        : { data: [] };
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const todayTasks = (tasksQ.data ?? []).map((t: any) => {
        const d = t.deadline ? new Date(t.deadline) : null;
        const urgent = !!d && d <= endOfToday;
        return {
          id: t.id,
          title: t.assignment_title,
          type: t.assignment_type === "quiz" ? "quiz" : "lesson",
          deadline: d
            ? urgent ? `Hôm nay, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
              : d.toLocaleDateString("vi-VN")
            : "Không có hạn",
          urgent,
          path: t.assignment_type === "quiz" ? "/my-assignments" : "/my-learning-paths",
        };
      });

      // Active path
      const pathQ = userId
        ? await supabase
            .from("user_learning_path_progress")
            .select("path_id, path_title, progress, total_lessons, completed_lessons")
            .eq("user_id", userId)
            .eq("org_id", orgId)
            .eq("is_active", true)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : { data: null };
      const activePath = pathQ.data;

      // Leaderboard: top 5 in same org
      const lbQ = await supabase
        .from("user_xp")
        .select("user_id, xp")
        .eq("org_id", orgId)
        .order("xp", { ascending: false })
        .limit(5);
      const lbIds = (lbQ.data ?? []).map((r: any) => r.user_id);
      const namesQ = lbIds.length
        ? await supabase.from("user_stats").select("user_id, display_name, branch").in("user_id", lbIds)
        : { data: [] };
      const nameMap = new Map((namesQ.data ?? []).map((r: any) => [r.user_id, r]));
      const leaderboard = (lbQ.data ?? []).map((r: any, i: number) => ({
        rank: i + 1,
        user_id: r.user_id,
        name: nameMap.get(r.user_id)?.display_name || (r.user_id === userId ? "Bạn" : "Học viên"),
        xp: r.xp,
        isMe: r.user_id === userId,
      }));

      // Recommended courses
      const recQ = userId
        ? await supabase
            .from("user_course_progress")
            .select("course_id, course_title, progress")
            .eq("user_id", userId)
            .eq("org_id", orgId)
            .lt("progress", 100)
            .order("updated_at", { ascending: false })
            .limit(3)
        : { data: [] };
      let recommended = (recQ.data ?? []).map((r: any, i: number) => ({
        id: r.course_id, title: r.course_title, progress: r.progress,
        thumb: COURSE_THUMBS[i % COURSE_THUMBS.length],
      }));
      // Fallback: pull org online courses
      if (recommended.length < 3) {
        const fallbackQ = await supabase
          .from("online_courses")
          .select("id, title")
          .eq("org_id", orgId)
          .eq("status", "published")
          .limit(3 - recommended.length);
        const existingIds = new Set(recommended.map((r) => r.id));
        const extra = (fallbackQ.data ?? [])
          .filter((c: any) => !existingIds.has(c.id))
          .map((c: any, i: number) => ({
            id: c.id, title: c.title, progress: 0,
            thumb: COURSE_THUMBS[(recommended.length + i) % COURSE_THUMBS.length],
          }));
        recommended = [...recommended, ...extra];
      }

      return { userId, myXp, myStats, todayTasks, activePath, leaderboard, recommended, branchName };
    },
  });
}

// Seed defaults for current user on first visit so dashboard isn't empty
function useSeedCurrentUser(orgId: string) {
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) return;

      // Check if already seeded
      const { data: existing } = await supabase
        .from("user_xp").select("id").eq("user_id", uid).eq("org_id", orgId).maybeSingle();
      if (existing) return;

      const xp = 1820;
      await supabase.from("user_xp").insert({ user_id: uid, org_id: orgId, xp, rank: "Cao thủ" });
      await supabase.from("user_stats").insert({
        user_id: uid, org_id: orgId,
        completed_courses: 12, quizzes_taken: 28, average_score: 8.7, hours_learned: 47,
        branch: "Highlands Nguyễn Huệ",
        display_name: u.user?.email?.split("@")[0] ?? "Bạn",
      });
      await supabase.from("user_learning_path_progress").insert({
        user_id: uid, org_id: orgId,
        path_id: crypto.randomUUID(),
        path_title: "Lộ trình Barista cấp 2",
        total_lessons: 24, completed_lessons: 16, progress: 65, is_active: true,
      });
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const today18 = new Date(); today18.setHours(18, 0, 0, 0);
      const today22 = new Date(); today22.setHours(22, 0, 0, 0);
      await supabase.from("assignment_submissions").insert([
        { user_id: uid, org_id: orgId, assignment_id: crypto.randomUUID(),
          assignment_title: "Quy trình pha chế Phin Sữa Đá", assignment_type: "lesson",
          deadline: today18.toISOString(), status: "pending" },
        { user_id: uid, org_id: orgId, assignment_id: crypto.randomUUID(),
          assignment_title: "Kiểm tra: An toàn vệ sinh thực phẩm", assignment_type: "quiz",
          deadline: today22.toISOString(), status: "pending" },
        { user_id: uid, org_id: orgId, assignment_id: crypto.randomUUID(),
          assignment_title: "Bài học: Đón tiếp khách hàng VIP", assignment_type: "lesson",
          deadline: tomorrow.toISOString(), status: "pending" },
      ]);
      await supabase.from("user_course_progress").insert([
        { user_id: uid, org_id: orgId, course_id: crypto.randomUUID(),
          course_title: "Pha chế Cold Brew chuẩn vị", progress: 35, status: "in_progress" },
        { user_id: uid, org_id: orgId, course_id: crypto.randomUUID(),
          course_title: "Kỹ năng Upsell tại quầy", progress: 0, status: "in_progress" },
        { user_id: uid, org_id: orgId, course_id: crypto.randomUUID(),
          course_title: "Vệ sinh máy Espresso đúng cách", progress: 70, status: "in_progress" },
      ]);
    })();
  }, [orgId]);
}

// ─── Section 1: Today's tasks ──────────────────────────────────────────
type Task = { id: string; title: string; type: string; deadline: string; urgent: boolean; path: string };

function useCompleteTask(orgId: string) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (task: Task) => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) throw new Error("Bạn cần đăng nhập");

      // 1) Mark submission completed
      const score = task.type === "quiz" ? Math.round((7 + Math.random() * 3) * 10) / 10 : null;
      await supabase.from("assignment_submissions").update({
        status: "completed",
        submitted_at: new Date().toISOString(),
        score,
      }).eq("id", task.id).eq("user_id", uid);

      // 2) Bump XP (+50 lesson, +100 quiz)
      const xpGain = task.type === "quiz" ? 100 : 50;
      const { data: xpRow } = await supabase
        .from("user_xp").select("xp").eq("user_id", uid).eq("org_id", orgId).maybeSingle();
      const newXp = (xpRow?.xp ?? 0) + xpGain;
      const rank = newXp >= 3000 ? "Huyền thoại" : newXp >= 1500 ? "Cao thủ" : newXp >= 500 ? "Cần mẫn" : "Tân binh";
      if (xpRow) {
        await supabase.from("user_xp").update({ xp: newXp, rank })
          .eq("user_id", uid).eq("org_id", orgId);
      } else {
        await supabase.from("user_xp").insert({ user_id: uid, org_id: orgId, xp: newXp, rank });
      }

      // 3) Bump stats
      const { data: stats } = await supabase
        .from("user_stats").select("*").eq("user_id", uid).eq("org_id", orgId).maybeSingle();
      if (stats) {
        const patch: any = { hours_learned: (stats.hours_learned ?? 0) + 1 };
        if (task.type === "quiz") {
          const newCount = (stats.quizzes_taken ?? 0) + 1;
          const newAvg = Math.round((((stats.average_score ?? 0) * (stats.quizzes_taken ?? 0)) + (score ?? 0)) / newCount * 10) / 10;
          patch.quizzes_taken = newCount;
          patch.average_score = newAvg;
        } else {
          patch.completed_courses = (stats.completed_courses ?? 0) + 1;
        }
        await supabase.from("user_stats").update(patch).eq("user_id", uid).eq("org_id", orgId);
      }

      // 4) Bump active learning path
      const { data: path } = await supabase
        .from("user_learning_path_progress")
        .select("*").eq("user_id", uid).eq("org_id", orgId).eq("is_active", true)
        .order("updated_at", { ascending: false }).limit(1).maybeSingle();
      if (path && path.completed_lessons < path.total_lessons) {
        const completed = path.completed_lessons + 1;
        const progress = Math.min(100, Math.round((completed / path.total_lessons) * 100));
        await supabase.from("user_learning_path_progress").update({
          completed_lessons: completed, progress,
        }).eq("id", path.id);
      }

      return { xpGain, score, redirect: task.path };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["student-dashboard"] });
      const msg = res.score != null
        ? `Hoàn thành! +${res.xpGain} XP · Điểm: ${res.score}/10`
        : `Hoàn thành! +${res.xpGain} XP`;
      toast.success(msg);
      // Navigate to actual learning/quiz screen
      setTimeout(() => navigate({ to: res.redirect }), 400);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

function TodayTasksSection({ tasks }: { tasks: Task[] }) {
  const { orgId } = useOrg();
  const complete = useCompleteTask(orgId);
  const hasTasks = tasks.length > 0;
  const hasUrgent = tasks.some((t) => t.urgent);

  return (
    <Card className={hasUrgent ? "border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-amber-50" : ""}>
      <CardHeader className="flex flex-row items-center gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${hasUrgent ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"}`}>
          <AlertCircle className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">Việc cần làm hôm nay</CardTitle>
        {hasUrgent && (
          <Badge variant="destructive" className="ml-2">{tasks.filter((t) => t.urgent).length} việc gấp</Badge>
        )}
      </CardHeader>
      <CardContent>
        {!hasTasks ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
            <p className="text-base font-medium">Bạn đã hoàn thành tất cả hôm nay 🎉</p>
            <p className="text-sm text-muted-foreground mt-1">Quay lại vào ngày mai nhé!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const Icon = task.type === "quiz" ? ClipboardCheck : BookOpen;
              const isPending = complete.isPending && complete.variables?.id === task.id;
              return (
                <div key={task.id} className={`flex items-center gap-3 rounded-lg border p-3 ${task.urgent ? "border-orange-200 bg-white" : "border-slate-200 bg-white"}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${task.urgent ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    <p className={`text-xs flex items-center gap-1 mt-0.5 ${task.urgent ? "text-orange-600 font-medium" : "text-muted-foreground"}`}>
                      <Clock className="h-3 w-3" />
                      {task.deadline}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={isPending || complete.isPending}
                    onClick={() => complete.mutate(task)}
                    className={task.urgent ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
                  >
                    {isPending ? "Đang lưu..." : task.type === "quiz" ? "Làm bài" : "Học ngay"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section 2: Progress ───────────────────────────────────────────────
function ProgressSection({ path, stats }: { path: any; stats: any }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Lộ trình đang học
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {path ? (
            <>
              <div>
                <h3 className="font-semibold text-base">{path.path_title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {path.completed_lessons}/{path.total_lessons} bài học hoàn thành
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tiến độ</span>
                  <span className="font-semibold text-blue-600">{path.progress}%</span>
                </div>
                <Progress value={path.progress} className="h-2.5" />
              </div>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/my-learning-paths"><PlayCircle className="h-4 w-4 mr-2" />Tiếp tục học</Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">Chưa có lộ trình đang học.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Thống kê cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <StatBox icon={GraduationCap} label="Khóa hoàn thành" value={stats?.completed_courses ?? 0} color="bg-blue-50 text-blue-600" />
            <StatBox icon={ClipboardCheck} label="Bài kiểm tra" value={stats?.quizzes_taken ?? 0} color="bg-purple-50 text-purple-600" />
            <StatBox icon={Star} label="Điểm trung bình" value={stats?.average_score ?? 0} color="bg-amber-50 text-amber-600" />
            <StatBox icon={Clock} label="Giờ học tích lũy" value={`${stats?.hours_learned ?? 0}h`} color="bg-emerald-50 text-emerald-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: typeof Star; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${color} mb-2`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ─── Section 3: Achievements & Leaderboard ─────────────────────────────
function AchievementSection({
  xp, leaderboard, currentUserId, branchName,
}: { xp: number; leaderboard: any[]; currentUserId: string | null; branchName: string }) {
  const { current, next } = computeRank(xp);
  const xpToNext = Math.max(0, next.min - xp);
  const range = Math.max(1, next.min - current.min);
  const progressInRank = next.min === current.min ? 100 : Math.min(100, ((xp - current.min) / range) * 100);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-amber-300" />Thành tích của tôi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-amber-900">
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs text-purple-200">Hạng hiện tại</p>
              <p className="text-2xl font-bold">{current.name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-purple-200">Tổng XP</p>
              <p className="text-2xl font-bold flex items-center gap-1 justify-end">
                <Flame className="h-5 w-5 text-amber-300" />
                {xp.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-purple-200">
                {next.name === current.name ? "Đã đạt hạng cao nhất" : `Lên hạng ${next.name}`}
              </span>
              <span className="font-semibold">{xpToNext > 0 ? `Còn ${xpToNext.toLocaleString()} XP` : "🏆"}</span>
            </div>
            <Progress value={progressInRank} className="h-2 bg-purple-900" />
          </div>
          <Button asChild variant="secondary" className="w-full bg-white/15 hover:bg-white/25 text-white border-0">
            <Link to="/my-gamification"><Award className="h-4 w-4 mr-2" />Xem huy hiệu</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Medal className="h-5 w-5 text-amber-500" />
            Top học viên — {branchName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Chưa có đủ dữ liệu để đưa ra nhận xét, hãy tiếp tục học nhé.</p>
          ) : (
            <div className="space-y-1.5">
              {leaderboard.map((u) => (
                <div key={u.user_id} className={`flex items-center gap-3 rounded-lg p-2.5 ${u.isMe ? "bg-blue-50 border border-blue-200" : ""}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                    u.rank === 1 ? "bg-amber-400 text-amber-900"
                    : u.rank === 2 ? "bg-slate-300 text-slate-800"
                    : u.rank === 3 ? "bg-orange-300 text-orange-900"
                    : "bg-slate-100 text-slate-600"
                  }`}>{u.rank}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${u.isMe ? "font-bold text-blue-700" : "font-medium"}`}>
                      {u.name} {u.isMe && <span className="text-xs">(bạn)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                    <Flame className="h-3.5 w-3.5" />
                    {u.xp.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section 4: Recommended courses ────────────────────────────────────
function RecommendedSection({ courses }: { courses: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />Khóa học gợi ý
        </CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Chưa có khóa học gợi ý.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {courses.map((c) => (
              <div key={c.id} className="rounded-lg border bg-white overflow-hidden hover:shadow-md transition-shadow">
                <div className={`h-32 bg-gradient-to-br ${c.thumb} flex items-center justify-center`}>
                  <BookOpen className="h-12 w-12 text-white/80" />
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{c.title}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{c.progress === 0 ? "Chưa bắt đầu" : "Đang học"}</span>
                      <span className="font-semibold">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1.5" />
                  </div>
                  <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link to="/my-learning-paths">{c.progress === 0 ? "Bắt đầu" : "Tiếp tục"}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
