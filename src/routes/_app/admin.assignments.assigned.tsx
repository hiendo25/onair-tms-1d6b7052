import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, HelpCircle, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useExamAssignments, useAssignments, useExamAttempts } from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/admin/assignments/assigned")({
  head: () => ({ meta: [{ title: "Danh sách bài gán — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { data: assigns = [] } = useExamAssignments();
  const { data: exams = [] } = useAssignments();
  const { data: attempts = [] } = useExamAttempts();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const enriched = useMemo(() => assigns.map(a => {
    const ex = exams.find(e => e.id === a.exam_id);
    const myAtt = attempts.filter(t => t.exam_assignment_id === a.id);
    const total = a.student_ids?.length || 0;
    const submitted = myAtt.filter(t => t.status === "submitted").length;
    const pct = total ? Math.round((submitted / total) * 100) : 0;
    return { a, ex, total, submitted, pct };
  }), [assigns, exams, attempts]);

  const filtered = enriched.filter(({ a, ex }) => {
    if (q && !(ex?.title || "").toLowerCase().includes(q.toLowerCase())) return false;
    if (status !== "all" && a.status !== status) return false;
    return true;
  });

  const totalAssigns = assigns.length;
  const completedAssigns = enriched.filter(e => e.pct === 100).length;

  return (
    <PageContainer
      title="Danh sách bài gán"
      breadcrumbs={[{ title: "Bài kiểm tra" }, { title: "Danh sách bài gán" }]}
    >
      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <StatRow icon={HelpCircle} color="text-blue-600 bg-blue-50" label="Tổng bài gán" value={totalAssigns} />
        <StatRow icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" label="Hoàn thành" value={completedAssigns} />
      </div>

      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm kiếm" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Chưa có lần gán nào</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(({ a, ex, total, submitted, pct }, idx) => (
              <div key={a.id} className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{ex?.title || "(Bài KT đã xoá)"}</div>
                  {ex?.description && <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ex.description}</div>}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">{ex?.type === "exam" ? "Công nghệ" : "Kinh doanh"}</Badge>
                    <span className="text-muted-foreground">
                      Hạn nộp: {a.deadline ? new Date(a.deadline).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "—"}
                    </span>
                  </div>
                </div>
                <div className="flex w-[260px] shrink-0 flex-col items-end gap-1">
                  <div className="flex w-full items-center gap-2">
                    <Progress value={pct} className="h-2 flex-1" />
                    <span className="w-10 text-right text-xs font-medium">{pct}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Hoàn thành {submitted}/{total}</div>
                  <Button asChild variant="link" size="sm" className="h-auto p-0 text-blue-600">
                    <Link to="/admin/assignments/$id/students" params={{ id: a.id }}>Xem chi tiết</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}

function StatRow({ icon: Icon, color, label, value }: { icon: React.ComponentType<{ className?: string }>; color: string; label: string; value: number }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold leading-tight">{value}</div>
      </div>
    </Card>
  );
}
