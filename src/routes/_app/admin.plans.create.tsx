import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/admin/plans/create")({
  head: () => ({ meta: [{ title: "Tạo kế hoạch — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Tạo kế hoạch đào tạo"
      breadcrumbs={[{ title: "Kế hoạch", path: "/admin/plans" }, { title: "Tạo mới" }]}
      actions={
        <>
          <Button asChild variant="outline" size="sm"><Link to="/admin/plans"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button>
          <Button size="sm"><Save className="h-4 w-4" />Lưu</Button>
        </>
      }
    >
      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin kế hoạch</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Tên kế hoạch *</Label><Input placeholder="VD: Kế hoạch đào tạo Q3/2026" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5"><Label>Năm</Label><Input type="number" defaultValue={2026} /></div>
            <div className="space-y-1.5">
              <Label>Quý</Label>
              <Select defaultValue="3"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[1,2,3,4].map(q => <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1.5"><Label>Ngân sách dự kiến</Label><Input placeholder="0đ" /></div>
          </div>
          <div className="space-y-1.5"><Label>Mục tiêu</Label><Textarea rows={4} placeholder="Mục tiêu của kế hoạch..." /></div>
        </CardContent>
      </Card>
    </PageContainer>
  ),
});
