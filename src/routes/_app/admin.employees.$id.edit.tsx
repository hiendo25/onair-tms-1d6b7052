import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/admin/employees/$id/edit")({
  head: () => ({ meta: [{ title: "Chỉnh sửa người dùng — OnAir TMS" }] }),
  component: EditEmp,
});

function EditEmp() {
  const { id } = Route.useParams();
  return (
    <PageContainer
      title="Chỉnh sửa người dùng"
      breadcrumbs={[{ title: "Người dùng", path: "/admin/employees" }, { title: `#${id}` }, { title: "Chỉnh sửa" }]}
    >
      <Card>
        <CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Họ tên</Label><Input defaultValue="Nguyễn Văn A" /></div>
          <div><Label>Email</Label><Input defaultValue="a@onair.vn" /></div>
          <div><Label>SĐT</Label><Input defaultValue="0901234567" /></div>
          <div><Label>Vị trí</Label><Input defaultValue="Nhân viên" /></div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button variant="outline">Hủy</Button><Button>Lưu</Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
