import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/admin/online-course/create")({
  head: () => ({ meta: [{ title: "Tạo môn học — OnAir LMS" }] }),
  component: () => (
    <PageContainer title="Tạo môn học mới" breadcrumbs={[{ title: "Môn học", path: "/admin/online-course" }, { title: "Tạo mới" }]}>
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="sections">Nội dung</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card><CardHeader><CardTitle>Thông tin môn học</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div><Label>Tên môn *</Label><Input /></div>
              <div><Label>Slug *</Label><Input /></div>
              <div><Label>Danh mục</Label><Input /></div>
              <div><Label>Thời lượng</Label><Input placeholder="VD: 8 giờ" /></div>
              <div className="md:col-span-2"><Label>Mô tả</Label><Textarea rows={4} /></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sections"><Card><CardContent className="p-6 text-sm text-muted-foreground">Chưa có chương nào. Click "Thêm chương" để bắt đầu.</CardContent></Card></TabsContent>
        <TabsContent value="settings"><Card><CardContent className="p-6 text-sm text-muted-foreground">Cài đặt QR, chứng nhận...</CardContent></Card></TabsContent>
      </Tabs>
      <div className="flex justify-end gap-2 mt-4"><Button variant="outline">Hủy</Button><Button>Tạo môn học</Button></div>
    </PageContainer>
  ),
});
