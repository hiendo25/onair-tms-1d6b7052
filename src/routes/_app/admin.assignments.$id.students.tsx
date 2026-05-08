import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExamAssignments, useExamAttempts, useEmployees } from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/admin/assignments/$id/students")({
  head: () => ({ meta: [{ title: "Chi tiết lần gán — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data: assigns = [] } = useExamAssignments();
  const { data: attempts = [] } = useExamAttempts();
  const { data: employees = [] } = useEmployees();
  const a = assigns.find(x => x.id === id);
  if (!a) return <PageContainer title="Không tìm thấy"><Button asChild variant="outline"><Link to="/admin/assignments/assigned"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button></PageContainer>;

  const snap = a.exam_snapshot as { title?: string; pass_score?: number; total_points?: number };
  const myAtt = attempts.filter(t => t.exam_assignment_id === a.id);
  const submitted = myAtt.filter(t => t.status === "submitted");
  const passed = myAtt.filter(t => t.passed === true).length;
  const total = a.student_ids?.length || 0;

  return (
    <PageContainer
      title={`Chi tiết: ${snap.title || "Bài kiểm tra"}`}
      breadcrumbs={[{ title: "Bài kiểm tra" }, { title: "Đã gán", path: "/admin/assignments/assigned" }, { title: "Chi tiết" }]}
      actions={<Button variant="outline" asChild><Link to="/admin/assignments/assigned"><ArrowLeft className="h-4 w-4" /> Quay lại</Link></Button>}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Học viên được gán" value={String(total)} />
        <Stat label="Đã nộp" value={`${submitted.length}/${total}`} />
        <Stat label="Đạt" value={String(passed)} />
        <Stat label="Hạn nộp" value={a.deadline ? new Date(a.deadline).toLocaleString("vi-VN") : "—"} />
      </div>

      <Card className="p-5">
        <div className="mb-3 text-sm font-semibold">Danh sách học viên</div>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Học viên</TableHead><TableHead>Trạng thái</TableHead>
            <TableHead>Điểm</TableHead><TableHead>Kết quả</TableHead><TableHead>Nộp lúc</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {(a.student_ids || []).map(uid => {
              const emp = employees.find(e => e.user_id === uid);
              const att = myAtt.filter(t => t.user_id === uid).sort((x, y) => (y.attempt_number || 1) - (x.attempt_number || 1))[0];
              return (
                <TableRow key={uid}>
                  <TableCell className="font-medium">{emp?.name || uid.slice(0, 8)}</TableCell>
                  <TableCell><Badge variant={att?.status === "submitted" ? "default" : att ? "secondary" : "outline"}>{att?.status || "Chưa làm"}</Badge></TableCell>
                  <TableCell>{att?.score != null ? `${att.score}/${snap.total_points || 100}` : "—"}</TableCell>
                  <TableCell>{att?.passed == null ? "—" : att.passed ? <Badge>Đạt</Badge> : <Badge variant="destructive">Không đạt</Badge>}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{att?.submitted_at ? new Date(att.submitted_at).toLocaleString("vi-VN") : "—"}</TableCell>
                </TableRow>
              );
            })}
            {(a.student_ids || []).length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Không có học viên</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground">{label}</div><div className="font-display text-xl font-semibold">{value}</div></CardContent></Card>;
}
