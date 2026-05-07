import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Download } from "lucide-react";

export const Route = createFileRoute("/_app/admin/employees/import")({
  head: () => ({ meta: [{ title: "Import người dùng — OnAir TMS" }] }),
  component: () => (
    <PageContainer
      title="Import người dùng"
      breadcrumbs={[{ title: "Người dùng", path: "/admin/employees" }, { title: "Import" }]}
      actions={<Button variant="outline" size="sm"><Download className="h-4 w-4" />Tải file mẫu</Button>}
    >
      <Card>
        <CardHeader><CardTitle>Tải lên file Excel</CardTitle></CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <UploadCloud className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Kéo thả file vào đây hoặc click để chọn</p>
            <p className="text-sm text-muted-foreground mt-1">Hỗ trợ .xlsx, .csv</p>
            <Button className="mt-4">Chọn file</Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  ),
});
