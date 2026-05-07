import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/admin/class-room/create")({
  head: () => ({ meta: [{ title: "Tạo lớp học — OnAir LMS" }] }),
  component: CreateClassRoom,
});

function CreateClassRoom() {
  return (
    <PageContainer
      title="Tạo lớp học mới"
      breadcrumbs={[{ title: "Lớp học", path: "/admin/class-room" }, { title: "Tạo mới" }]}
      actions={
        <>
          <Button variant="outline" size="sm" asChild><Link to="/admin/class-room"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button>
          <Button size="sm"><Save className="h-4 w-4" />Lưu lớp học</Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Mã lớp *</Label><Input placeholder="CLS-0110" /></div>
              <div className="space-y-1.5"><Label>Tên lớp *</Label><Input placeholder="Tên lớp học" /></div>
            </div>
            <div className="space-y-1.5"><Label>Mô tả</Label><Textarea rows={4} placeholder="Mô tả ngắn về lớp học..." /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Hình thức</Label>
                <Select defaultValue="online"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>Ngày bắt đầu</Label><Input type="date" /></div>
              <div className="space-y-1.5"><Label>Ngày kết thúc</Label><Input type="date" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Sĩ số tối đa</Label><Input type="number" defaultValue={30} /></div>
              <div className="space-y-1.5">
                <Label>Giảng viên</Label>
                <Select><SelectTrigger><SelectValue placeholder="Chọn giảng viên..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mai">Trần Thị Mai</SelectItem>
                    <SelectItem value="duc">Vũ Minh Đức</SelectItem>
                    <SelectItem value="ngoc">Lý Thị Ngọc</SelectItem>
                  </SelectContent></Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Ảnh bìa</CardTitle></CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                Kéo thả ảnh hoặc bấm để chọn
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Trạng thái</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Select defaultValue="draft"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="active">Mở đăng ký</SelectItem>
                </SelectContent></Select>
              <p className="text-xs text-muted-foreground">Chọn "Nháp" nếu chưa muốn công bố lớp học.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
