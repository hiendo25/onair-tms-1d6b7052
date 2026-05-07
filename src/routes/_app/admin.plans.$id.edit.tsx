import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/plans/$id/edit")({
  head: () => ({ meta: [{ title: "Chỉnh sửa kế hoạch — OnAir LMS" }] }),
  component: EditPlan,
});

function EditPlan() {
  const { id } = Route.useParams();
  return (
    <PageContainer
      title="Chỉnh sửa kế hoạch"
      breadcrumbs={[{ title: "Kế hoạch", path: "/admin/plans" }, { title: `#${id}` }, { title: "Sửa" }]}
    >
      <Card>
        <CardHeader><CardTitle>Thông tin kế hoạch</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Tên kế hoạch</Label><Input defaultValue="Kế hoạch Q1/2026" /></div>
          <div><Label>Mã</Label><Input defaultValue={`KH-${id}`} /></div>
          <div className="md:col-span-2"><Label>Mô tả</Label><Textarea rows={4} /></div>
          <div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Lưu</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
