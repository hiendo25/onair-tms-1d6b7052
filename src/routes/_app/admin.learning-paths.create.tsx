import { createFileRoute } from "@tanstack/react-router";
import { Plus, GripVertical, X } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export const Route = createFileRoute("/_app/admin/learning-paths/create")({
  head: () => ({ meta: [{ title: "Tạo lộ trình — OnAir TMS" }] }),
  component: CreateLP,
});

function CreateLP() {
  const [phases, setPhases] = useState([
    { title: "Giai đoạn 1", weeks: 2 },
    { title: "Giai đoạn 2", weeks: 4 },
  ]);
  return (
    <PageContainer
      title="Tạo lộ trình học tập"
      breadcrumbs={[{ title: "Lộ trình", path: "/admin/learning-paths" }, { title: "Tạo mới" }]}
      actions={<Button size="sm">Lưu lộ trình</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Thông tin chung</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Tên lộ trình *</Label><Input placeholder="VD: Lộ trình quản lý cấp trung" /></div>
            <div className="space-y-1.5"><Label>Mô tả</Label><Textarea rows={3} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Cấu hình</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">Trạng thái: <span className="text-foreground">Nháp</span></p>
            <p className="text-muted-foreground">Tổng số tuần: <span className="text-foreground">{phases.reduce((s, p) => s + p.weeks, 0)}</span></p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Các giai đoạn</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setPhases([...phases, { title: `Giai đoạn ${phases.length + 1}`, weeks: 2 }])}>
              <Plus className="h-4 w-4" />Thêm giai đoạn
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {phases.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </div>
                <Input className="flex-1" defaultValue={p.title} />
                <div className="flex items-center gap-1">
                  <Input type="number" defaultValue={p.weeks} className="w-20" />
                  <span className="text-sm text-muted-foreground">tuần</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPhases(phases.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
