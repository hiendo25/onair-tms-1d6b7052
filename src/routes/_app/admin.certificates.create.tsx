import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Save, Award } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/admin/certificates/create")({
  head: () => ({ meta: [{ title: "Tạo chứng nhận — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Tạo chứng nhận"
      breadcrumbs={[{ title: "Chứng nhận", path: "/admin/certificates" }, { title: "Tạo mới" }]}
      actions={
        <>
          <Button asChild variant="outline" size="sm"><Link to="/admin/certificates"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button>
          <Button size="sm"><Save className="h-4 w-4" />Lưu</Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin chứng nhận</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Tên chứng nhận *</Label><Input placeholder="VD: Chứng nhận hoàn thành Onboarding" /></div>
            <div className="space-y-1.5">
              <Label>Mẫu thiết kế</Label>
              <Select defaultValue="default"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Mặc định</SelectItem>
                  <SelectItem value="gold">Vàng</SelectItem>
                  <SelectItem value="silver">Bạc</SelectItem>
                </SelectContent></Select>
            </div>
            <div className="space-y-1.5"><Label>Mã chứng nhận</Label><Input placeholder="CERT-001" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Xem trước</CardTitle></CardHeader>
          <CardContent>
            <div className="relative flex h-64 items-center justify-center rounded bg-gradient-to-br from-amber-50 to-amber-200">
              <div className="absolute inset-4 rounded border-2 border-amber-300/60" />
              <div className="text-center">
                <Award className="mx-auto h-12 w-12 text-amber-600" />
                <div className="mt-2 text-xs uppercase tracking-widest text-amber-700">Certificate</div>
                <div className="mt-1 text-xl font-serif text-amber-900">[Tên chứng nhận]</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  ),
});
