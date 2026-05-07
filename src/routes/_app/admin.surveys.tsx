import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, MoreHorizontal, FileText, MessageSquare } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_SURVEYS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/surveys")({
  head: () => ({ meta: [{ title: "Khảo sát — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Khảo sát"
      breadcrumbs={[{ title: "Khảo sát" }]}
      actions={<Button asChild size="sm"><Link to="/admin/surveys/create"><Plus className="h-4 w-4" />Tạo khảo sát</Link></Button>}
    >
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên khảo sát</TableHead>
              <TableHead className="text-right">Câu hỏi</TableHead>
              <TableHead className="text-right">Phản hồi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_SURVEYS.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell className="text-right"><span className="inline-flex items-center gap-1.5 text-sm"><FileText className="h-3.5 w-3.5 text-muted-foreground" />{s.questions}</span></TableCell>
                <TableCell className="text-right"><span className="inline-flex items-center gap-1.5 text-sm"><MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />{s.responses}</span></TableCell>
                <TableCell>
                  <Badge className={
                    s.status === "running" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                    s.status === "closed" ? "bg-slate-100 text-slate-700 hover:bg-slate-100" :
                    "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }>
                    {s.status === "running" ? "Đang chạy" : s.status === "closed" ? "Đã đóng" : "Nháp"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.createdAt}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  ),
});
