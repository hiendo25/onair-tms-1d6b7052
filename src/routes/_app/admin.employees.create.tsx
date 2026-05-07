import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/admin/employees/create")({
  head: () => ({ meta: [{ title: "Tạo người dùng — OnAir TMS" }] }),
  component: () => (
    <PageContainer
      title="Tạo người dùng mới"
      breadcrumbs={[{ title: "Người dùng", path: "/admin/employees" }, { title: "Tạo mới" }]}
    >
      <Card>
        <CardHeader><CardTitle>Thông tin người dùng</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Họ tên *</Label><Input placeholder="Nhập họ tên" /></div>
          <div><Label>Email *</Label><Input type="email" placeholder="email@onair.vn" /></div>
          <div><Label>Số điện thoại</Label><Input /></div>
          <div><Label>Mã nhân viên</Label><Input /></div>
          <div><Label>Chi nhánh</Label>
            <Select><SelectTrigger><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
              <SelectContent><SelectItem value="hcm">HCM</SelectItem><SelectItem value="hn">HN</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Phòng ban</Label>
            <Select><SelectTrigger><SelectValue placeholder="Chọn phòng ban" /></SelectTrigger>
              <SelectContent><SelectItem value="it">Kỹ thuật</SelectItem><SelectItem value="hr">Nhân sự</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button variant="outline">Hủy</Button>
            <Button>Tạo người dùng</Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  ),
});
