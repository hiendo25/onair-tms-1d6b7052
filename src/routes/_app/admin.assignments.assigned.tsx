import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Eye, Trash2, Users, Calendar, BookOpen, FileCheck2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import {
  useExamAssignments, useExamAssignmentMutations, useAssignments, useExamAttempts,
} from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/admin/assignments/assigned")({
  head: () => ({ meta: [{ title: "Bài KT đã gán — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { data: assigns = [] } = useExamAssignments();
  const { data: exams = [] } = useAssignments();
  const { data: attempts = [] } = useExamAttempts();
  const m = useExamAssignmentMutations();
  const [q, setQ] = useState("");
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = useMemo(() => assigns.filter(a => {
    const ex = exams.find(e => e.id === a.exam_id);
    const t = (ex?.title || "").toLowerCase();
    return !q || t.includes(q.toLowerCase());
  }), [assigns, exams, q]);

  const totalAssigned = assigns.reduce((s, a) => s + (a.student_ids?.length || 0), 0);
  const totalAttempts = attempts.length;
  const totalSubmitted = attempts.filter(a => a.status === "submitted").length;
  const totalPassed = attempts.filter(a => a.passed === true).length;

  return (
    <PageContainer title="Bài kiểm tra đã gán" breadcrumbs={[{ title: "Bài kiểm tra" }, { title: "Đã gán" }]}>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat icon={BookOpen} label="Lần gán" value={String(assigns.length)} />
        <Stat icon={Users} label="Lượt gán học viên" value={String(totalAssigned)} />
        <Stat icon={FileCheck2} label="Đã nộp" value={`${totalSubmitted}/${totalAttempts}`} />
        <Stat icon={Calendar} label="Đạt" value={String(totalPassed)} />
      </div>

      <Card className="p-4">
        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm theo tên bài KT..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Bài kiểm tra</TableHead><TableHead>Học viên</TableHead>
            <TableHead>Hạn nộp</TableHead><TableHead>Trạng thái</TableHead>
            <TableHead>Ngày gán</TableHead><TableHead className="text-right">Thao tác</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Chưa có lần gán nào</TableCell></TableRow>}
            {filtered.map(a => {
              const ex = exams.find(e => e.id === a.exam_id);
              const myAtt = attempts.filter(t => t.exam_assignment_id === a.id);
              const submitted = myAtt.filter(t => t.status === "submitted").length;
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{ex?.title || "(Đã xoá)"}</TableCell>
                  <TableCell>{submitted}/{a.student_ids?.length || 0}</TableCell>
                  <TableCell>{a.deadline ? new Date(a.deadline).toLocaleString("vi-VN") : "—"}</TableCell>
                  <TableCell><Badge variant={a.status === "active" ? "default" : "secondary"}>{a.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" asChild><Link to="/admin/assignments/$id/students" params={{ id: a.id }}><Eye className="h-4 w-4" /></Link></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDelId(a.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      <ConfirmDelete open={!!delId} onOpenChange={v => !v && setDelId(null)} onConfirm={async () => { if (delId) { await m.remove.mutateAsync(delId); setDelId(null); } }} />
    </PageContainer>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card><CardContent className="flex items-center gap-3 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-display text-xl font-semibold">{value}</div></div>
    </CardContent></Card>
  );
}
