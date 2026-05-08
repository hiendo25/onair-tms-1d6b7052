import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, PlayCircle, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExamAssignments, useExamAttempts } from "@/lib/data-hooks";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app/my-assignments")({
  head: () => ({ meta: [{ title: "Bài kiểm tra của tôi — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: assigns = [] } = useExamAssignments();
  const { data: attempts = [] } = useExamAttempts();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const mine = useMemo(() => assigns.filter(a => uid && (a.student_ids || []).includes(uid)), [assigns, uid]);
  const items = mine.map(a => {
    const myAtt = attempts.filter(t => t.exam_assignment_id === a.id && t.user_id === uid)
      .sort((x, y) => (y.attempt_number || 1) - (x.attempt_number || 1));
    const last = myAtt[0];
    const snap = a.exam_snapshot as { title?: string; max_attempts?: number; pass_score?: number; total_points?: number; show_results?: boolean };
    const usedAttempts = myAtt.length;
    const submitted = last?.status === "submitted";
    const status = submitted ? "submitted" : last ? "in_progress" : "not_started";
    return { a, snap, last, usedAttempts, status };
  });

  const filtered = items.filter(it => {
    if (filter !== "all" && it.status !== filter) return false;
    if (q && !(it.snap.title || "").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

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
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="not_started">Chưa làm</SelectItem>
                <SelectItem value="in_progress">Đang làm</SelectItem>
                <SelectItem value="submitted">Đã nộp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Tên bài</TableHead><TableHead>Hạn nộp</TableHead>
            <TableHead>Trạng thái</TableHead><TableHead>Điểm</TableHead>
            <TableHead>Lần làm</TableHead><TableHead className="text-right">Thao tác</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Không có bài kiểm tra nào</TableCell></TableRow>}
            {filtered.map(({ a, snap, last, usedAttempts, status }) => {
              const maxAtt = snap.max_attempts;
              const exhausted = maxAtt != null && usedAttempts >= maxAtt && status !== "in_progress";
              const overDue = a.deadline && new Date(a.deadline) < new Date() && status !== "submitted";
              const showResult = snap.show_results !== false;
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{snap.title || "—"}</TableCell>
                  <TableCell className="text-sm">{a.deadline ? new Date(a.deadline).toLocaleString("vi-VN") : "—"}</TableCell>
                  <TableCell>
                    {status === "submitted" && <Badge>Đã nộp</Badge>}
                    {status === "in_progress" && <Badge variant="secondary">Đang làm</Badge>}
                    {status === "not_started" && <Badge variant="outline">Chưa làm</Badge>}
                  </TableCell>
                  <TableCell>{last?.status === "submitted" && showResult ? `${last.score ?? "—"}/${snap.total_points ?? 100}` : "—"}</TableCell>
                  <TableCell>{usedAttempts}{maxAtt ? `/${maxAtt}` : ""}</TableCell>
                  <TableCell className="text-right">
                    {status === "submitted" && showResult ? (
                      <Button size="sm" variant="outline" asChild><Link to="/my-assignments/$id/result/$employeeId" params={{ id: a.id, employeeId: uid! }}><CheckCircle2 className="h-4 w-4" />Kết quả</Link></Button>
                    ) : exhausted ? (
                      <Button size="sm" variant="outline" disabled>Hết lượt</Button>
                    ) : overDue ? (
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
      </Card>
    </PageContainer>
  );
}
