import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_app/admin/assignments/$id/assign")({
  head: () => ({ meta: [{ title: "Gán bài kiểm tra — OnAir TMS" }] }),
  component: AssignA,
});
function AssignA() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Gán bài kiểm tra" breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: `#${id}` }, { title: "Gán" }]}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Cấu hình</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Hạn nộp</Label><Input type="datetime-local" /></div>
            <div><Label>Thời gian (phút)</Label><Input type="number" defaultValue={60} /></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle>Người được gán</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Array.from({length:5}).map((_,i)=>(
              <label key={i} className="flex items-center gap-2"><Checkbox />Nhân viên {i+1}</label>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end gap-2 mt-4"><Button variant="outline">Hủy</Button><Button>Gán</Button></div>
    </PageContainer>
  );
}
