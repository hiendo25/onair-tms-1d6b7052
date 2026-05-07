import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/class-room/$id/edit")({
  head: () => ({ meta: [{ title: "Chỉnh sửa lớp học — OnAir LMS" }] }),
  component: EditCR,
});

function EditCR() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Chỉnh sửa lớp học" breadcrumbs={[{ title: "Lớp học", path: "/admin/class-room" }, { title: `#${id}` }, { title: "Sửa" }]}>
      <Card><CardHeader><CardTitle>Thông tin lớp học</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Tên lớp</Label><Input defaultValue="Lớp Lập trình React" /></div>
          <div><Label>Mã lớp</Label><Input defaultValue={`LH-${id}`} /></div>
          <div><Label>Slug</Label><Input defaultValue="lop-react" /></div>
          <div><Label>Hình thức</Label><Input defaultValue="Online" /></div>
          <div className="md:col-span-2"><Label>Mô tả</Label><Textarea rows={4} /></div>
          <div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Lưu</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
