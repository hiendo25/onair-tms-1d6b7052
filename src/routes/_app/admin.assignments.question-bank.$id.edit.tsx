import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/assignments/question-bank/$id/edit")({
  head: () => ({ meta: [{ title: "Sửa câu hỏi — OnAir LMS" }] }),
  component: EditQ,
});
function EditQ() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Chỉnh sửa câu hỏi" breadcrumbs={[{ title: "Ngân hàng câu hỏi", path: "/admin/assignments/question-bank" }, { title: `#${id}` }]}>
      <Card><CardHeader><CardTitle>Câu hỏi</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div><Label>Câu hỏi</Label><Textarea rows={3} defaultValue="React là gì?" /></div>
          <div className="space-y-2">
            {["Thư viện UI","Framework","Ngôn ngữ","Hệ điều hành"].map((a,i)=>(<Input key={i} defaultValue={a}/>))}
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Lưu</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
