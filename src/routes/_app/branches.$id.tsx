import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useOrgData } from "@/lib/org-context";

export const Route = createFileRoute("/_app/branches/$id")({
  head: () => ({ meta: [{ title: "Chi tiết chi nhánh — OnAir TMS" }] }),
  component: BranchDetail,
});

function BranchDetail() {
  const data = useOrgData();
  const { id } = Route.useParams();
  const b = data.branches.find((x) => String(x.id) === id) ?? data.branches[0];
  return (
    <PageContainer
      title={b.name}
      description={`Mã: ${b.code}`}
      breadcrumbs={[{ title: "Tổ chức" }, { title: "Chi nhánh", path: "/branches" }, { title: b.name }]}
      actions={<Button size="sm"><Edit className="h-4 w-4" />Chỉnh sửa</Button>}
    >
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="departments">Phòng ban</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card>
            <CardHeader><CardTitle>Thông tin chi nhánh</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
              <div><div className="text-muted-foreground">Địa chỉ</div><div>{b.address}</div></div>
              <div><div className="text-muted-foreground">SĐT</div><div>{b.phone}</div></div>
              <div><div className="text-muted-foreground">Quản lý</div><div>{b.manager}</div></div>
              <div><div className="text-muted-foreground">Nhân sự</div><div>{b.employees}</div></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="departments">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Tên phòng ban</TableHead><TableHead>Số nhân sự</TableHead></TableRow></TableHeader>
              <TableBody>
                {["Kỹ thuật", "Kinh doanh", "Nhân sự"].map((n, i) => (
                  <TableRow key={i}><TableCell>{n}</TableCell><TableCell>{10 + i * 5}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
