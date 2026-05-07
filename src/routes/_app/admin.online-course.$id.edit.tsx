import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/online-course/$id/edit")({
  head: () => ({ meta: [{ title: "Chỉnh sửa môn học — OnAir LMS" }] }),
  component: EditCourse,
});
function EditCourse() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Chỉnh sửa môn học" breadcrumbs={[{ title: "Môn học", path: "/admin/online-course" }, { title: `#${id}` }, { title: "Sửa" }]}>
      <Card><CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Tên môn</Label><Input defaultValue="React Cơ bản" /></div>
          <div><Label>Slug</Label><Input defaultValue="react-co-ban" /></div>
          <div className="md:col-span-2"><Label>Mô tả</Label><Textarea rows={4} /></div>
          <div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Lưu</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
