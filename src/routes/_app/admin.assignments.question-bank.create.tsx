import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/admin/assignments/question-bank/create")({
  head: () => ({ meta: [{ title: "Tạo câu hỏi — OnAir TMS" }] }),
  component: () => (
    <PageContainer title="Tạo câu hỏi" breadcrumbs={[{ title: "Ngân hàng câu hỏi", path: "/admin/assignments/question-bank" }, { title: "Tạo mới" }]}>
      <Card><CardHeader><CardTitle>Nội dung câu hỏi</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div><Label>Loại câu hỏi</Label>
            <Select defaultValue="radio"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="radio">Chọn 1 đáp án</SelectItem>
                <SelectItem value="checkbox">Chọn nhiều</SelectItem>
                <SelectItem value="text">Tự luận</SelectItem>
                <SelectItem value="truefalse">Đúng/Sai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Câu hỏi *</Label><Textarea rows={3} /></div>
          <div><Label>Đáp án</Label>
            <div className="space-y-2">
              {[1,2,3,4].map(n=>(<div key={n} className="flex items-center gap-2"><Input placeholder={`Đáp án ${n}`} /></div>))}
            </div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Tạo</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  ),
});
