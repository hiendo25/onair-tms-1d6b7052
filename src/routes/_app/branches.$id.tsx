import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, Users, Building2 } from "lucide-react";
import { useBranches, useDepartments, useEmployees } from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/branches/$id")({
  head: () => ({ meta: [{ title: "Chi tiết chi nhánh — OnAir TMS" }] }),
  component: BranchDetail,
});

function BranchDetail() {
  const { id } = Route.useParams();
  const { data: branches = [], isLoading: loadingBranch } = useBranches();
  const { data: departments = [], isLoading: loadingDept } = useDepartments();
  const { data: employees = [], isLoading: loadingEmp } = useEmployees();

  const b = branches.find((x) => x.id === id);

  if (loadingBranch) {
    return (
      <PageContainer title="Chi nhánh" breadcrumbs={[{ title: "Tổ chức" }, { title: "Chi nhánh", path: "/branches" }, { title: "..." }]}>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </PageContainer>
    );
  }

  if (!b) {
    return (
      <PageContainer title="Không tìm thấy" breadcrumbs={[{ title: "Tổ chức" }, { title: "Chi nhánh", path: "/branches" }]}>
        <p className="text-muted-foreground">Chi nhánh không tồn tại.</p>
      </PageContainer>
    );
  }

  const branchDepts = departments.filter((d) => d.branch === b.name);
  const branchEmps = employees.filter((e) => e.branch === b.name);

  return (
    <PageContainer
      title={b.name}
      description={`Mã: ${b.code}`}
      breadcrumbs={[{ title: "Tổ chức" }, { title: "Chi nhánh", path: "/branches" }, { title: b.name }]}
      actions={
        <Button size="sm" asChild>
          <Link to="/branches/$id/edit" params={{ id: b.id }}><Edit className="h-4 w-4" />Chỉnh sửa</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3 mb-2">
        <Card className="p-4 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary/60" />
          <div>
            <div className="text-2xl font-semibold">{branchEmps.length}</div>
            <div className="text-xs text-muted-foreground">Nhân viên</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary/60" />
          <div>
            <div className="text-2xl font-semibold">{branchDepts.length}</div>
            <div className="text-xs text-muted-foreground">Phòng ban</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${b.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
          <div>
            <div className="text-sm font-medium">{b.status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}</div>
            <div className="text-xs text-muted-foreground">Trạng thái</div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="departments">Phòng ban ({branchDepts.length})</TabsTrigger>
          <TabsTrigger value="employees">Nhân viên ({branchEmps.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader><CardTitle>Thông tin chi nhánh</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
              <div><div className="text-muted-foreground mb-1">Địa chỉ</div><div>{b.address || "—"}</div></div>
              <div><div className="text-muted-foreground mb-1">SĐT</div><div>{b.phone || "—"}</div></div>
              <div><div className="text-muted-foreground mb-1">Quản lý</div><div>{b.manager || "—"}</div></div>
              <div><div className="text-muted-foreground mb-1">Mã chi nhánh</div><div>{b.code}</div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            {loadingDept ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : branchDepts.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Chưa có phòng ban nào.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên phòng ban</TableHead>
                    <TableHead>Trưởng phòng</TableHead>
                    <TableHead>Số nhân sự</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchDepts.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.head || "—"}</TableCell>
                      <TableCell>{employees.filter((e) => e.department === d.name).length}</TableCell>
                      <TableCell>
                        <Badge variant={d.status === "active" ? "default" : "secondary"}>
                          {d.status === "active" ? "Hoạt động" : "Ngưng"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            {loadingEmp ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : branchEmps.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Chưa có nhân viên nào.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead>Chức danh</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchEmps.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="text-muted-foreground">{e.email}</TableCell>
                      <TableCell>{e.department || "—"}</TableCell>
                      <TableCell>{e.position || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === "active" ? "default" : "secondary"}>
                          {e.status === "active" ? "Hoạt động" : "Ngưng"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
