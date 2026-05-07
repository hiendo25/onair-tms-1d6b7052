import { createFileRoute } from "@tanstack/react-router";
import { Plus, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrgData } from "@/lib/org-context";

export const Route = createFileRoute("/_app/branches")({
  head: () => ({ meta: [{ title: "Chi nhánh — OnAir TMS" }] }),
  component: BranchesPage,
});

function BranchesPage() {
  const data = useOrgData();
  return (
    <PageContainer
      title="Quản lý chi nhánh"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Chi nhánh" }]}
      actions={<Button size="sm"><Plus className="h-4 w-4" />Thêm chi nhánh</Button>}
    >
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên chi nhánh</TableHead>
              <TableHead>Mã chi nhánh</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Địa điểm</TableHead>
              <TableHead>Người quản lý</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.branches.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell><Badge>{b.code}</Badge></TableCell>
                <TableCell><Badge variant="default" className="bg-emerald-500">Hoạt động</Badge></TableCell>
                <TableCell>{b.address}</TableCell>
                <TableCell>{b.manager || "-"}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}

