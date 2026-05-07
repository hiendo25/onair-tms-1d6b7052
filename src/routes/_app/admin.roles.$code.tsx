import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin/roles/$code")({
  head: () => ({ meta: [{ title: "Chi tiết vai trò — OnAir LMS" }] }),
  component: RoleDetail,
});

function RoleDetail() {
  const { code } = Route.useParams();
  return (
    <PageContainer
      title={`Vai trò: ${code}`}
      breadcrumbs={[{ title: "Vai trò", path: "/admin/roles" }, { title: code }]}
      actions={<Button size="sm">Lưu thay đổi</Button>}
    >
      <Card>
        <CardHeader><CardTitle>Phân quyền</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {["Người dùng", "Lớp học", "Khóa học", "Kế hoạch", "Báo cáo"].map((m) => (
            <div key={m} className="border rounded-lg p-3">
              <div className="font-medium mb-2">{m}</div>
              <div className="flex flex-wrap gap-4 text-sm">
                {["Xem", "Tạo", "Sửa", "Xóa"].map((p) => (
                  <label key={p} className="flex items-center gap-2"><Checkbox defaultChecked={p==="Xem"} />{p}</label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
