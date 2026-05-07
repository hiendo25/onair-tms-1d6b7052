import { createFileRoute } from "@tanstack/react-router";
import { Plus, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrgData } from "@/lib/org-context";

export const Route = createFileRoute("/_app/departments")({
  head: () => ({ meta: [{ title: "Phòng ban — OnAir TMS" }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const data = useOrgData();
  return (
    <PageContainer
      title="Quản lý phòng ban"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Phòng ban" }]}
      actions={<Button size="sm"><Plus className="h-4 w-4" />Thêm phòng ban</Button>}
    >
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên phòng ban</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người quản lý</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.departments.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell><Badge>{d.code}</Badge></TableCell>
                <TableCell>{d.branch}</TableCell>
                <TableCell><Badge className="bg-emerald-500">Hoạt động</Badge></TableCell>
                <TableCell>{d.head || "-"}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}

