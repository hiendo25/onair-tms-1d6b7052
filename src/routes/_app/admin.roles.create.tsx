import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_app/admin/roles/create")({
  head: () => ({ meta: [{ title: "Tạo vai trò — OnAir TMS" }] }),
  component: () => (
    <PageContainer
      title="Tạo vai trò mới"
      breadcrumbs={[{ title: "Vai trò", path: "/admin/roles" }, { title: "Tạo mới" }]}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Tên vai trò *</Label><Input /></div>
            <div><Label>Mã *</Label><Input /></div>
            <div><Label>Mô tả</Label><Textarea rows={4} /></div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Phân quyền</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {["Người dùng", "Lớp học", "Khóa học", "Kế hoạch", "Báo cáo"].map((m) => (
              <div key={m} className="border rounded-lg p-3">
                <div className="font-medium mb-2">{m}</div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {["Xem", "Tạo", "Sửa", "Xóa"].map((p) => (
                    <label key={p} className="flex items-center gap-2"><Checkbox />{p}</label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Tạo</Button></div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  ),
});
