import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/my-assignments/$id/result/$employeeId")({
  head: () => ({ meta: [{ title: "Kết quả của tôi — OnAir TMS" }] }),
  component: R,
});
function R() {
  const { id, employeeId } = Route.useParams();
  return (
    <PageContainer title="Kết quả bài kiểm tra" breadcrumbs={[{ title: "Bài KT", path: "/my-assignments" }, { title: `#${id}` }, { title: "Kết quả" }]}>
      <div className="grid gap-3 md:grid-cols-3 mb-4">
        {[["Điểm","85/100"],["Xếp loại","Giỏi"],["Thời gian","42 phút"]].map(([l,v])=>(
          <Card key={l}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle>Câu trả lời (HV {employeeId})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({length:5}).map((_,i)=>(
            <div key={i} className="border rounded-lg p-3">
              <div className="text-sm font-medium">Câu {i+1}</div>
              <Badge className="mt-2" variant={i%4===0?"destructive":"default"}>{i%4===0?"Sai":"Đúng"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
