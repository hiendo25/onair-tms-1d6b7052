import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/learning-paths/$id/edit")({
  head: () => ({ meta: [{ title: "Chỉnh sửa lộ trình — OnAir LMS" }] }),
  component: EditLP,
});
function EditLP() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Chỉnh sửa lộ trình" breadcrumbs={[{ title: "Lộ trình", path: "/admin/learning-paths" }, { title: `#${id}` }, { title: "Sửa" }]}>
      <Card><CardHeader><CardTitle>Thông tin lộ trình</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Tên lộ trình</Label><Input defaultValue="Lộ trình Frontend" /></div>
          <div><Label>Thời gian</Label><Input defaultValue="6 tháng" /></div>
          <div className="md:col-span-2"><Label>Mô tả</Label><Textarea rows={4} /></div>
          <div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Lưu</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
