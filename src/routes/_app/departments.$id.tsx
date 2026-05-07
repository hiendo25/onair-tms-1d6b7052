import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export const Route = createFileRoute("/_app/departments/$id")({
  head: () => ({ meta: [{ title: "Chi tiết phòng ban — OnAir LMS" }] }),
  component: DepartmentDetail,
});

function DepartmentDetail() {
  const { id } = Route.useParams();
  return (
    <PageContainer
      title={`Phòng ban #${id}`}
      breadcrumbs={[{ title: "Tổ chức" }, { title: "Phòng ban", path: "/departments" }, { title: `#${id}` }]}
      actions={<Button size="sm"><Edit className="h-4 w-4" />Chỉnh sửa</Button>}
    >
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="employees">Nhân viên</TabsTrigger>
          <TabsTrigger value="groups">Nhóm con</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card><CardHeader><CardTitle>Thông tin phòng ban</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
              <div><div className="text-muted-foreground">Tên</div><div>Phòng Kỹ thuật</div></div>
              <div><div className="text-muted-foreground">Trưởng phòng</div><div>Nguyễn Văn A</div></div>
              <div><div className="text-muted-foreground">Số nhân sự</div><div>25</div></div>
              <div><div className="text-muted-foreground">Chi nhánh</div><div>HCM</div></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="employees">
          <Card><Table>
            <TableHeader><TableRow><TableHead>Họ tên</TableHead><TableHead>Email</TableHead><TableHead>Vị trí</TableHead></TableRow></TableHeader>
            <TableBody>{Array.from({length: 5}).map((_,i)=>(
              <TableRow key={i}><TableCell>Nhân viên {i+1}</TableCell><TableCell>nv{i+1}@onair.vn</TableCell><TableCell>Nhân viên</TableCell></TableRow>
            ))}</TableBody>
          </Table></Card>
        </TabsContent>
        <TabsContent value="groups">
          <Card><Table>
            <TableHeader><TableRow><TableHead>Tên nhóm</TableHead><TableHead>Số thành viên</TableHead></TableRow></TableHeader>
            <TableBody>{["Frontend","Backend","DevOps"].map((n,i)=>(
              <TableRow key={i}><TableCell>{n}</TableCell><TableCell>{5+i}</TableCell></TableRow>
            ))}</TableBody>
          </Table></Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
