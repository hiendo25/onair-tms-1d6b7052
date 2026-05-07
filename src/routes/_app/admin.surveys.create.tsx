import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Save, Plus, X, GripVertical } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/admin/surveys/create")({
  head: () => ({ meta: [{ title: "Tạo khảo sát — OnAir TMS" }] }),
  component: CreateSurvey,
});

function CreateSurvey() {
  const [questions, setQuestions] = useState([
    { text: "Bạn đánh giá chất lượng khoá học như thế nào?", type: "single" },
    { text: "Bạn có đề xuất gì để cải thiện khoá học?", type: "essay" },
  ]);
  return (
    <PageContainer
      title="Tạo khảo sát"
      breadcrumbs={[{ title: "Khảo sát", path: "/admin/surveys" }, { title: "Tạo mới" }]}
      actions={
        <>
          <Button asChild variant="outline" size="sm"><Link to="/admin/surveys"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button>
          <Button size="sm"><Save className="h-4 w-4" />Lưu</Button>
        </>
      }
    >
      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin chung</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Tiêu đề khảo sát *</Label><Input placeholder="VD: Khảo sát chất lượng đào tạo Q3/2026" /></div>
          <div className="space-y-1.5"><Label>Mô tả</Label><Textarea rows={3} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Câu hỏi</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setQuestions([...questions, { text: "", type: "single" }])}>
            <Plus className="h-4 w-4" />Thêm câu hỏi
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-3 rounded-md border p-3">
              <GripVertical className="mt-2 h-4 w-4 text-muted-foreground cursor-grab" />
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
              <div className="flex-1 space-y-2">
                <Input defaultValue={q.text} placeholder="Nhập câu hỏi..." />
                <Select defaultValue={q.type}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Một đáp án</SelectItem>
                    <SelectItem value="multiple">Nhiều đáp án</SelectItem>
                    <SelectItem value="rating">Thang điểm</SelectItem>
                    <SelectItem value="essay">Tự luận</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
