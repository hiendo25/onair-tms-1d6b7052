import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bell, Calendar, BookOpen, Trophy, Crown, ArrowRight, ChevronRight,
  Video, Monitor, MapPin, ClipboardCheck, Clock, Lock, PlayCircle, Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";
import { getUserRole } from "@/lib/roles";
import { useMyXp, useMyTitle, useGamifications, useLeaderboard } from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/student/dashboard")({
  head: () => ({ meta: [{ title: "Tổng quan — OnAir TMS" }] }),
  beforeLoad: async () => {
    const { role } = await getUserRole();
    if (role === "admin") throw redirect({ to: "/admin/dashboard" });
  },
  component: StudentDashboard,
});

type UpcomingType = "live" | "online" | "offline";
type Upcoming = {
  id: string;
  type: UpcomingType;
  title: string;
  start: string;
  end: string | null;
  link: string;
};

function StudentDashboard() {
  const { user } = useAuth();
  const { orgId } = useOrg();
  const { data, isLoading } = useStudentOverview(orgId, user?.id);

  return (
    <PageHeader user={user}>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : (
        <>
          <ProgressCard
            paths={data?.paths ?? []}
            xp={data?.xp ?? 0}
            titleName={data?.titleName ?? null}
            nextTitle={data?.nextTitle ?? null}
            myRank={data?.myRank ?? null}
          />
          <ContinueLearning courses={data?.continue ?? []} />
          <UpcomingSection items={data?.upcoming ?? []} />
        </>
      )}
    </PageHeader>
  );
}

// ─── Header ────────────────────────────────────────────────────────────
function PageHeader({ user, children }: { user: any; children: React.ReactNode }) {
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "bạn";
  const { data: notif = 0 } = useQuery({
    queryKey: ["notif-unread", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from("learning_activity")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count ?? 0;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-5">
      <header className="flex items-center justify-between">
        <Link to="/my-gamification" className="flex items-center gap-3 group">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white font-semibold">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-xs text-muted-foreground">Xin chào,</div>
            <div className="font-semibold group-hover:text-primary transition">{name}</div>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <Button asChild size="icon" variant="ghost">
            <Link to="/my-class" aria-label="Lịch học"><Calendar className="h-5 w-5" /></Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="relative">
            <Link to="/my-flashcards" aria-label="Thông báo">
              <Bell className="h-5 w-5" />
              {notif > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
            </Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  );
}

// ─── Progress Card ─────────────────────────────────────────────────────
function ProgressCard({
  paths, xp, titleName, nextTitle, myRank,
}: {
  paths: { id: string; title: string; total: number; done: number }[];
  xp: number;
  titleName: string | null;
  nextTitle: { title: string; xp_required: number } | null;
  myRank: number | null;
}) {
  const single = paths.length === 1 ? paths[0] : null;
  const totalAll = paths.reduce((s, p) => s + p.total, 0);
  const doneAll = paths.reduce((s, p) => s + p.done, 0);
  const pct = totalAll === 0 ? 0 : Math.round((doneAll / totalAll) * 100);
  const xpPct = nextTitle && nextTitle.xp_required > 0
    ? Math.min(100, Math.round((xp / nextTitle.xp_required) * 100))
    : 100;

  if (paths.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-background to-violet-50">
        <CardContent className="py-10 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-3 font-semibold">Bạn chưa có khóa học nào</h3>
          <p className="text-sm text-muted-foreground mt-1">Quản trị viên sẽ gán lộ trình học cho bạn.</p>
        </CardContent>
      </Card>
    );
  }

  const ringTo = single
    ? { to: "/my-learning-paths/$id" as const, params: { id: single.id } }
    : { to: "/my-learning-paths" as const };

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-violet-100/40 to-pink-100/40">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Circular progress */}
          <Link {...(ringTo as any)} className="shrink-0 group">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                <circle
                  cx="50" cy="50" r="44" stroke="hsl(var(--primary))" strokeWidth="8" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - pct / 100)}
                  className="transition-all"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold">{pct}%</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Hoàn thành</div>
              </div>
            </div>
          </Link>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">
                {single ? single.title : `${paths.length} lộ trình đang học`}
              </div>
              <div className="font-semibold">
                {doneAll} / {totalAll} khoá học đã hoàn thành
              </div>
            </div>

            <Link to="/my-gamification" className="block group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  {xp.toLocaleString()} XP
                </span>
                {nextTitle ? (
                  <span className="text-muted-foreground">
                    Lên "{nextTitle.title}": {(nextTitle.xp_required - xp).toLocaleString()} XP
                  </span>
                ) : (
                  <span className="text-muted-foreground">Đã đạt danh hiệu cao nhất</span>
                )}
              </div>
              <Progress value={xpPct} className="h-2" />
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Link to="/my-gamification">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:opacity-90 cursor-pointer">
                  <Crown className="h-3 w-3 mr-1" />
                  {titleName || "Tân binh"}
                </Badge>
              </Link>
              {myRank && (
                <Link to="/my-gamification">
                  <Badge variant="outline" className="bg-background hover:bg-accent cursor-pointer">
                    <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                    Hạng #{myRank}
                  </Badge>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Continue Learning ─────────────────────────────────────────────────
type ContinueCourse = {
  id: string;
  title: string;
  cover: string | null;
  pathTitle: string;
  progress: number;
  status: "not_started" | "in_progress";
  locked: boolean;
};

function ContinueLearning({ courses }: { courses: ContinueCourse[] }) {
  const visible = courses.slice(0, 5);
  const hasMore = courses.length > 5;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-primary" />
          Tiếp tục học
        </CardTitle>
        {hasMore && (
          <Button asChild variant="ghost" size="sm">
            <Link to="/my-courses">Xem tất cả <ChevronRight className="h-4 w-4" /></Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Bạn chưa có khoá học nào.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map(c => (
              <Link
                key={c.id}
                to={c.locked ? "/my-courses" : "/my-courses/$id"}
                params={c.locked ? undefined as any : { id: c.id }}
                className={`group relative overflow-hidden rounded-lg border bg-card hover:shadow-md transition ${c.locked ? "opacity-60 pointer-events-none" : ""}`}
              >
                <div className="relative h-28 bg-gradient-to-br from-primary/20 to-violet-200">
                  {c.cover ? (
                    <img src={c.cover} alt={c.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary/30">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}
                  {c.locked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <Badge
                    className={`absolute left-2 top-2 text-[10px] ${
                      c.status === "in_progress" ? "bg-blue-500" : "bg-slate-500"
                    } text-white border-0`}
                  >
                    {c.status === "in_progress" ? "Đang học" : "Chưa học"}
                  </Badge>
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground line-clamp-1">
                    {c.pathTitle}
                  </div>
                  <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition">
                    {c.title}
                  </h3>
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Tiến độ</span>
                      <span>{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Upcoming Learning ─────────────────────────────────────────────────
const TYPE_META: Record<UpcomingType, { label: string; icon: typeof Video; color: string }> = {
  live: { label: "Live", icon: Video, color: "bg-red-100 text-red-700" },
  online: { label: "Online", icon: Monitor, color: "bg-blue-100 text-blue-700" },
  offline: { label: "Offline", icon: MapPin, color: "bg-emerald-100 text-emerald-700" },
};

function UpcomingSection({ items }: { items: Upcoming[] }) {
  const [tab, setTab] = useState<"all" | UpcomingType>("all");
  const filtered = useMemo(
    () => (tab === "all" ? items : items.filter(i => i.type === tab)).slice(0, 10),
    [items, tab]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Nội dung sắp tới
        </CardTitle>
        {items.length > 10 && (
          <Button asChild variant="ghost" size="sm">
            <Link to="/my-class">Xem thêm <ChevronRight className="h-4 w-4" /></Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-flex">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Không có nội dung sắp diễn ra.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(i => {
              const meta = TYPE_META[i.type];
              const Icon = meta.icon;
              const start = new Date(i.start);
              const end = i.end ? new Date(i.end) : null;
              const fmt = (d: Date) => d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
              return (
                <Link
                  key={i.id}
                  to={i.link}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {fmt(start)}{end ? ` – ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : ""}
                      </span>
                    </div>
                    <div className="font-medium text-sm truncate mt-0.5">{i.title}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────
function useStudentOverview(orgId: string, userId: string | undefined) {
  const xpQ = useMyXp();
  const titleQ = useMyTitle();
  const gamQ = useGamifications();
  const lbQ = useLeaderboard();

  const overviewQ = useQuery({
    queryKey: ["student-overview", orgId, userId],
    enabled: !!userId,
    queryFn: async () => {
      // 1) Active learning paths
      const { data: enrolls } = await supabase
        .from("learning_path_enrollments")
        .select("id, learning_path_id, progress, status, learning_paths(id, title)")
        .eq("user_id", userId!)
        .eq("org_id", orgId)
        .neq("status", "completed");

      const paths = (enrolls ?? []).map((e: any) => ({
        id: e.learning_paths?.id ?? e.learning_path_id,
        title: e.learning_paths?.title ?? "Lộ trình",
        total: 0,
        done: 0,
      }));

      // 2) Course counts per learning path
      const pathIds = paths.map(p => p.id);
      let continueCourses: ContinueCourse[] = [];
      if (pathIds.length > 0) {
        const { data: stages } = await supabase
          .from("learning_path_stages")
          .select("id, learning_path_id, learning_path_stage_courses(course_id)")
          .in("learning_path_id", pathIds);

        const pathCourseMap = new Map<string, string[]>();
        (stages ?? []).forEach((s: any) => {
          const arr = pathCourseMap.get(s.learning_path_id) ?? [];
          (s.learning_path_stage_courses ?? []).forEach((sc: any) => arr.push(sc.course_id));
          pathCourseMap.set(s.learning_path_id, arr);
        });

        const allCourseIds = Array.from(new Set(Array.from(pathCourseMap.values()).flat()));
        // course details
        const { data: courses } = allCourseIds.length
          ? await supabase.from("online_courses").select("id, title, cover_url").in("id", allCourseIds)
          : { data: [] as any[] };
        const courseMap = new Map((courses ?? []).map((c: any) => [c.id, c]));

        // user enrollment per course
        const { data: ces } = allCourseIds.length
          ? await supabase
              .from("course_enrollments")
              .select("course_id, status, progress, updated_at")
              .eq("user_id", userId!)
              .eq("org_id", orgId)
              .in("course_id", allCourseIds)
          : { data: [] as any[] };
        const ceMap = new Map((ces ?? []).map((e: any) => [e.course_id, e]));

        // build totals + continue list
        for (const p of paths) {
          const ids = pathCourseMap.get(p.id) ?? [];
          p.total = ids.length;
          p.done = ids.filter(id => ceMap.get(id)?.status === "completed").length;
          for (const cid of ids) {
            const ce = ceMap.get(cid) as any;
            const course = courseMap.get(cid) as any;
            if (!course) continue;
            if (ce?.status === "completed") continue;
            continueCourses.push({
              id: cid,
              title: course.title,
              cover: course.cover_url || null,
              pathTitle: p.title,
              progress: ce?.progress ?? 0,
              status: ce?.status === "in_progress" ? "in_progress" : "not_started",
              locked: false,
            });
          }
        }
        // sort: in_progress first by updated_at desc, then not_started
        continueCourses.sort((a, b) => {
          if (a.status !== b.status) return a.status === "in_progress" ? -1 : 1;
          const ua = (ceMap.get(a.id) as any)?.updated_at ?? "";
          const ub = (ceMap.get(b.id) as any)?.updated_at ?? "";
          return ub.localeCompare(ua);
        });
      }

      // 3) Upcoming
      const nowIso = new Date().toISOString();
      const upcoming: Upcoming[] = [];

      // Classroom sessions where user is a student
      const { data: cs } = await supabase
        .from("classroom_students")
        .select("classroom_id, classrooms(id, title, delivery, meeting_url, code)")
        .eq("user_id", userId!)
        .eq("org_id", orgId);
      const classroomIds = (cs ?? []).map((r: any) => r.classroom_id);
      const classroomMap = new Map((cs ?? []).map((r: any) => [r.classroom_id, r.classrooms]));

      if (classroomIds.length) {
        const { data: sessions } = await supabase
          .from("classroom_sessions")
          .select("id, classroom_id, title, start_at, end_at, meeting_url")
          .in("classroom_id", classroomIds)
          .gte("start_at", nowIso)
          .order("start_at", { ascending: true })
          .limit(20);
        (sessions ?? []).forEach((s: any) => {
          const cr = classroomMap.get(s.classroom_id) as any;
          const delivery = cr?.delivery ?? "offline";
          const t: UpcomingType = s.meeting_url ? "live" : delivery === "online" ? "online" : "offline";
          upcoming.push({
            id: s.id,
            type: t,
            title: s.title || cr?.title || "Buổi học",
            start: s.start_at,
            end: s.end_at,
            link: `/class-room/${cr?.code || cr?.id}`,
          });
        });
      }


      upcoming.sort((a, b) => a.start.localeCompare(b.start));

      return { paths, continue: continueCourses, upcoming };
    },
  });

  const titles = (gamQ.data ?? []).filter(g => g.type === "title" && g.active).sort((a, b) => (a.xp_required || 0) - (b.xp_required || 0));
  const xp = xpQ.data?.xp ?? 0;
  const currentTitle = (gamQ.data ?? []).find(g => g.id === titleQ.data?.title_id);
  const nextT = titles.find(t => (t.xp_required || 0) > xp);
  const myRank = lbQ.data?.find(r => r.user_id === userId)?.rank ?? null;

  return {
    isLoading: overviewQ.isLoading,
    data: overviewQ.data
      ? {
          ...overviewQ.data,
          xp,
          titleName: currentTitle?.title ?? null,
          nextTitle: nextT ? { title: nextT.title, xp_required: nextT.xp_required || 0 } : null,
          myRank,
        }
      : undefined,
  };
}
