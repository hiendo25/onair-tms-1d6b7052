import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/admin/assignments/$id/grade/$employeeId")({
  head: () => ({ meta: [{ title: "Chấm bài — OnAir TMS" }] }),
  component: GradePage,
});

function GradePage() {
  const { id, employeeId } = Route.useParams();
  return (
    <PageContainer
      title={`Chấm bài kiểm tra`}
      breadcrumbs={[
        { title: "Bài kiểm tra", path: "/admin/assignments" },
        { title: "Chi tiết", path: `/admin/assignments/${id}` },
        { title: `Học viên #${employeeId}` },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="font-semibold">Câu 1. Trình bày khái niệm A?</h3>
              <p className="mt-2 rounded-md border bg-muted/30 p-3 text-sm">Trả lời của học viên ...</p>
              <div className="mt-3 grid grid-cols-[120px_1fr] items-center gap-3">
                <Label>Điểm</Label>
                <Input type="number" defaultValue={8} className="w-24" />
              </div>
              <div className="mt-3 grid grid-cols-[120px_1fr] items-start gap-3">
                <Label>Nhận xét</Label>
                <Textarea rows={3} placeholder="Nhập nhận xét..." />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="text-sm text-muted-foreground">Tổng điểm</div>
            <div className="text-3xl font-bold">8 / 10</div>
            <Button className="w-full">Lưu kết quả chấm</Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/assignments/$id/students" params={{ id }}>Quay lại danh sách</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
