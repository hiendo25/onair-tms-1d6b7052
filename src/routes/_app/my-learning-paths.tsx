import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, CheckCircle2, Lock, ArrowRight, Search, GraduationCap, AlertTriangle, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";

type AiRec = {
  recommendations: { path_id: string; title: string; reason: string; priority: "high" | "medium" | "low" }[];
  overall_advice: string;
  message?: string;
};
import { LP_ENROLLMENT_STATUS } from "@/lib/admin-options";
import type { DBLpEnrollment, DBLearningPath } from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/my-learning-paths")({
  head: () => ({ meta: [{ title: "Lộ trình của tôi — OnAir TMS" }] }),
  component: MyPaths,
});

type EnrollmentWithPath = DBLpEnrollment & { learning_paths: DBLearningPath | null };
type DerivedStatus = DBLpEnrollment["status"];

function deriveStatus(e: DBLpEnrollment): DerivedStatus {
  if (e.status === "completed") return "completed";
  if (e.deadline && new Date(e.deadline).getTime() < Date.now()) return "overdue";
  return e.status;
}

function statusBadge(s: DerivedStatus) {
  const label = LP_ENROLLMENT_STATUS.find(o => o.value === s)?.label ?? s;
  const cls = s === "completed" ? "bg-emerald-100 text-emerald-700"
    : s === "in_progress" ? "bg-blue-100 text-blue-700"
    : s === "overdue" ? "bg-red-100 text-red-700"
    : "bg-slate-100 text-slate-700";
  return <Badge className={cls}>{label}</Badge>;
}

function MyPaths() {
  const { user } = useAuth();
  const { orgId } = useOrg();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | DerivedStatus>("all");
  const [rec, setRec] = useState<AiRec | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  const { data: enrollments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["my-enrollments", orgId, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_path_enrollments")
        .select("*, learning_paths(*)")
        .eq("user_id", user!.id)
        .eq("org_id", orgId)
        .order("enrolled_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as EnrollmentWithPath[];
    },
  });

  const withDerived = useMemo(
    () => enrollments.map(e => ({ ...e, derivedStatus: deriveStatus(e) })),
    [enrollments]
  );

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return withDerived.filter(e => {
      if (filter !== "all" && e.derivedStatus !== filter) return false;
      if (!ql) return true;
      const lp = e.learning_paths;
      return lp ? (lp.title.toLowerCase().includes(ql) || lp.code.toLowerCase().includes(ql)) : false;
    });
  }, [withDerived, q, filter]);

  async function getRecommendations() {
    if (!user?.id) return;
    setRecLoading(true);
    setRec(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-learning-recommendation", {
        body: { userId: user.id, orgId },
      });
      if (fnErr) throw fnErr;
      setRec(res as AiRec);
    } catch {
      setRec(null);
    } finally {
      setRecLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = withDerived.length;
    const done = withDerived.filter(e => e.derivedStatus === "completed").length;
    const doing = withDerived.filter(e => e.derivedStatus === "in_progress").length;
    const notStarted = withDerived.filter(e => e.derivedStatus === "not_started").length;
    return { total, done, doing, notStarted };
  }, [withDerived]);

  return (
    <PageContainer
      title="Lộ trình học của tôi"
      description="Các lộ trình học tập bạn đã được ghi danh"
      breadcrumbs={[{ title: "Học tập" }, { title: "Lộ trình của tôi" }]}
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Tổng lộ trình</div><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Đang học</div><div className="text-2xl font-bold text-blue-600">{stats.doing}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Chưa học</div><div className="text-2xl font-bold text-slate-600">{stats.notStarted}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Hoàn thành</div><div className="text-2xl font-bold text-emerald-600">{stats.done}</div></CardContent></Card>
      </div>

      {/* AI recommendation block */}
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50/60 to-fuchsia-50/60">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <span className="font-semibold text-sm text-violet-900">Gợi ý lộ trình học của AI</span>
            </div>
            <Button size="sm" onClick={getRecommendations} disabled={recLoading}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {recLoading ? "Đang phân tích..." : rec ? "Gợi ý lại" : "Gợi ý lộ trình phù hợp"}
            </Button>
          </div>
          {recLoading && <AiSpinner label="Đang phân tích hồ sơ học tập..." />}
          {rec && !recLoading && (
            <div className="space-y-3">
              {rec.message ? (
                <p className="text-sm text-muted-foreground">{rec.message}</p>
              ) : (
                <>
                  {rec.overall_advice && (
                    <p className="text-sm text-violet-800 italic">{rec.overall_advice}</p>
                  )}
                  <div className="grid gap-2 sm:grid-cols-3">
                    {rec.recommendations.map((r) => (
                      <div key={r.path_id} className="rounded-lg border bg-white p-3 space-y-1.5">
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-medium text-sm line-clamp-2">{r.title}</span>
                          <Badge className={
                            r.priority === "high" ? "bg-red-100 text-red-700 shrink-0" :
                            r.priority === "medium" ? "bg-amber-100 text-amber-700 shrink-0" :
                            "bg-slate-100 text-slate-700 shrink-0"
                          }>{r.priority === "high" ? "Ưu tiên cao" : r.priority === "medium" ? "Nên học" : "Tùy chọn"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.reason}</p>
                        <Button asChild size="sm" variant="outline" className="w-full border-violet-200 text-violet-700 h-7 text-xs">
                          <Link to="/my-learning-paths/$id" params={{ id: r.path_id }}>Xem lộ trình <ArrowRight className="h-3 w-3 ml-1" /></Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {!rec && !recLoading && (
            <p className="text-sm text-muted-foreground">AI sẽ phân tích tiến độ và gợi ý lộ trình học phù hợp nhất với vị trí và mức độ hiện tại của bạn.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm lộ trình..." className="pl-9" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {[{ v: "all", l: "Tất cả" }, ...LP_ENROLLMENT_STATUS.map(o => ({ v: o.value, l: o.label }))].map(o => (
              <Button key={o.v} size="sm" variant={filter === o.v ? "default" : "outline"} onClick={() => setFilter(o.v as typeof filter)}>{o.l}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-lg" />)}
        </div>
      ) : isError ? (
        <Card><CardContent className="p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500/70" />
          <h3 className="mt-4 font-semibold">Không thể tải dữ liệu</h3>
          <p className="text-sm text-muted-foreground">Đã có lỗi xảy ra. Vui lòng thử lại.</p>
          <Button onClick={() => refetch()} className="mt-4" size="sm">Thử lại</Button>
        </CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-semibold">{enrollments.length === 0 ? "Bạn chưa có lộ trình học nào." : "Không có kết quả phù hợp"}</h3>
          <p className="text-sm text-muted-foreground">{enrollments.length === 0 ? "Quản trị viên sẽ gán lộ trình học cho bạn." : "Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm."}</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(e => {
            const lp = e.learning_paths;
            if (!lp) return null;
            const locked = lp.status === "locked";
            const status = e.derivedStatus;
            const overdue = status === "overdue";
            return (
              <Card key={e.id} className={`overflow-hidden flex flex-col ${locked ? "opacity-60" : ""}`}>
                <div className="relative h-32 bg-gradient-to-br from-primary/10 to-violet-200">
                  {lp.cover_url ? (
                    <img src={lp.cover_url} alt={lp.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary/30"><BookOpen className="h-12 w-12" /></div>
                  )}
                  <div className="absolute left-2 top-2">{statusBadge(status)}</div>
                  {locked && <Badge className="absolute right-2 top-2 bg-amber-100 text-amber-700"><Lock className="h-3 w-3" /> Đã khoá</Badge>}
                </div>
                <CardContent className="flex-1 flex flex-col p-4 gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Badge variant="outline" className="text-[10px]">{lp.code}</Badge>
                      <h3 className="mt-1 font-semibold line-clamp-2">{lp.title}</h3>
                    </div>
                    {!locked && (
                      <Link
                        to="/my-learning-paths/$id"
                        params={{ id: lp.id }}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                        title="Khoá học của tôi"
                        aria-label="Khoá học của tôi"
                      >
                        <GraduationCap className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                  {lp.description && <p className="text-xs text-muted-foreground line-clamp-2">{lp.description}</p>}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-medium">{e.progress}%</span>
                    </div>
                    <Progress value={e.progress} className="h-1.5" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{lp.courses_count ?? 0} khoá</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lp.duration_hours ?? 0}h</span>
                    {e.deadline && (
                      <>
                        <span>·</span>
                        <span className={overdue ? "text-red-600 font-medium" : ""}>
                          Hạn {new Date(e.deadline).toLocaleDateString("vi-VN")}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-auto pt-2">
                    {status === "completed" ? (
                      <Button asChild variant="outline" className="w-full" size="sm">
                        <Link to="/my-learning-paths/$id" params={{ id: lp.id }}><CheckCircle2 className="h-4 w-4" /> Xem lại</Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full" size="sm" disabled={locked}>
                        <Link to="/my-learning-paths/$id" params={{ id: lp.id }}>
                          {status === "not_started" ? "Bắt đầu" : "Tiếp tục"} <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
