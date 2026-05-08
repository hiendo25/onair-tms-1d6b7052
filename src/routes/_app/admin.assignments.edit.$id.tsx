import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAssignments, useAssignmentMutations } from "@/lib/data-hooks";
import { assignmentSchema, type AssignmentForm } from "@/lib/admin-schemas";
import { ASSIGNMENT_STATUS } from "@/lib/admin-options";

const ASSIGNMENT_TYPE = [
  { value: "quiz", label: "Bài trắc nghiệm (Quiz)" },
  { value: "exam", label: "Bài kiểm tra (Exam)" },
  { value: "homework", label: "Bài tập về nhà" },
  { value: "survey", label: "Khảo sát" },
];

export const Route = createFileRoute("/_app/admin/assignments/edit/$id")({
  head: () => ({ meta: [{ title: "Chỉnh sửa bài kiểm tra — OnAir TMS" }] }),
  component: EditA,
});

function EditA() {
  const { id } = Route.useParams();
  const nav = useNavigate();

  const { data: rows = [], isLoading } = useAssignments();
  const m = useAssignmentMutations();

  const assignment = rows.find((r) => r.id === id);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<AssignmentForm>({ resolver: zodResolver(assignmentSchema) });

  useEffect(() => {
    if (assignment) {
      reset({
        code: assignment.code ?? "",
        title: assignment.title ?? "",
        description: assignment.description ?? "",
        type: (assignment.type as AssignmentForm["type"]) ?? "quiz",
        total_questions: assignment.total_questions ?? 0,
        deadline: assignment.deadline ? assignment.deadline.slice(0, 16) : "",
        status: (assignment.status as AssignmentForm["status"]) ?? "draft",
      });
    }
  }, [assignment, reset]);

  async function onSubmit(data: AssignmentForm) {
    await m.update.mutateAsync({ id, ...data });
    toast.success("Đã cập nhật bài kiểm tra");
    nav({ to: "/admin/assignments" });
  }

  if (isLoading) {
    return (
      <PageContainer title="Chỉnh sửa bài kiểm tra" breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: "Chỉnh sửa" }]}>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </PageContainer>
    );
  }

  if (!assignment) {
    return (
      <PageContainer title="Không tìm thấy" breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }]}>
        <p className="text-muted-foreground">Bài kiểm tra không tồn tại.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Chỉnh sửa bài kiểm tra"
      breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: assignment.title }, { title: "Chỉnh sửa" }]}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle>Thông tin bài kiểm tra</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <Label>Tiêu đề *</Label>
                  <Input {...register("title")} placeholder="VD: Kiểm tra sản phẩm tháng 6" />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Mã bài kiểm tra *</Label>
                  <Input {...register("code")} placeholder="VD: BKT-2024-001" />
                  {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Loại *</Label>
                  <Select value={watch("type")} onValueChange={(v) => setValue("type", v as AssignmentForm["type"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASSIGNMENT_TYPE.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Số câu hỏi</Label>
                  <Input {...register("total_questions")} type="number" min={0} />
                </div>

                <div className="space-y-1">
                  <Label>Deadline</Label>
                  <Input {...register("deadline")} type="datetime-local" />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label>Mô tả</Label>
                  <Textarea {...register("description")} rows={4} placeholder="Mô tả nội dung bài kiểm tra..." />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Cài đặt xuất bản</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Trạng thái *</Label>
                  <Select value={watch("status")} onValueChange={(v) => setValue("status", v as AssignmentForm["status"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASSIGNMENT_STATUS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 space-y-2 text-sm text-muted-foreground border-t">
                  <p>Số câu đã có: <span className="font-medium text-foreground">{assignment.total_questions}</span></p>
                  <p>Đã gán: <span className="font-medium text-foreground">{assignment.assigned_count} học viên</span></p>
                  <p>Đã hoàn thành: <span className="font-medium text-foreground">{assignment.completed_count}</span></p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => nav({ to: "/admin/assignments" })}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu
              </Button>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
