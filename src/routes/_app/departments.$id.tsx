import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Loader2, Users } from "lucide-react";
import { useDepartments, useEmployees, useBranches } from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/departments/$id")({
  head: () => ({ meta: [{ title: "Chi tiết phòng ban — OnAir TMS" }] }),
  component: DepartmentDetail,
});

function DepartmentDetail() {
  const { id } = Route.useParams();
  const { data: departments = [], isLoading: loadingDept } = useDepartments();
  const { data: employees = [], isLoading: loadingEmp } = useEmployees();
  const { data: branches = [] } = useBranches();

  const dept = departments.find((d) => d.id === id);

  if (loadingDept) {
    return (
      <PageContainer title="Phòng ban" breadcrumbs={[{ title: "Tổ chức" }, { title: "Phòng ban", path: "/departments" }, { title: "..." }]}>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </PageContainer>
    );
  }

  if (!dept) {
    return (
      <PageContainer title="Không tìm thấy" breadcrumbs={[{ title: "Tổ chức" }, { title: "Phòng ban", path: "/departments" }]}>
        <p className="text-muted-foreground">Phòng ban không tồn tại.</p>
      </PageContainer>
    );
  }

  const deptEmps = employees.filter((e) => e.department === dept.name);
  const branchObj = branches.find((b) => b.name === dept.branch);

  return (
    <PageContainer
      title={dept.name}
      description={`Mã: ${dept.code}`}
      breadcrumbs={[{ title: "Tổ chức" }, { title: "Phòng ban", path: "/departments" }, { title: dept.name }]}
      actions={
        <Button size="sm" asChild>
          <Link to="/departments/$id/edit" params={{ id: dept.id }}><Edit className="h-4 w-4" />Chỉnh sửa</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3 mb-2">
        <Card className="p-4 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary/60" />
          <div>
            <div className="text-2xl font-semibold">{deptEmps.length}</div>
            <div className="text-xs text-muted-foreground">Nhân viên</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Chi nhánh</div>
          <div className="font-medium">{dept.branch || "—"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Trạng thái</div>
          <Badge variant={dept.status === "active" ? "default" : "secondary"}>
            {dept.status === "active" ? "Hoạt động" : "Ngưng hoạt động"}
          </Badge>
        </Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="employees">Nhân viên ({deptEmps.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader><CardTitle>Thông tin phòng ban</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
              <div><div className="text-muted-foreground mb-1">Tên phòng ban</div><div>{dept.name}</div></div>
              <div><div className="text-muted-foreground mb-1">Mã phòng ban</div><div>{dept.code}</div></div>
              <div><div className="text-muted-foreground mb-1">Trưởng phòng</div><div>{dept.head || "—"}</div></div>
              <div>
                <div className="text-muted-foreground mb-1">Chi nhánh</div>
                <div>
                  {branchObj ? (
                    <Link to="/branches/$id" params={{ id: branchObj.id }} className="text-primary hover:underline">
                      {dept.branch}
                    </Link>
                  ) : (dept.branch || "—")}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            {loadingEmp ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : deptEmps.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Chưa có nhân viên nào trong phòng ban này.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Chức danh</TableHead>
                    <TableHead>Loại HĐ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptEmps.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {e.name.split(" ").slice(-2).map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{e.name}</div>
                            <div className="text-xs text-muted-foreground">{e.employee_code || ""}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{e.email}</TableCell>
                      <TableCell>{e.position || "—"}</TableCell>
                      <TableCell>
                        {e.type === "fulltime" ? "Toàn thời gian"
                          : e.type === "parttime" ? "Bán thời gian"
                          : e.type === "intern" ? "Thực tập"
                          : e.type === "contract" ? "Hợp đồng"
                          : e.type || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={e.status === "active" ? "default" : "secondary"} className="text-xs">
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
