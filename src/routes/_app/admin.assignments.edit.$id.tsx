import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/assignments/edit/$id")({
  head: () => ({ meta: [{ title: "Chỉnh sửa bài KT — OnAir TMS" }] }),
  component: EditA,
});
function EditA() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Chỉnh sửa bài kiểm tra" breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: `#${id}` }, { title: "Sửa" }]}>
      <Card><CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div><Label>Tiêu đề</Label><Input defaultValue="Kiểm tra cuối kỳ" /></div>
          <div><Label>Mô tả</Label><Textarea rows={4} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Lưu</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
