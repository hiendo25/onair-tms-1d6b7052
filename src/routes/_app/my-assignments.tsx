import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, PlayCircle, CheckCircle2, AlertTriangle, ClipboardList, Clock } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useExamAssignments, useExamAttempts } from "@/lib/data-hooks";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app/my-assignments")({
  head: () => ({ meta: [{ title: "Bài kiểm tra của tôi — OnAir TMS" }] }),
  component: Page,
});

const stripVN = (s: string) =>
  (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

type Status = "not_started" | "in_progress" | "submitted" | "overdue" | "not_yet_open";

function Page() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: assigns = [], isLoading: l1, isError: e1, refetch: r1 } = useExamAssignments();
  const { data: attempts = [], isLoading: l2, isError: e2, refetch: r2 } = useExamAttempts();
  const loading = l1 || l2;
  const error = e1 || e2;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");

  const items = useMemo(() => {
    const mine = assigns.filter(a => uid && (a.student_ids || []).includes(uid));
    const now = Date.now();
    return mine.map(a => {
      const myAtt = attempts.filter(t => t.exam_assignment_id === a.id && t.user_id === uid)
        .sort((x, y) => (y.attempt_number || 1) - (x.attempt_number || 1));
      const last = myAtt[0];
      const snap = (a.exam_snapshot ?? {}) as { title?: string; max_attempts?: number; pass_score?: number; total_points?: number; show_results?: boolean; time_limit_minutes?: number };
      const usedAttempts = myAtt.length;
      const submitted = last?.status === "submitted";
      const availableFromMs = (a as any).available_from ? new Date((a as any).available_from).getTime() : null;
      const notYetOpen = availableFromMs != null && now < availableFromMs && !submitted && !last;
      const isOverdue = !!a.deadline && new Date(a.deadline).getTime() < now && !submitted;
      const status: Status = submitted
        ? "submitted"
        : notYetOpen
        ? "not_yet_open"
        : isOverdue
        ? "overdue"
        : last
        ? "in_progress"
        : "not_started";
      const total = snap.total_points ?? 100;
      const pass = snap.pass_score ?? 0;
      const score = typeof last?.score === "number" ? Number(last.score) : null;
      const passed = submitted && score != null ? score >= pass : null;
      return { a, snap, last, usedAttempts, status, score, passed, total };
    });
  }, [assigns, attempts, uid]);

  const filtered = items.filter(it => {
    if (filter !== "all" && it.status !== filter) return false;
    if (q && !stripVN(it.snap.title || "").includes(stripVN(q))) return false;
    return true;
  });

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

  return (
    <PageContainer title="Bài kiểm tra của tôi" breadcrumbs={[{ title: "Bài kiểm tra của tôi" }]}>
      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Danh sách bài kiểm tra được giao ({filtered.length})</h2>
          <div className="flex gap-2">
            <div className="relative w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Tìm bài kiểm tra..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as Status | "all")}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="not_yet_open">Chưa mở</SelectItem>
                <SelectItem value="not_started">Chưa làm</SelectItem>
                <SelectItem value="in_progress">Đang làm</SelectItem>
                <SelectItem value="submitted">Đã nộp</SelectItem>
                <SelectItem value="overdue">Trễ hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground">Không thể tải dữ liệu. Vui lòng thử lại.</p>
            <Button size="sm" variant="outline" onClick={() => { r1(); r2(); }}>Thử lại</Button>
          </div>
        ) : loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tên bài</TableHead>
              <TableHead>Thời lượng</TableHead>
              <TableHead>Hạn nộp</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead>Lần làm</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <ClipboardList className="h-10 w-10 text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">
                      {items.length === 0 ? "Bạn chưa được giao bài kiểm tra nào" : "Không có bài kiểm tra phù hợp bộ lọc"}
                    </p>
                  </div>
                </TableCell></TableRow>
              )}
              {filtered.map(({ a, snap, last, usedAttempts, status, score, passed, total }) => {
                const maxAtt = snap.max_attempts;
                const exhausted = maxAtt != null && usedAttempts >= maxAtt && status !== "in_progress" && status !== "submitted";
                const showResult = snap.show_results !== false;
                const overdueDeadline = !!a.deadline && new Date(a.deadline).getTime() < Date.now();
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{snap.title || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {snap.time_limit_minutes ? <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{snap.time_limit_minutes} phút</span> : "—"}
                    </TableCell>
                    <TableCell className={`text-sm ${overdueDeadline && status !== "submitted" ? "text-destructive font-medium" : ""}`}>{fmt(a.deadline)}</TableCell>
                    <TableCell>
                      {status === "submitted" && <Badge>Đã nộp</Badge>}
                      {status === "in_progress" && <Badge variant="secondary">Đang làm</Badge>}
                      {status === "not_started" && <Badge variant="outline">Chưa làm</Badge>}
                      {status === "overdue" && <Badge variant="destructive">Trễ hạn</Badge>}
                    </TableCell>
                    <TableCell>
                      {status === "submitted" && showResult && score != null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{score}/{total}</span>
                          {passed ? <Badge className="bg-emerald-600 hover:bg-emerald-600">Đạt</Badge> : <Badge variant="destructive">Chưa đạt</Badge>}
                        </div>
                      ) : status === "submitted" && !showResult ? (
                        <span className="text-xs text-muted-foreground">Đã nộp</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{usedAttempts}{maxAtt ? `/${maxAtt}` : ""}</TableCell>
                    <TableCell className="text-right">
                      {status === "submitted" && showResult ? (
                        <Button size="sm" variant="outline" asChild><Link to="/my-assignments/$id/result/$employeeId" params={{ id: a.id, employeeId: uid! }}><CheckCircle2 className="h-4 w-4" />Kết quả</Link></Button>
                      ) : exhausted ? (
                        <Button size="sm" variant="outline" disabled>Hết lượt</Button>
                      ) : status === "overdue" ? (
                        <Button size="sm" variant="outline" disabled>Quá hạn</Button>
                      ) : (
                        <Button size="sm" asChild><Link to="/my-assignments/$id/submit/$employeeId" params={{ id: a.id, employeeId: uid || "me" }}><PlayCircle className="h-4 w-4" />{status === "in_progress" ? "Tiếp tục" : "Bắt đầu"}</Link></Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </PageContainer>
  );
}
