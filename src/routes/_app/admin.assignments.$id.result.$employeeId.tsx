import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/assignments/$id/result/$employeeId")({
  head: () => ({ meta: [{ title: "Kết quả bài KT — OnAir TMS" }] }),
  component: Result,
});
function Result() {
  const { id, employeeId } = Route.useParams();
  return (
    <PageContainer title="Kết quả bài kiểm tra" breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: `#${id}` }, { title: `HV ${employeeId}` }]}>
      <div className="grid gap-3 md:grid-cols-4 mb-4">
        {[["Điểm","85/100"],["Xếp loại","Giỏi"],["Thời gian","42 phút"],["Trạng thái","Đạt"]].map(([l,v])=>(
          <Card key={l}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle>Câu trả lời</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({length:5}).map((_,i)=>(
            <div key={i} className="border rounded-lg p-3">
              <div className="text-sm font-medium mb-1">Câu {i+1}: Câu hỏi mẫu?</div>
              <div className="text-sm text-muted-foreground">Trả lời: Đáp án {String.fromCharCode(65+i%4)}</div>
              <Badge className="mt-2" variant={i%4===0?"destructive":"default"}>{i%4===0?"Sai":"Đúng"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
