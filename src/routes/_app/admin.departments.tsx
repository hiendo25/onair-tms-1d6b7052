import { createFileRoute } from "@tanstack/react-router";
import { Plus, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_DEPARTMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/departments")({
  head: () => ({ meta: [{ title: "Phòng ban — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Quản lý phòng ban"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Phòng ban" }]}
      actions={<Button size="sm"><Plus className="h-4 w-4" />Thêm phòng ban</Button>}
    >
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên phòng ban</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Trưởng phòng</TableHead>
              <TableHead className="text-right">Nhân sự</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_DEPARTMENTS.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">{d.code}</TableCell>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell><Badge variant="secondary">{d.branch}</Badge></TableCell>
                <TableCell>{d.head}</TableCell>
                <TableCell className="text-right">{d.employees}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  ),
});
