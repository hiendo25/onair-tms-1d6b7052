import { createFileRoute } from "@tanstack/react-router";
import { Plus, MoreHorizontal, Phone, MapPin } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_BRANCHES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/branches")({
  head: () => ({ meta: [{ title: "Chi nhánh — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Quản lý chi nhánh"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Chi nhánh" }]}
      actions={<Button size="sm"><Plus className="h-4 w-4" />Thêm chi nhánh</Button>}
    >
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên chi nhánh</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Quản lý</TableHead>
              <TableHead className="text-right">Nhân sự</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_BRANCHES.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.code}</TableCell>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell><span className="flex items-center gap-1.5 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{b.address}</span></TableCell>
                <TableCell><span className="flex items-center gap-1.5 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{b.phone}</span></TableCell>
                <TableCell>{b.manager}</TableCell>
                <TableCell className="text-right">{b.employees}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  ),
});
