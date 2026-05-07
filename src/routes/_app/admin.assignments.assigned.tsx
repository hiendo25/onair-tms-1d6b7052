import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/admin/assignments/assigned")({
  head: () => ({ meta: [{ title: "Bài KT đã gán — OnAir TMS" }] }),
  component: () => (
    <PageContainer title="Bài kiểm tra đã gán" breadcrumbs={[{ title: "Bài kiểm tra" }, { title: "Đã gán" }]}>
      <Card className="p-8 text-center text-sm text-muted-foreground">
        Danh sách bài kiểm tra đã được giao cho lớp học và học viên.
      </Card>
    </PageContainer>
  ),
});
