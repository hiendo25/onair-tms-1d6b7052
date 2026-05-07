import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/assignments/create")({
  head: () => ({ meta: [{ title: "Tạo bài kiểm tra — OnAir TMS" }] }),
  component: () => (
    <PageContainer title="Tạo bài kiểm tra" breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: "Tạo mới" }]}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Tiêu đề *</Label><Input /></div>
            <div><Label>Mô tả</Label><Textarea rows={4} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Thời gian (phút)</Label><Input type="number" defaultValue={60} /></div>
              <div><Label>Số lần làm</Label><Input type="number" defaultValue={1} /></div>
            </div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle>Câu hỏi</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Chọn từ ngân hàng câu hỏi
            <Button className="w-full mt-3" variant="outline">+ Thêm câu hỏi</Button>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end gap-2 mt-4"><Button variant="outline">Hủy</Button><Button>Tạo</Button></div>
    </PageContainer>
  ),
});
