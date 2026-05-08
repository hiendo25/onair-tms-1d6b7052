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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useClassrooms, useClassroomMutations } from "@/lib/data-hooks";
import { classroomSchema, type ClassroomForm } from "@/lib/admin-schemas";
import { CLASSROOM_TYPE, CLASSROOM_STATUS } from "@/lib/admin-options";

export const Route = createFileRoute("/_app/admin/class-room/$id/edit")({
  head: () => ({ meta: [{ title: "Chỉnh sửa lớp học — OnAir TMS" }] }),
  component: EditCR,
});

function EditCR() {
  const { id } = Route.useParams();
  const nav = useNavigate();

  const { data: rows = [], isLoading } = useClassrooms();
  const m = useClassroomMutations();

  const cr = rows.find((r) => r.id === id);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<ClassroomForm>({ resolver: zodResolver(classroomSchema) });

  useEffect(() => {
    if (cr) {
      reset({
        code: cr.code ?? "",
        title: cr.title ?? "",
        description: cr.description ?? "",
        instructor: cr.instructor ?? "",
        location: cr.location ?? "",
        capacity: cr.capacity ?? 0,
        start_date: cr.start_at ? cr.start_at.slice(0, 10) : "",
        end_date: cr.end_at ? cr.end_at.slice(0, 10) : "",
        type: (cr.type as ClassroomForm["type"]) ?? "offline",
        status: (cr.status as ClassroomForm["status"]) ?? "upcoming",
      });
    }
  }, [cr, reset]);

  async function onSubmit(data: ClassroomForm) {
    await m.update.mutateAsync({ id, ...data });
    toast.success("Đã cập nhật lớp học");
    nav({ to: "/admin/class-room" });
  }

  if (isLoading) {
    return (
      <PageContainer title="Chỉnh sửa lớp học" breadcrumbs={[{ title: "Lớp học", path: "/admin/class-room" }, { title: "Chỉnh sửa" }]}>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </PageContainer>
    );
  }

  if (!cr) {
    return (
      <PageContainer title="Không tìm thấy" breadcrumbs={[{ title: "Lớp học", path: "/admin/class-room" }]}>
        <p className="text-muted-foreground">Lớp học không tồn tại.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Chỉnh sửa lớp học"
      breadcrumbs={[{ title: "Lớp học", path: "/admin/class-room" }, { title: cr.title }, { title: "Chỉnh sửa" }]}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Thông tin lớp học</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Tên lớp học *</Label>
              <Input {...register("title")} placeholder="VD: Đào tạo nhân viên mới" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Mã lớp *</Label>
              <Input {...register("code")} placeholder="VD: LH-2024-001" />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Giảng viên</Label>
              <Input {...register("instructor")} placeholder="Tên giảng viên" />
            </div>

            <div className="space-y-1">
              <Label>Địa điểm</Label>
              <Input {...register("location")} placeholder="VD: Phòng họp A, Zoom..." />
            </div>

            <div className="space-y-1">
              <Label>Sức chứa</Label>
              <Input {...register("capacity")} type="number" min={0} />
            </div>

            <div className="space-y-1">
              <Label>Hình thức *</Label>
              <Select value={watch("type")} onValueChange={(v) => setValue("type", v as ClassroomForm["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLASSROOM_TYPE.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Ngày bắt đầu</Label>
              <Input {...register("start_date")} type="date" />
            </div>

            <div className="space-y-1">
              <Label>Ngày kết thúc</Label>
              <Input {...register("end_date")} type="date" />
              {errors.end_date && <p className="text-xs text-destructive">{errors.end_date.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Trạng thái *</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as ClassroomForm["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLASSROOM_STATUS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <Label>Mô tả</Label>
              <Textarea {...register("description")} rows={4} placeholder="Mô tả nội dung lớp học..." />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => nav({ to: "/admin/class-room" })}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageContainer>
  );
}
