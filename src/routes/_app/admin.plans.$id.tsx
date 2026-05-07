import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit } from "lucide-react";

export const Route = createFileRoute("/_app/admin/plans/$id")({
  head: () => ({ meta: [{ title: "Chi tiết kế hoạch — OnAir TMS" }] }),
  component: PlanDetail,
});

function PlanDetail() {
  const { id } = Route.useParams();
  return (
    <PageContainer
      title={`Kế hoạch đào tạo Q1/2026`}
      description={`Mã: KH-${id}`}
      breadcrumbs={[{ title: "Kế hoạch", path: "/admin/plans" }, { title: `#${id}` }]}
      actions={<Button size="sm" asChild><Link to="/admin/plans/$id/edit" params={{ id }}><Edit className="h-4 w-4" />Chỉnh sửa</Link></Button>}
    >
      <div className="grid gap-3 md:grid-cols-4 mb-2">
        {[["Trạng thái","Đã duyệt"],["Học viên","120"],["Chương trình","5"],["Thời gian","Q1 2026"]].map(([l,v])=>(
          <Card key={l}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="programs">Chương trình</TabsTrigger>
          <TabsTrigger value="survey">Khảo sát</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Thông tin kế hoạch</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            <p>Kế hoạch đào tạo nâng cao kỹ năng Q1/2026 dành cho toàn bộ nhân viên kỹ thuật.</p>
            <Badge>Đã duyệt</Badge>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="programs">
          <div className="space-y-3">
            {["Lập trình nâng cao","Kỹ năng mềm","Quản lý dự án"].map((n)=>(
              <Card key={n}><CardContent className="p-4 flex items-center justify-between">
                <div><div className="font-medium">{n}</div><div className="text-xs text-muted-foreground">3 môn học · 12 lớp</div></div>
                <Button size="sm" variant="outline">Xem</Button>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="survey"><Card><CardContent className="p-6 text-sm text-muted-foreground">Chưa có khảo sát đính kèm.</CardContent></Card></TabsContent>
      </Tabs>
    </PageContainer>
  );
}
