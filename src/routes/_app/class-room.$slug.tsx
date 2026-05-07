import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users } from "lucide-react";

export const Route = createFileRoute("/_app/class-room/$slug")({
  head: () => ({ meta: [{ title: "Chi tiết lớp học — OnAir TMS" }] }),
  component: CRDetail,
});
function CRDetail() {
  const { slug } = Route.useParams();
  return (
    <PageContainer title="Lớp Lập trình React Cơ bản" description={`Slug: ${slug}`}
      breadcrumbs={[{ title: "Lớp học", path: "/my-class" }, { title: slug }]}
      actions={<Button asChild><Link to="/class-room/$slug/learning-screen/$courseId" params={{slug, courseId:"1"}}>Vào học</Link></Button>}>
      <div className="grid gap-3 md:grid-cols-3 mb-4">
        {([["Học viên","32",Users],["Buổi học","12",Calendar],["Tiến độ","45%",Calendar]] as const).map(([l,v,Ico])=>(
          <Card key={l}><CardContent className="p-4 flex items-center gap-3"><Ico className="h-8 w-8 text-primary"/><div><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-semibold">{v}</div></div></CardContent></Card>
        ))}
      </div>
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Tổng quan</TabsTrigger>
          <TabsTrigger value="agenda">Lịch học</TabsTrigger>
          <TabsTrigger value="docs">Tài liệu</TabsTrigger>
          <TabsTrigger value="exam">Bài kiểm tra</TabsTrigger>
        </TabsList>
        <TabsContent value="info"><Card><CardHeader><CardTitle>Mô tả</CardTitle></CardHeader><CardContent className="text-sm">Lớp học cung cấp nền tảng React cho người mới bắt đầu.</CardContent></Card></TabsContent>
        <TabsContent value="agenda">
          <div className="space-y-2">{Array.from({length:3}).map((_,i)=>(
            <Card key={i}><CardContent className="p-4 flex justify-between"><div><div className="font-medium">Buổi {i+1}</div><div className="text-xs text-muted-foreground">10:00 - 12:00, 15/05/2026</div></div><Badge>Sắp diễn ra</Badge></CardContent></Card>
          ))}</div>
        </TabsContent>
        <TabsContent value="docs"><Card><CardContent className="p-6 text-sm text-muted-foreground">Chưa có tài liệu.</CardContent></Card></TabsContent>
        <TabsContent value="exam"><Card><CardContent className="p-6 text-sm text-muted-foreground">Chưa có bài kiểm tra.</CardContent></Card></TabsContent>
      </Tabs>
    </PageContainer>
  );
}
