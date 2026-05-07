import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_app/admin/report/overview")({
  head: () => ({ meta: [{ title: "Báo cáo tổng quan — OnAir TMS" }] }),
  component: () => (
    <PageContainer title="Báo cáo tổng quan" breadcrumbs={[{ title: "Báo cáo" }, { title: "Tổng quan" }]}>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Báo cáo tổng quan</h2>
          <p className="text-sm text-muted-foreground">Tổng hợp số liệu hệ thống đào tạo</p>
        </CardContent>
      </Card>
    </PageContainer>
  ),
});
