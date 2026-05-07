import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Award, Download, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_CERTIFICATES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/certificates")({
  head: () => ({ meta: [{ title: "Chứng nhận — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Quản lý chứng nhận"
      breadcrumbs={[{ title: "Chứng nhận" }]}
      actions={<Button asChild size="sm"><Link to="/admin/certificates/create"><Plus className="h-4 w-4" />Tạo chứng nhận</Link></Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_CERTIFICATES.map(c => (
          <Card key={c.id} className="overflow-hidden p-0">
            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-amber-50 to-amber-200">
              <div className="absolute inset-3 rounded border-2 border-amber-300/60" />
              <Award className="h-14 w-14 text-amber-600" />
            </div>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{c.name}</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="outline">Mẫu: {c.template}</Badge>
                <span>Đã cấp: {c.issued}</span>
              </div>
              <div className="flex justify-end pt-1">
                <Button variant="ghost" size="sm"><Download className="h-4 w-4" />Tải mẫu</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  ),
});
