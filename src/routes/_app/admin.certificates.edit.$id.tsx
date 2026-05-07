import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/admin/certificates/edit/$id")({
  head: () => ({ meta: [{ title: "Sửa chứng nhận — OnAir LMS" }] }),
  component: EC,
});
function EC() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Chỉnh sửa chứng nhận" breadcrumbs={[{ title: "Chứng nhận", path: "/admin/certificates" }, { title: `#${id}` }]}>
      <Card><CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div><Label>Tên</Label><Input defaultValue="Chứng nhận hoàn thành"/></div>
          <div><Label>Mã mẫu</Label><Input defaultValue="CERT-001"/></div>
          <div className="flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Lưu</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
