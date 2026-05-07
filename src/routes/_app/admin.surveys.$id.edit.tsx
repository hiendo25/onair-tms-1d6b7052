import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/surveys/$id/edit")({
  head: () => ({ meta: [{ title: "Sửa khảo sát — OnAir LMS" }] }),
  component: EditS,
});
function EditS() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Chỉnh sửa khảo sát" breadcrumbs={[{ title: "Khảo sát", path: "/admin/surveys" }, { title: `#${id}` }]}>
      <Card><CardHeader><CardTitle>Thông tin khảo sát</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div><Label>Tiêu đề</Label><Input defaultValue="Khảo sát đầu khóa" /></div>
          <div><Label>Mô tả</Label><Textarea rows={4} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Lưu</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
