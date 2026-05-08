import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PlayCircle, Calendar, Users, GraduationCap, MapPin, Search, Filter,
  AlertTriangle, Clock, Video, BookOpen, QrCode, Eye, Loader2,
} from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";

export const Route = createFileRoute("/_app/my-class")({
  head: () => ({ meta: [{ title: "Lớp học của tôi — OnAir TMS" }] }),
  component: MyClassPage,
});

type Delivery = "live" | "offline" | "elearning";

const stripVN = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "—";
const fmtTime = (d?: string | null) =>
  d ? new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";

function deliveryLabel(d: Delivery) {
  return d === "live" ? "Live" : d === "offline" ? "Offline" : "E-learning";
}

function MyClassPage() {
  const { orgId } = useOrg();
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Delivery>("all");
  const [modeFilter, setModeFilter] = useState<"all" | "single" | "series">("all");
  const [tab, setTab] = useState<"all" | "ongoing" | "today" | "upcoming" | "ended">("all");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const q = useQuery({
    queryKey: ["my-classes", orgId, userId],
    enabled: !!userId && !!orgId,
    queryFn: async () => {
      // class assignments for this learner
      const { data: cs, error: e1 } = await supabase
        .from("classroom_students")
        .select("classroom_id")
        .eq("user_id", userId!)
        .eq("org_id", orgId!);
      if (e1) throw e1;
      const ids = (cs ?? []).map((r) => r.classroom_id);
      if (!ids.length) return { classes: [], sessions: [], cc: [], enrollments: [] };

      const [{ data: classes }, { data: sessions }, { data: cc }] = await Promise.all([
        supabase.from("classrooms").select("*").in("id", ids),
        supabase.from("classroom_sessions").select("*").in("classroom_id", ids).order("start_at"),
        supabase.from("classroom_courses").select("*").in("classroom_id", ids),
      ]);

      const courseIds = Array.from(new Set((cc ?? []).map((r) => r.course_id)));
      let enrollments: any[] = [];
      if (courseIds.length) {
        const { data: enr } = await supabase
          .from("course_enrollments")
          .select("*")
          .in("course_id", courseIds)
          .eq("user_id", userId!);
        enrollments = enr ?? [];
      }
      return { classes: classes ?? [], sessions: sessions ?? [], cc: cc ?? [], enrollments };
    },
  });

  const now = Date.now();
  const items = useMemo(() => {
    if (!q.data) return [];
    return q.data.classes.map((c: any) => {
      const sessions = q.data!.sessions.filter((s: any) => s.classroom_id === c.id);
      const courses = q.data!.cc.filter((r: any) => r.classroom_id === c.id);
      const delivery: Delivery =
        (c.delivery as Delivery) || (c.type as Delivery) || "offline";
      const mode: "single" | "series" = (c.mode === "series" ? "series" : "single");
      const lastEnd = sessions.length
        ? Math.max(...sessions.map((s: any) => new Date(s.end_at ?? s.start_at ?? 0).getTime()))
        : new Date(c.end_at ?? c.end_date ?? 0).getTime();
      const firstStart = sessions.length
        ? Math.min(...sessions.map((s: any) => new Date(s.start_at ?? 0).getTime()))
        : new Date(c.start_at ?? c.start_date ?? 0).getTime();
      const nextSession =
        sessions.find((s: any) => new Date(s.end_at ?? s.start_at ?? 0).getTime() > now) ?? null;

      // E-learning progress
      let elearningProgress = 0;
      let elearningTotal = courses.length;
      if (delivery === "elearning" && elearningTotal > 0) {
        const sum = courses.reduce((acc: number, r: any) => {
          const enr = q.data!.enrollments.find((e: any) => e.course_id === r.course_id);
          return acc + (enr?.progress ?? 0);
        }, 0);
        elearningProgress = Math.round(sum / elearningTotal);
      }

      const ended =
        delivery === "elearning"
          ? (elearningTotal > 0 && elearningProgress >= 100) || (lastEnd > 0 && lastEnd < now)
          : lastEnd > 0 && lastEnd < now;

      // Time-based status for live/offline
      let timeStatus: "ongoing" | "today" | "upcoming" | "ended" = "upcoming";
      if (ended) timeStatus = "ended";
      else if (nextSession) {
        const s = new Date(nextSession.start_at ?? 0).getTime();
        const e = new Date(nextSession.end_at ?? nextSession.start_at ?? 0).getTime();
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        if (now >= s && now <= e) timeStatus = "ongoing";
        else if (s >= todayStart.getTime() && s <= todayEnd.getTime()) timeStatus = "today";
        else timeStatus = "upcoming";
      } else if (delivery === "elearning") {
        if (elearningProgress > 0 && elearningProgress < 100) timeStatus = "ongoing";
        else if (firstStart > now) timeStatus = "upcoming";
        else timeStatus = "today";
      }

      return {
        c, delivery, mode, sessions, courses, nextSession,
        elearningProgress, elearningTotal, ended, lastEnd, timeStatus,
      };
    });
  }, [q.data, now]);

  const filtered = useMemo(() => {
    const term = stripVN(search.trim());
    return items
      .filter((it) => tab === "all" ? true : tab === "ended" ? it.ended : it.timeStatus === tab)
      .filter((it) => (typeFilter === "all" ? true : it.delivery === typeFilter))
      .filter((it) => (modeFilter === "all" ? true : it.mode === modeFilter))
      .filter((it) =>
        !term
          ? true
          : stripVN(it.c.title ?? "").includes(term) ||
            stripVN(it.c.code ?? "").includes(term),
      );
  }, [items, search, typeFilter, modeFilter, tab]);

  const counts = useMemo(
    () => ({
      all: items.length,
      ongoing: items.filter((i) => !i.ended && i.timeStatus === "ongoing").length,
      today: items.filter((i) => !i.ended && i.timeStatus === "today").length,
      upcoming: items.filter((i) => !i.ended && i.timeStatus === "upcoming").length,
      ended: items.filter((i) => i.ended).length,
    }),
    [items],
  );


  return (
    <PageContainer
      title="Lớp học của tôi"
      breadcrumbs={[{ title: "LMS", path: "/student/dashboard" }, { title: "Lớp học của tôi" }]}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã lớp..."
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Hình thức" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả hình thức</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="elearning">E-learning</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modeFilter} onValueChange={(v) => setModeFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại lớp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại lớp</SelectItem>
            <SelectItem value="single">Lớp đơn</SelectItem>
            <SelectItem value="series">Lớp chuỗi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="flex-wrap h-auto">
          {([
            ["all", "Tất cả", counts.all],
            ["ongoing", "Đang diễn ra", counts.ongoing],
            ["today", "Diễn ra hôm nay", counts.today],
            ["upcoming", "Sắp diễn ra", counts.upcoming],
            ["ended", "Đã kết thúc", counts.ended],
          ] as const).map(([v, label, n]) => (
            <TabsTrigger key={v} value={v} className="gap-2">
              {label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{n}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {q.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden p-2">
                  <Skeleton className="aspect-[16/9] w-full rounded-lg" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : q.isError ? (
            <Card className="flex flex-col items-center gap-3 p-12 text-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <p className="text-sm text-muted-foreground">Không thể tải dữ liệu. Vui lòng thử lại.</p>
              <Button onClick={() => q.refetch()}>Thử lại</Button>
            </Card>
          ) : filtered.length === 0 ? (
            <EmptyState tab={tab} hasAny={items.length > 0} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((it) => <ClassCard key={it.c.id} item={it} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function EmptyState({ tab, hasAny }: { tab: string; hasAny: boolean }) {
  return (
    <Card className="flex flex-col items-center gap-3 p-12 text-center">
      <BookOpen className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {!hasAny
          ? "Bạn chưa được gán lớp học nào."
          : tab === "active"
          ? "Không có lớp học đang hoạt động."
          : "Không có lớp học đã kết thúc."}
      </p>
    </Card>
  );
}

function ClassCard({ item }: { item: any }) {
  const { c, delivery, nextSession, elearningProgress, elearningTotal, ended, sessions, courses } = item;
  const now = Date.now();

  // Live status logic
  let statusLabel = "Sắp diễn ra";
  let statusColor = "text-blue-600";
  if (delivery === "elearning") {
    if (elearningProgress >= 100) { statusLabel = "Hoàn thành"; statusColor = "text-emerald-600"; }
    else if (elearningProgress > 0) { statusLabel = "Đang học"; statusColor = "text-emerald-600"; }
    else { statusLabel = "Chưa bắt đầu"; statusColor = "text-muted-foreground"; }
  } else {
    if (ended) { statusLabel = "Đã kết thúc"; statusColor = "text-muted-foreground"; }
    else if (nextSession) {
      const start = new Date(nextSession.start_at).getTime();
      const end = new Date(nextSession.end_at ?? start).getTime();
      if (now >= start && now <= end) { statusLabel = "Đang diễn ra"; statusColor = "text-emerald-600"; }
      else { statusLabel = "Sắp diễn ra"; statusColor = "text-blue-600"; }
    }
  }

  const cover = c.cover_url || "";
  const Icon = delivery === "live" ? Video : delivery === "offline" ? MapPin : BookOpen;

  return (
    <Card className="overflow-hidden p-2 transition-shadow hover:shadow-md">
      <Link to="/class-room/$slug" params={{ slug: c.id }}>
        <div
          className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted"
          style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {!cover && (
            <div className="flex h-full items-center justify-center">
              <Icon className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <Badge variant="secondary" className="absolute left-2 top-2">
            <Icon className="mr-1 h-3 w-3" />
            {deliveryLabel(delivery)}
          </Badge>
        </div>
      </Link>
      <div className="space-y-3 px-1 pt-3">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
          {c.code && <Badge variant="outline" className="text-[10px]">{c.code}</Badge>}
        </div>
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 min-h-[42px]">{c.title}</h3>

        <div className="space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
          {delivery === "elearning" ? (
            <>
              <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" />{elearningTotal} khoá học</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" />Tiến độ {elearningProgress}%</div>
            </>
          ) : nextSession ? (
            <>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{fmtDate(nextSession.start_at)} • {fmtTime(nextSession.start_at)}-{fmtTime(nextSession.end_at)}</div>
              <div className="flex items-center gap-2">
                {delivery === "live" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                <span className="line-clamp-1">{delivery === "live" ? (nextSession.meeting_provider || "Online") : (nextSession.location || c.location || "Chưa cập nhật")}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{fmtDate(c.start_at ?? c.start_date)} - {fmtDate(c.end_at ?? c.end_date)}</div>
          )}
          {c.instructor && (
            <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /><span className="line-clamp-1">{c.instructor}</span></div>
          )}
          {c.capacity > 0 && (
            <div className="flex items-center gap-2"><Users className="h-4 w-4" />{c.students_count ?? 0}/{c.capacity} học viên</div>
          )}
        </div>

        <ClassCTA item={item} />
      </div>
    </Card>
  );
}

function ClassCTA({ item }: { item: any }) {
  const { c, delivery, nextSession, elearningProgress, elearningTotal, ended, courses } = item;
  const now = Date.now();

  if (delivery === "live") {
    if (ended) {
      return <Button asChild size="sm" variant="outline" className="w-full">
        <Link to="/class-room/$slug" params={{ slug: c.id }}><Eye className="h-4 w-4" />Xem lại</Link>
      </Button>;
    }
    if (nextSession) {
      const start = new Date(nextSession.start_at).getTime();
      const end = new Date(nextSession.end_at ?? start).getTime();
      const canJoin = now >= start - 15 * 60 * 1000 && now <= end;
      if (canJoin && nextSession.meeting_url) {
        return <Button asChild size="sm" className="w-full">
          <a href={nextSession.meeting_url} target="_blank" rel="noreferrer"><PlayCircle className="h-4 w-4" />Vào lớp học</a>
        </Button>;
      }
      return <Button size="sm" className="w-full" disabled>
        <Clock className="h-4 w-4" />Bắt đầu lúc {fmtTime(nextSession.start_at)}
      </Button>;
    }
    return <Button asChild size="sm" variant="outline" className="w-full">
      <Link to="/class-room/$slug" params={{ slug: c.id }}>Xem chi tiết</Link>
    </Button>;
  }

  if (delivery === "offline") {
    if (ended) {
      return <Button asChild size="sm" variant="outline" className="w-full">
        <Link to="/class-room/$slug" params={{ slug: c.id }}><Eye className="h-4 w-4" />Xem chi tiết</Link>
      </Button>;
    }
    if (nextSession) {
      const start = new Date(nextSession.start_at).getTime();
      const end = new Date(nextSession.end_at ?? start).getTime();
      const canScan = now >= start - 15 * 60 * 1000 && now <= end + 15 * 60 * 1000;
      return <Button asChild size="sm" className="w-full" disabled={!canScan}>
        <Link to="/class-room/$slug" params={{ slug: c.id }}><QrCode className="h-4 w-4" />{canScan ? "Quét mã điểm danh" : "Chưa đến giờ điểm danh"}</Link>
      </Button>;
    }
    return <Button asChild size="sm" variant="outline" className="w-full">
      <Link to="/class-room/$slug" params={{ slug: c.id }}>Xem chi tiết</Link>
    </Button>;
  }

  // E-learning
  const firstCourseId = courses[0]?.course_id;
  if (!firstCourseId) {
    return <Button size="sm" variant="outline" className="w-full" disabled>Chưa có khoá học</Button>;
  }
  const label = elearningProgress >= 100 ? "Xem lại" : elearningProgress > 0 ? "Tiếp tục học" : "Bắt đầu học";
  const Icon = elearningProgress >= 100 ? Eye : PlayCircle;
  return <Button asChild size="sm" className="w-full" variant={elearningProgress >= 100 ? "outline" : "default"}>
    <Link to="/my-courses/$id" params={{ id: firstCourseId }}><Icon className="h-4 w-4" />{label}</Link>
  </Button>;
}
