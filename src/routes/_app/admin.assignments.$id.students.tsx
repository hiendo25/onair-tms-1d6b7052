import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin/assignments/$id/students")({
  head: () => ({ meta: [{ title: "Học viên bài KT — OnAir LMS" }] }),
  component: AS,
});
function AS() {
  const { id } = Route.useParams();
  const rows = Array.from({length:8}).map((_,i)=>({n:`Học viên ${i+1}`, status: i%3===0?"Chưa làm":i%3===1?"Đã nộp":"Đã chấm", score: i%3===2 ? `${70+i}/100`:"-"}));
  return (
    <PageContainer title="Danh sách học viên" breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: `#${id}` }, { title: "Học viên" }]}>
      <Card><Table>
        <TableHeader><TableRow><TableHead>Học viên</TableHead><TableHead>Trạng thái</TableHead><TableHead>Điểm</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>{rows.map((r,i)=>(
          <TableRow key={i}>
            <TableCell>{r.n}</TableCell>
            <TableCell><Badge variant={r.status==="Đã chấm"?"default":"secondary"}>{r.status}</Badge></TableCell>
            <TableCell>{r.score}</TableCell>
            <TableCell className="text-right">
              {r.status==="Đã nộp" && <Button size="sm" variant="outline" asChild><Link to="/admin/assignments/$id/grade" params={{id}}>Chấm</Link></Button>}
              {r.status==="Đã chấm" && <Button size="sm" variant="ghost" asChild><Link to="/admin/assignments/$id/result/$employeeId" params={{id, employeeId:String(i)}}>Xem</Link></Button>}
            </TableCell>
          </TableRow>
        ))}</TableBody>
      </Table></Card>
    </PageContainer>
  );
}
