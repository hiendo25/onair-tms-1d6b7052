import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Copy, BarChart3, Pencil, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_SURVEYS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/surveys")({
  head: () => ({ meta: [{ title: "Khảo sát — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Khảo sát"
      breadcrumbs={[{ title: "Khảo sát" }]}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-[300px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm kiếm khảo sát..." className="pl-9" />
        </div>
        <Button asChild size="sm">
          <Link to="/admin/surveys/create"><Plus className="h-4 w-4" />Tạo khảo sát</Link>
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên khảo sát</TableHead>
              <TableHead className="w-[120px]">SL câu hỏi</TableHead>
              <TableHead className="w-[200px]">Người tạo</TableHead>
              <TableHead className="w-[180px]">Ngày tạo</TableHead>
              <TableHead className="w-[180px] text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_SURVEYS.map(s => (
              <TableRow key={s.id}>
                <TableCell className="text-sm font-semibold">{s.title}</TableCell>
                <TableCell>{s.questions}</TableCell>
                <TableCell className="text-sm font-semibold">Admin OnAir</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.createdAt}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600"><Copy className="h-4 w-4" /></Button>
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-blue-600">
                      <Link to="/admin/surveys/$id/statistics" params={{ id: s.id }}><BarChart3 className="h-4 w-4" /></Link>
                    </Button>
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-blue-600">
                      <Link to="/admin/surveys/$id/edit" params={{ id: s.id }}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  ),
});
